# Paso a Paso — WhatsApp + N8N + OpenAI (Franco)

Tiempo estimado: 2–4 horas

**Prerequisito:** Supabase funcionando y POS registrando ventas.

## Parte 1 — Evolution API (WhatsApp)

### 1.1 Variables de entorno

Agregar al `.env` (o archivo separado para Docker):

```env
EVOLUTION_API_KEY=una-clave-segura-larga
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
N8N_WEBHOOK_URL=https://tu-instancia.n8n.cloud/webhook/whatsapp-incoming
```

### 1.2 Levantar Evolution API

```bash
docker compose up -d
```

### 1.3 Crear instancia WhatsApp

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: TU_EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "comercio-ia", "qrcode": true}'
```

### 1.4 Conectar WhatsApp

1. La respuesta trae un QR (base64 o URL)
2. Escanear con el WhatsApp del comercio (teléfono de la dueña)
3. Verificar estado: `GET http://localhost:8080/instance/connectionState/comercio-ia`

---

## Parte 2 — N8N Cloud

### 2.1 Crear cuenta

1. [n8n.io](https://n8n.io) → Start free trial / Sign up
2. Crear workspace

### 2.2 Credenciales a configurar

| Credencial | Dónde obtenerla |
|------------|-----------------|
| Supabase | URL + **service_role** key (Settings → API) |
| OpenAI | [platform.openai.com](https://platform.openai.com) → API Keys |
| Evolution API | URL local/pública + apikey |

### 2.3 Importar workflows

Los blueprints están en `developers_anotation/n8n/workflows/`:

| Archivo | Función |
|---------|---------|
| `WF_WHATSAPP_QUERY.json` | Consultas generales |
| `WF_REGISTER_PURCHASE.json` | Registrar compras |
| `WF_REGISTER_EXPENSE.json` | Registrar gastos |
| `WF_ALERTS_CRON.json` | Alertas automáticas |

**Nota:** Son guías estructuradas. En N8N hay que armar los nodos siguiendo el flujo descrito en cada JSON, o importar y ajustar credenciales.

### 2.4 Variables de entorno N8N

```
EVOLUTION_API_URL=http://tu-servidor:8080
EVOLUTION_API_KEY=tu-api-key
EVOLUTION_INSTANCE=comercio-ia
OWNER_PHONE=549342XXXXXXXX
```

### 2.5 Prompts del agente

Copiar desde `developers_anotation/n8n/prompts/`:
- `system-prompt.txt` → prompt del agente GPT
- `classifier-prompt.txt` → clasificador de intenciones

---

## Parte 3 — Flujo del webhook

```
WhatsApp mensaje entrante
    ↓
Evolution API → webhook N8N
    ↓
Validar teléfono en authorized_phones
    ↓ (no autorizado → "No autorizado")
¿Es audio? → Whisper STT → texto
    ↓
GPT clasifica intención
    ↓
┌─────────────────────────────────────┐
│ SALES_QUERY    → fn_get_sales()     │
│ STOCK_QUERY    → fn_get_stock()     │
│ PURCHASE_CREATE → confirmar → fn_create_purchase() │
│ EXPENSE_CREATE  → confirmar → fn_create_expense()  │
│ GENERAL_QUERY  → fn_business_summary() │
└─────────────────────────────────────┘
    ↓
Guardar en ai_conversations
    ↓
Responder por WhatsApp
```

---

## Parte 4 — Funciones RPC disponibles

Ya creadas en `supabase/functions.sql`:

| Función | Uso |
|---------|-----|
| `fn_get_stock(product_name)` | Consultar stock |
| `fn_get_sales(period)` | Ventas (today/week/month) |
| `fn_create_purchase(name, qty)` | Registrar compra |
| `fn_create_expense(desc, amount)` | Registrar gasto |
| `fn_business_summary()` | Resumen general |
| `fn_is_authorized(phone)` | Validar teléfono |
| `fn_save_conversation(...)` | Historial IA |

Llamar desde N8N con nodo Supabase → RPC.

---

## Parte 5 — Alertas automáticas

Activar workflow `WF_ALERTS_CRON`:

| Cron | Acción |
|------|--------|
| Cada 60 min | Consultar `vw_low_stock` → WhatsApp alerta |
| Diario 20:00 | Recomendación de compra + productos sin movimiento |

---

## Verificación WhatsApp

- [ ] Mensaje de número NO autorizado → "No autorizado"
- [ ] "¿Cuánto vendí hoy?" → respuesta con total
- [ ] "¿Cuánto stock de Coca Cola?" → respuesta con unidades
- [ ] "Compré 24 Coca Cola" → pide confirmación SI/NO → actualiza stock
- [ ] "Gasté 5000 en bolsas" → pide confirmación → guarda gasto
- [ ] Audio de voz → transcribe y responde
- [ ] Alerta automática cuando stock bajo
