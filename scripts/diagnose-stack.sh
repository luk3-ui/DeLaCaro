#!/usr/bin/env bash
# Diagnóstico rápido del stack N8N + Evolution
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE="docker-compose"
docker compose version &>/dev/null 2>&1 && COMPOSE="docker compose"

run_docker() {
  if docker ps &>/dev/null; then
    docker "$@"
  else
    sudo docker "$@"
  fi
}

run_compose() {
  if docker ps &>/dev/null; then
    $COMPOSE "$@"
  else
    sudo $COMPOSE "$@"
  fi
}

echo -e "${GREEN}=== Comercio IA — Diagnóstico ===${NC}\n"

echo -e "${YELLOW}1. Contenedores${NC}"
run_compose ps -a || true
echo ""

echo -e "${YELLOW}2. Puertos en escucha${NC}"
ss -tlnp 2>/dev/null | grep -E '5678|8081' || netstat -tlnp 2>/dev/null | grep -E '5678|8081' || echo "  (no se detectaron 5678/8081)"
echo ""

echo -e "${YELLOW}3. HTTP checks${NC}"
for url in "http://localhost:5678" "http://localhost:8081"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "fail")
  echo "  $url → $code"
done
echo ""

echo -e "${YELLOW}4. Logs Evolution (últimas 25 líneas)${NC}"
run_compose logs comercio-ia-whatsapp --tail 25 2>/dev/null || run_compose logs evolution-api --tail 25 2>/dev/null || true
echo ""

echo -e "${YELLOW}5. Logs Postgres Evolution${NC}"
run_compose logs postgres-evolution --tail 10 2>/dev/null || true
echo ""

EVOLUTION_PORT="${EVOLUTION_PORT:-8081}"
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env 2>/dev/null || true
  set +a
  EVOLUTION_PORT="${EVOLUTION_PORT:-8081}"
fi

echo -e "${GREEN}Si Evolution responde, probá:${NC}"
echo "  curl http://localhost:${EVOLUTION_PORT}/ -H \"apikey: \${EVOLUTION_API_KEY:-comercio-ia-evolution-key-local}\""
