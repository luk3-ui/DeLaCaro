#!/usr/bin/env bash
# Crear/reconectar instancia WhatsApp en Evolution API
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AUTO_YES=0
[[ "${1:-}" == "-y" || "${1:-}" == "--yes" ]] && AUTO_YES=1

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PORT="${EVOLUTION_PORT:-8081}"
APIKEY="${EVOLUTION_API_KEY:-comercio-ia-evolution-key-local}"
INSTANCE="${EVOLUTION_INSTANCE:-comercio-ia}"
BASE="http://localhost:${PORT}"
WEBHOOK_URL="${N8N_WEBHOOK_URL:-http://n8n:5678/webhook/whatsapp-incoming}"

run_compose() {
  if docker ps &>/dev/null; then docker compose "$@"; else sudo docker compose "$@"; fi
}

state() {
  curl -s "${BASE}/instance/connectionState/${INSTANCE}" -H "apikey: ${APIKEY}" 2>/dev/null || echo '{}'
}

instance_exists() {
  local resp
  resp=$(curl -s "${BASE}/instance/fetchInstances" -H "apikey: ${APIKEY}" 2>/dev/null || echo '[]')
  echo "$resp" | grep -q "\"name\":\"${INSTANCE}\"" || \
    echo "$resp" | grep -q "\"instanceName\":\"${INSTANCE}\"" || \
    echo "$resp" | grep -q "\"${INSTANCE}\""
}

set_webhook() {
  curl -s -X POST "${BASE}/webhook/set/${INSTANCE}" \
    -H "apikey: ${APIKEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"webhook\": {
        \"enabled\": true,
        \"url\": \"${WEBHOOK_URL}\",
        \"webhookByEvents\": false,
        \"webhookBase64\": false,
        \"events\": [\"MESSAGES_UPSERT\"]
      }
    }" >/dev/null || true
}

save_qr_from_response() {
  local resp="$1"
  echo "$resp" | python3 -c "
import sys, json, base64
raw = sys.stdin.read()
try:
    d = json.loads(raw)
except json.JSONDecodeError:
    sys.exit(1)
b64 = d.get('base64') or d.get('qrcode', {}).get('base64') or ''
if isinstance(b64, str) and b64.startswith('data:'):
    b64 = b64.split(',', 1)[1]
if b64:
    open('whatsapp-qr.png', 'wb').write(base64.b64decode(b64))
    print('   QR guardado: whatsapp-qr.png')
    sys.exit(0)
pair = d.get('pairingCode') or d.get('code')
if pair:
    print(f'   Código de vinculación: {pair}')
    sys.exit(0)
# create a veces devuelve QR anidado
q = d.get('qrcode')
if isinstance(q, dict) and q.get('base64'):
    b64 = q['base64']
    if b64.startswith('data:'):
        b64 = b64.split(',', 1)[1]
    open('whatsapp-qr.png', 'wb').write(base64.b64decode(b64))
    print('   QR guardado: whatsapp-qr.png')
    sys.exit(0)
sys.exit(1)
" 2>/dev/null
}

echo "=== Reconectar WhatsApp (Evolution) ==="
echo "Manager: ${BASE}/manager"
echo "Instancia: ${INSTANCE}"
echo ""

# Evolution debe estar arriba
if ! curl -s -o /dev/null -w "%{http_code}" "${BASE}" | grep -qE '200|301|302|404'; then
  echo "ERROR: Evolution no responde en ${BASE}"
  echo "Corré: npm run stack:start"
  exit 1
fi

CURRENT=$(state)
echo "Estado actual: ${CURRENT}"

if echo "$CURRENT" | grep -qiE '"state"\s*:\s*"open"'; then
  echo ""
  echo "OK — WhatsApp ya está conectado (open)."
  exit 0
fi

MISSING=0
if echo "$CURRENT" | grep -qi 'does not exist'; then
  MISSING=1
  echo ""
  echo "La instancia '${INSTANCE}' NO existe — hay que crearla."
elif ! instance_exists; then
  MISSING=1
  echo ""
  echo "La instancia '${INSTANCE}' no aparece en fetchInstances — hay que crearla."
else
  echo ""
  echo "WhatsApp NO está conectado (sin state 'open')."
fi

