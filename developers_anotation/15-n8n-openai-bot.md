# N8N + OpenAI — Bot inteligente

Tiempo: 20–30 minutos

**Prerequisito:** Workflow echo o bot básico funcionando.

---

## Por qué respondía dos veces

Causas comunes (ya corregidas en el repo):

1. **Webhook global + webhook de instancia** — Evolution disparaba 2 veces. Fix: `WEBHOOK_GLOBAL_ENABLED=false` en `docker-compose.yml`
2. **Dos workflows publicados** con path `whatsapp-incoming` — solo uno Published
3. **Mismo mensaje procesado 2 veces** — fix: deduplicación por `messageId` en nodo Extraer

Después del fix:

```bash
docker compose up -d evolution-api n8n --force-recreate
```

Verificá en N8N que solo **un** workflow esté Published.

---

## Paso 1 — OpenAI API Key

1. [platform.openai.com](https://platform.openai.com) → API Keys → Create
2. En `.env`:

```env
OPENAI_API_KEY=sk-proj-...
```

3. Recrear N8N:

```bash
docker compose up -d n8n --force-recreate
npm run n8n:env-check
```

Debe listar `OPENAI_API_KEY = configurada`.

---

## Paso 2 — Activar workflow OpenAI

1. **Unpublish** `02 - Comercio IA Bot` (y el echo si sigue activo)
2. Import → `developers_anotation/n8n/workflows/03-comercio-ia-openai.json`
3. **Publish** `03 - Comercio IA OpenAI`

---

## Qué hace el workflow 03

```
WhatsApp → Extraer mensaje (anti-duplicado)
    → Autorizado? (Supabase)
    → Cargar contexto DB:
        • resumen del negocio
        • ventas hoy
        • inventario
        • stock crítico (vw_low_stock)
    → OpenAI (gpt-4o-mini) — responde con datos reales
    → Guardar conversación (ai_conversations)
    → Enviar WhatsApp
```

---

## Seguridad — números no autorizados

Si alguien que **no** está en `authorized_phones` escribe al WhatsApp del kiosco:

- **No recibe ningún mensaje** (silencio total)
- El workflow termina en "Verificar autorizado" sin enviar nada
- Esto evita revelar que hay un bot y no molesta a desconocidos

Solo los números en Supabase reciben respuesta.

---

| Mensaje | Qué debería hacer |
|---------|-------------------|
| `¿Cómo está el negocio?` | Resumen con datos de Supabase |
| `¿Qué debería comprar mañana?` | Sugerencias según stock crítico |
| `¿Cuánto vendí hoy?` | Ventas del día en lenguaje natural |
| Pregunta ambigua | Pide aclaración (sin inventar datos) |

---

## Costo OpenAI (referencia)

Modelo `gpt-4o-mini`: ~USD 0.001–0.01 por mensaje en test.  
Decenas de mensajes de prueba = pocos centavos.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Responde 2 veces | Un solo workflow Published + `docker compose up -d evolution-api --force-recreate` |
| `Falta OPENAI_API_KEY` | Agregar en `.env` y recrear n8n |
| Inventa datos | Revisar que Supabase tenga productos/ventas; el prompt prohíbe inventar |
| Lento (>10s) | Normal: 3 llamadas DB + OpenAI |

---

## Próximo paso

- Compras/gastos con confirmación SI/NO → `WF_REGISTER_PURCHASE.json`
- Alertas cron stock bajo → `WF_ALERTS_CRON.json`
