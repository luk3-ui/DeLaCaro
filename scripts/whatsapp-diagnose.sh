#!/usr/bin/env bash
# Diagnóstico: por qué no llegan mensajes reales de WhatsApp a N8N
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
BASE="http://localhost:${PORT}"

run_docker() {
  if docker ps &>/dev/null; then docker "$@"; else sudo docker "$@"; fi
}

echo "=== Diagnóstico WhatsApp → N8N ==="
echo ""

echo "1. Estado conexión"
STATE=$(curl -s "${BASE}/instance/connectionState/${INSTANCE}" -H "apikey: ${APIKEY}")
echo "   $STATE"
if echo "$STATE" | grep -qiE '"state"\s*:\s*"open"'; then
  echo "   OK — open"
else
  echo "   FALTA — sin 'open' NO llegan mensajes. Corré: npm run whatsapp:reset"
fi
echo ""

echo "2. Instancia"
INST=$(curl -s "${BASE}/instance/fetchInstances" -H "apikey: ${APIKEY}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data if isinstance(data, list) else data.get('instance', data) if isinstance(data, dict) else []
if not isinstance(items, list): items = [items] if items else []
for i in items:
    name = i.get('name') or i.get('instanceName') or '?'
    if '$INSTANCE' in str(name) or name == '$INSTANCE':
        print(json.dumps(i, indent=2)[:800])
        break
else:
    print('   instancia no encontrada')
" 2>/dev/null || echo "   error leyendo instancias")
echo "$INST"
echo ""

echo "3. Webhook instancia"
curl -s "${BASE}/webhook/find/${INSTANCE}" -H "apikey: ${APIKEY}" | python3 -m json.tool 2>/dev/null || true
echo ""

echo "4. Logs Evolution (webhook / message / error)"
run_docker logs comercio-ia-whatsapp --tail 40 2>/dev/null | grep -iE 'webhook|message|upsert|error|open|close' | tail -20 || echo "   (sin logs filtrados)"
echo ""

echo "5. Cómo distinguir test vs mensaje real en N8N Executions"
echo "   TEST (webhook:fix):  user-agent = Wget, texto = 'test webhook fix'"
echo "   REAL (WhatsApp):     user-agent = axios, tu número y tu texto"
echo ""

echo "6. Si state=open pero no llegan mensajes reales"
echo "   Bug conocido v2.3.7: logout rompe mensajes entrantes."
echo "   Solución: npm run whatsapp:reset  (borra y crea instancia, NO logout)"
echo ""
