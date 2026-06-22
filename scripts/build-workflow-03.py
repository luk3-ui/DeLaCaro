#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "developers_anotation/n8n"
extract = "\n".join(
    line
    for line in (ROOT / "snippets/extract-message.js").read_text().splitlines()
    if not line.strip().startswith("//")
)
system = (ROOT / "prompts/system-prompt.txt").read_text().strip().replace("`", "'")


def code_node(id_, name, pos, js):
    return {
        "parameters": {"jsCode": js},
        "id": id_,
        "name": name,
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": pos,
    }


AUTH_JS = r"""const item = $input.first().json;
const url = $env.SUPABASE_URL;
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
const result = await this.helpers.httpRequest({
  method: 'POST',
  url: `${url}/rest/v1/rpc/fn_is_authorized`,
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: { p_phone: item.phone },
  json: true,
});
if (result !== true) return [];
return [{ json: item }];"""

CTX_JS = r"""const item = $input.first().json;
const url = $env.SUPABASE_URL;
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function rpc(name, body = {}) {
  return await this.helpers.httpRequest({
    method: 'POST', url: `${url}/rest/v1/rpc/${name}`, headers, body, json: true,
  });
}
const [summaryRaw, salesRaw, stockRaw, lowStock] = await Promise.all([
  rpc.call(this, 'fn_business_summary'),
  rpc.call(this, 'fn_get_sales', { p_period: 'today' }),
  rpc.call(this, 'fn_get_stock'),
  this.helpers.httpRequest({
    method: 'GET',
    url: `${url}/rest/v1/vw_low_stock?select=name,stock_current,stock_minimum,status&limit=12`,
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    json: true,
  }),
]);
const summary = Array.isArray(summaryRaw) ? (summaryRaw[0] || {}) : (summaryRaw || {});
const sales = Array.isArray(salesRaw) ? (salesRaw[0] || {}) : (salesRaw || {});
const stock = Array.isArray(stockRaw) ? stockRaw : [stockRaw];
return [{ json: {
  phone: item.phone, text: item.text, messageId: item.messageId,
  context: {
    resumen: summary,
    ventas_hoy: sales,
    inventario: stock.slice(0, 30),
    stock_critico: Array.isArray(lowStock) ? lowStock : [],
  },
}}];"""

OPENAI_JS = (
    "const item = $input.first().json;\n"
    "const apiKey = $env.OPENAI_API_KEY;\n"
    "if (!apiKey) throw new Error('Falta OPENAI_API_KEY en .env');\n"
    f"const system = {json.dumps(system)};\n"
    "const userContent = `Mensaje del dueño:\\n\"${item.text}\"\\n\\nDatos del negocio (solo usar esto):\\n${JSON.stringify(item.context, null, 2)}\\n\\nSi piden recomendaciones, usá stock_critico. Máximo 8 líneas, español argentino.`;\n"
    "const resp = await this.helpers.httpRequest({\n"
    "  method: 'POST', url: 'https://api.openai.com/v1/chat/completions',\n"
    "  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },\n"
    "  body: { model: 'gpt-4o-mini', temperature: 0.35, max_tokens: 600,\n"
    "    messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],\n"
    "  }, json: true,\n"
    "});\n"
    "const reply = resp?.choices?.[0]?.message?.content?.trim() || 'No pude generar una respuesta.';\n"
    "return [{ json: { phone: item.phone, text: item.text, reply } }];"
)

SAVE_JS = r"""const { phone, text, reply } = $input.first().json;
const url = $env.SUPABASE_URL;
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function save(role, content) {
  await this.helpers.httpRequest({
    method: 'POST', url: `${url}/rest/v1/rpc/fn_save_conversation`, headers,
    body: { p_phone: phone, p_role: role, p_content: content }, json: true,
  });
}
await save.call(this, 'user', text);
await save.call(this, 'assistant', reply);
return [{ json: { phone, reply } }];"""

SEND_JS = r"""const { phone, reply } = $input.first().json;
const apiKey = $env.EVOLUTION_API_KEY;
const instance = $env.EVOLUTION_INSTANCE || 'comercio-ia';
await this.helpers.httpRequest({
  method: 'POST', url: `http://evolution-api:8080/message/sendText/${instance}`,
  headers: { apikey: apiKey, 'Content-Type': 'application/json' },
  body: { number: phone, text: reply }, json: true,
});
return [{ json: { phone, text: reply, sent: true } }];"""

nodes = [
    {
        "parameters": {"httpMethod": "POST", "path": "whatsapp-incoming", "options": {}},
        "id": "c1-webhook",
        "name": "Webhook WhatsApp",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 2,
        "position": [0, 400],
        "webhookId": "whatsapp-incoming-ai",
    },
    code_node("c1-extract", "Extraer mensaje", [220, 400], extract),
    code_node("c1-auth", "Verificar autorizado", [440, 400], AUTH_JS),
    code_node("c1-ctx", "Cargar contexto DB", [660, 300], CTX_JS),
    code_node("c1-gpt", "OpenAI responder", [1340, 280], OPENAI_JS),
    code_node("c1-save", "Guardar conversación", [1560, 280], SAVE_JS),
    code_node("c1-send", "Enviar WhatsApp", [1780, 280], SEND_JS),
]

connections = {
    "Webhook WhatsApp": {"main": [[{"node": "Extraer mensaje", "type": "main", "index": 0}]]},
    "Extraer mensaje": {"main": [[{"node": "Verificar autorizado", "type": "main", "index": 0}]]},
    "Verificar autorizado": {"main": [[{"node": "Cargar contexto DB", "type": "main", "index": 0}]]},
    "Cargar contexto DB": {"main": [[{"node": "OpenAI responder", "type": "main", "index": 0}]]},
    "OpenAI responder": {"main": [[{"node": "Guardar conversación", "type": "main", "index": 0}]]},
    "Guardar conversación": {"main": [[{"node": "Enviar WhatsApp", "type": "main", "index": 0}]]},
}

workflow = {
    "name": "03 - Comercio IA OpenAI",
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"},
    "active": False,
}

out = ROOT / "workflows/03-comercio-ia-openai.json"
out.write_text(json.dumps(workflow, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"OK → {out}")
