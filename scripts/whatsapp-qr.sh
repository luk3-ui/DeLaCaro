#!/usr/bin/env bash
# Obtener QR de WhatsApp (Evolution API)
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
INSTANCE="${1:-comercio-ia}"
BASE="http://localhost:${PORT}"

echo "Evolution: ${BASE}"
echo "Instancia: ${INSTANCE}"
echo ""

# Pedir conexión / QR
echo "Solicitando QR (puede tardar unos segundos)..."
for i in {1..15}; do
  RESP=$(curl -s "${BASE}/instance/connect/${INSTANCE}" -H "apikey: ${APIKEY}")
  COUNT=$(echo "$RESP" | grep -o '"count":[0-9]*' | head -1 | cut -d: -f2 || echo "0")

  if echo "$RESP" | grep -q '"base64"'; then
    echo "$RESP" | python3 -c "
import sys, json, base64, re
d = json.load(sys.stdin)
b64 = d.get('base64', '')
if b64.startswith('data:'):
    b64 = b64.split(',', 1)[1]
if b64:
    open('whatsapp-qr.png', 'wb').write(base64.b64decode(b64))
    print('QR guardado en: whatsapp-qr.png')
    print('Abrilo y escanealo con WhatsApp → Dispositivos vinculados')
else:
    code = d.get('pairingCode') or d.get('code')
    if code:
        print('Código de vinculación:', code)
    print(json.dumps(d, indent=2))
" 2>/dev/null && exit 0
  fi

  echo "  intento $i/15 — count=${COUNT:-0}, esperando..."
  sleep 3
done

echo ""
echo "No se generó QR por API. Probá el Manager en el navegador:"
echo "  ${BASE}/manager"
echo ""
echo "En el Manager: instancia '${INSTANCE}' → Conectar → escanear QR"
echo ""
echo "Si sigue fallando, reiniciá Evolution:"
echo "  docker compose pull evolution-api && docker compose up -d evolution-api"