if [[ "$AUTO_YES" -eq 0 ]]; then
  read -r -p "¿Continuar (crear/reconectar + QR)? [s/N] " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[sSyY] ]]; then
    echo "Cancelado."
    exit 0
  fi
fi

echo ""
if [[ "$MISSING" -eq 0 ]]; then
  echo "1. Borrar instancia (logout rompe mensajes en v2.3.7 — usamos delete)..."
  curl -s -X DELETE "${BASE}/instance/delete/${INSTANCE}" -H "apikey: ${APIKEY}" >/dev/null || true
  MISSING=1
  sleep 2
fi

echo "2. Reiniciar Evolution..."
run_compose restart evolution-api
echo "   Esperando 8s..."
sleep 8

QR_OK=0

if [[ "$MISSING" -eq 1 ]]; then
  echo "3. Crear instancia..."
  CREATE_RESP=$(curl -s -X POST "${BASE}/instance/create" \
    -H "apikey: ${APIKEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"instanceName\": \"${INSTANCE}\",
      \"integration\": \"WHATSAPP-BAILEYS\",
      \"qrcode\": true,
      \"groupsIgnore\": true,
      \"webhook\": {
        \"url\": \"${WEBHOOK_URL}\",
        \"byEvents\": false,
        \"base64\": false,
        \"events\": [\"MESSAGES_UPSERT\"]
      }
    }")
  echo "   $(echo "$CREATE_RESP" | head -c 200)..."
  if save_qr_from_response "$CREATE_RESP"; then
    QR_OK=1
  fi
else
  echo "3. Reconfigurar webhook..."
  set_webhook
fi

if [[ "$QR_OK" -eq 0 ]]; then
  echo "4. Solicitar QR (hasta 60s)..."
  for i in $(seq 1 20); do
    RESP=$(curl -s "${BASE}/instance/connect/${INSTANCE}" -H "apikey: ${APIKEY}")
    if save_qr_from_response "$RESP"; then
      QR_OK=1
      break
    fi
    if echo "$RESP" | grep -qi 'does not exist'; then
      echo "   Instancia desapareció — creando de nuevo..."
      CREATE_RESP=$(curl -s -X POST "${BASE}/instance/create" \
        -H "apikey: ${APIKEY}" \
        -H "Content-Type: application/json" \
        -d "{\"instanceName\":\"${INSTANCE}\",\"integration\":\"WHATSAPP-BAILEYS\",\"qrcode\":true}")
      save_qr_from_response "$CREATE_RESP" && QR_OK=1 && break
    fi
    echo "   intento ${i}/20 — $(echo "$RESP" | head -c 120)"
    sleep 3
  done
fi

if [[ "$QR_OK" -eq 0 ]]; then
  echo ""
  echo "   No salió QR por API. Abrí el Manager:"
  echo "   ${BASE}/manager"
  echo "   → Create instance → nombre: ${INSTANCE} → escanear QR"
fi

echo ""
echo "5. Escaneá el QR: whatsapp-qr.png o ${BASE}/manager"
echo "   WhatsApp → Dispositivos vinculados → Vincular dispositivo"
echo ""
echo "6. Esperando conexión (hasta 2 min)..."

for i in $(seq 1 24); do
  CURRENT=$(state)
  if echo "$CURRENT" | grep -qiE '"state"\s*:\s*"open"'; then
    echo ""
    echo "   CONECTADO — state: open"
    set_webhook
    echo ""
    echo "Listo. Probá: mandá 'hola test' desde OTRO teléfono."
    echo "Verificá: npm run webhook:fix  (debe decir state: open)"
    exit 0
  fi
  if echo "$CURRENT" | grep -qi 'does not exist'; then
    ST="instancia no existe"
  else
    ST=$(echo "$CURRENT" | grep -oE '"state"\s*:\s*"[^"]+"' | head -1 | tr -d ' "' || echo "sin state")
  fi
  echo "   ${i}/24 — ${ST}"
  sleep 5
done

echo ""
echo "Sin conexión aún. Probá:"
echo "  1. ${BASE}/manager → crear/conectar '${INSTANCE}'"
echo "  2. .env → CONFIG_SESSION_PHONE_VERSION=2.3000.1040081378"
echo "  3. docker compose up -d evolution-api --force-recreate"
echo "  4. npm run whatsapp:reconnect"
