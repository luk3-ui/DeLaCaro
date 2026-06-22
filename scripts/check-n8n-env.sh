#!/usr/bin/env bash
# Verifica variables dentro del contenedor n8n
set -euo pipefail

run_docker() {
  if docker ps &>/dev/null; then docker "$@"; else sudo docker "$@"; fi
}

echo "=== Variables en contenedor comercio-ia-n8n ==="
for var in N8N_BLOCK_ENV_ACCESS_IN_NODE EVOLUTION_API_KEY EVOLUTION_INSTANCE EVOLUTION_API_URL SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY OPENAI_API_KEY; do
  val=$(run_docker exec comercio-ia-n8n printenv "$var" 2>/dev/null || true)
  if [[ -z "$val" ]]; then
    echo "  $var = (VACÍA)"
  elif [[ "$var" == *KEY* ]]; then
    echo "  $var = configurada (${#val} chars)"
  else
    echo "  $var = $val"
  fi
done

echo ""
echo "Si alguna KEY está vacía, agregala en .env (NO en .env.example) y corré:"
echo "  docker compose up -d n8n --force-recreate"
