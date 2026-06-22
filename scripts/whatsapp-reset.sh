#!/usr/bin/env bash
# Reset TOTAL WhatsApp — borra instancia y crea de cero (fix mensajes que no llegan)
# NO usa logout (en v2.3.7 logout+reconnect rompe mensajes entrantes)
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

save_qr() {
  local resp="$1"
  echo "$resp" | python3 -c "
import sys, json, base64
d = json.loads(sys.stdin.read())
for key in ('base64',):
    b64 = d.get(key) or (d.get('qrcode') or {}).get('base64') or ''
    if b64:
        if b64.startswith('data:'): b64 = b64.split(',',1)[1]
        open('whatsapp-qr.png','wb').write(base64.b64decode(b64))
        print('   QR → whatsapp-qr.png')
        raise SystemExit(0)
pair = d.get('pairingCode') or d.get('code')
if pair:
    print(f'   Código vinculación: {pair}')
    raise SystemExit(0)
raise SystemExit(1)
" 2>/dev/null
}

echo "=== RESET WhatsApp (Evolution) ==="
echo "Instancia: ${INSTANCE}"
echo "Manager:   ${BASE}/manager"
echo ""
echo "Esto BORRA la instancia y la crea de nuevo."
echo "(logout/reconnect rompe mensajes entrantes en v2.3.7)"
echo ""

if [[ "$AUTO_YES" -eq 0 ]]; then
  read -r -p "¿Continuar? [s/N] " CONFIRM
  [[ "$CONFIRM" =~ ^[sSyY] ]] || exit 0
fi

echo ""
echo "1. Borrar instancia '${INSTANCE}'..."
curl -s -X DELETE "${BASE}/instance/delete/${INSTANCE}" -H "apikey: ${APIKEY}" >/dev/null || true
sleep 2

echo "2. Reiniciar Evolution (limpia sesión Baileys en memoria)..."
run_compose up -d evolution-api --force-recreate
echo "   Esperando 12s..."
sleep 12

echo "3. Crear instancia nueva..."
CREATE=$(curl -s -X POST "${BASE}/instance/create" \
  -H "apikey: ${APIKEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"instanceName\": \"${INSTANCE}\",
    \"integration\": \"WHATSAPP-BAILEYS\",
    \"qrcode\": true,
    \"groupsIgnore\": true,
    \"syncFullHistory\": false,
    \"readMessages\": false,
    \"alwaysOnline\": true,
    \"webhook\": {
      \"url\": \"${WEBHOOK_URL}\",
      \"byEvents\": false,
      \"base64\": false,
      \"events\": [\"MESSAGES_UPSERT\"]
    }
  }")
echo "   $(echo "$CREATE" | head -c 180)..."

QR_OK=0
save_qr "$CREATE" && QR_OK=1 || true

if [[ "$QR_OK" -eq 0 ]]; then
  echo "4. Pedir QR..."
  for i in $(seq 1 15); do
    RESP=$(curl -s "${BASE}/instance/connect/${INSTANCE}" -H "apikey: ${APIKEY}")
    save_qr "$RESP" && QR_OK=1 && break
    echo "   intento $i/15..."
    sleep 3
  done
fi

echo ""
echo "5. Escaneá QR: whatsapp-qr.png o ${BASE}/manager"
echo "   WhatsApp → Dispositivos vinculados"
echo ""
echo "6. Esperando state: open (2 min)..."

for i in $(seq 1 24); do
  CURRENT=$(state)
  if echo "$CURRENT" | grep -qiE '"state"\s*:\s*"open"'; then
    echo ""
    echo "   CONECTADO"
    curl -s -X POST "${BASE}/webhook/set/${INSTANCE}" \
      -H "apikey: ${APIKEY}" -H "Content-Type: application/json" \
      -d "{\"webhook\":{\"enabled\":true,\"url\":\"${WEBHOOK_URL}\",\"webhookByEvents\":false,\"webhookBase64\":false,\"events\":[\"MESSAGES_UPSERT\"]}}" >/dev/null
    echo ""
    echo "=== Listo ==="
    echo "1. N8N → workflow Published"
    echo "2. Desde OTRO celular mandá WhatsApp al número vinculado"
    echo "3. N8N → Executions → Production (debe aparecer user-agent: axios)"
    echo "4. Verificá: npm run whatsapp:diagnose"
    exit 0
  fi
  ST=$(echo "$CURRENT" | grep -oE '"state"\s*:\s*"[^"]+"' | head -1 || echo "esperando...")
  echo "   $i/24 — $ST"
  sleep 5
done

echo ""
echo "No conectó a tiempo. Abrí ${BASE}/manager y escaneá el QR."
