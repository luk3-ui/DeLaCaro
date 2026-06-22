#!/usr/bin/env bash
# Reconfigura el webhook de Evolution → N8N (instancia existente)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PORT="${EVOLUTION_PORT:-8081}"
APIKEY="${EVOLUTION_API_KEY:-comercio-ia-evolution-key-local}"
INSTANCE="${EVOLUTION_INSTANCE:-comercio-ia}"
WEBHOOK_URL="${N8N_WEBHOOK_URL:-http://n8n:5678/webhook/whatsapp-incoming}"
BASE="http://localhost:${PORT}"

run_docker() {
  if docker ps &>/dev/null; then docker "$@"; else sudo docker "$@"; fi
}

echo "=== Fix Evolution webhook → N8N ==="
echo "Evolution:  ${BASE}"
echo "Instancia:  ${INSTANCE}"
echo "Webhook URL (desde Evolution): ${WEBHOOK_URL}"
echo ""

echo "1. Estado de conexión WhatsApp"
STATE=$(curl -s "${BASE}/instance/connectionState/${INSTANCE}" -H "apikey: ${APIKEY}" || true)
echo "   ${STATE}"
if echo "$STATE" | grep -qiE '"state"\s*:\s*"open"'; then
  echo "   OK — WhatsApp conectado"
else
  echo "   *** BLOQUEADO — state NO es 'open'. Sin esto NO llegan mensajes reales. ***"
  echo "   Corré: npm run whatsapp:reconnect"
  echo "   O abrí: ${BASE}/manager"
fi
echo ""

echo "2. Webhook actual de la instancia"
FIND=$(curl -s "${BASE}/webhook/find/${INSTANCE}" -H "apikey: ${APIKEY}" || true)
echo "   ${FIND}"
echo ""

echo "3. Configurar webhook en la instancia (webhookByEvents=false)"
RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST "${BASE}/webhook/set/${INSTANCE}" \
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
  }")
echo "$RESP" | sed '$d'
CODE=$(echo "$RESP" | tail -1 | cut -d: -f2)
if [[ "$CODE" != "200" && "$CODE" != "201" ]]; then
  echo "   ERROR HTTP ${CODE}"
  exit 1
fi
echo "   OK"
echo ""

echo "4. Probar que N8N recibe POST (desde red Docker)"
TEST_PAYLOAD='{"event":"messages.upsert","instance":"'"${INSTANCE}"'","data":{"key":{"remoteJid":"5490000000000@s.whatsapp.net","fromMe":false,"id":"test-fix"},"message":{"conversation":"test webhook fix"}}}'
if run_docker exec comercio-ia-whatsapp wget -qO- \
  --header='Content-Type: application/json' \
  --post-data="$TEST_PAYLOAD" \
  "http://n8n:5678/webhook/whatsapp-incoming" 2>/dev/null; then
  echo ""
  echo "   OK — N8N respondió (revisá Executions en http://localhost:5678)"
else
  echo "   AVISO — no se pudo probar desde el contenedor (¿workflow Published?)"
fi
echo ""

echo "5. Recordatorio N8N"
echo "   - Workflow **Published** (Shift+P). NO uses 'Test workflow' para WhatsApp real."
echo "   - Mensajes reales → menú **Executions** → filtro **Production**"
echo "   - Mandá desde OTRO teléfono al número conectado (no el que escaneó el QR)"
echo "   - Si Responder falla: npm run n8n:env-check"
echo ""
