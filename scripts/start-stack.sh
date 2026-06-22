#!/usr/bin/env bash
# Levanta N8N + Evolution API para Comercio IA
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if ! command -v docker &>/dev/null; then
  echo -e "${RED}Docker no está instalado.${NC}"
  exit 1
fi

COMPOSE="docker-compose"
if docker compose version &>/dev/null 2>&1; then
  COMPOSE="docker compose"
fi

if [[ ! -f .env ]]; then
  echo -e "${YELLOW}Creando .env desde .env.example...${NC}"
  cp .env.example .env
  echo -e "${RED}Editá .env con tus credenciales antes de continuar.${NC}"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [[ -z "${EVOLUTION_API_KEY:-}" ]] || [[ "${EVOLUTION_API_KEY}" == "genera-una-clave-segura-larga" ]]; then
  echo -e "${RED}Configurá EVOLUTION_API_KEY en .env${NC}"
  exit 1
fi

DB_URL="${EVOLUTION_DATABASE_URL:-${DATABASE_URL:-local}}"
if [[ "$DB_URL" != "local" ]] && [[ -z "$DB_URL" || "$DB_URL" == *"TU_PASSWORD"* ]]; then
  echo -e "${YELLOW}Nota: Evolution usa Postgres local en Docker (no requiere Supabase DB).${NC}"
fi

run_compose() {
  $COMPOSE "$@"
}

if ! docker ps &>/dev/null; then
  echo -e "${YELLOW}Sin permiso para Docker (grupo docker no activo).${NC}"
  echo ""
  echo -e "Opción A — activar grupo sin cerrar sesión:"
  echo -e "  ${GREEN}newgrp docker${NC}"
  echo -e "  Luego en esa misma terminal: ${GREEN}npm run stack:start${NC}"
  echo ""
  echo -e "Opción B — usar sudo (una sola vez por comando):"
  echo -e "  ${GREEN}sudo docker-compose up -d${NC}"
  echo ""
  if sudo -n docker ps &>/dev/null 2>&1; then
    echo -e "${YELLOW}Intentando con sudo...${NC}"
    run_compose() { sudo $COMPOSE "$@"; }
  else
    exit 1
  fi
fi

echo -e "${GREEN}Levantando stack (N8N + Evolution API)...${NC}"
run_compose up -d

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Comercio IA — Stack local listo${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo -e "  N8N panel:     ${YELLOW}http://localhost:5678${NC}"
echo -e "  Usuario:       ${N8N_BASIC_AUTH_USER:-admin}"
echo -e "  Contraseña:    (ver N8N_BASIC_AUTH_PASSWORD en .env)"
echo ""
echo -e "  Evolution API: ${YELLOW}http://localhost:${EVOLUTION_PORT:-8081}${NC}"
echo ""
echo -e "  Ver logs:      ${YELLOW}$COMPOSE logs -f${NC}"
echo ""
