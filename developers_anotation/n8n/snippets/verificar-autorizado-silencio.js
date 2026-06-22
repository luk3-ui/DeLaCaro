// Nodo "Verificar autorizado" — silencio total si no está en Supabase
const item = $input.first().json;
const url = $env.SUPABASE_URL;
const key = $env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

const result = await this.helpers.httpRequest({
  method: 'POST',
  url: `${url}/rest/v1/rpc/fn_is_authorized`,
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: { p_phone: item.phone },
  json: true,
});

// NO responder a desconocidos — termina el flujo sin enviar WhatsApp
if (result !== true) return [];

return [{ json: item }];
