# Configurar N8N desde cero — Paso a paso

Tiempo: 30–45 minutos

**Prerequisitos:** Stack Docker corriendo + WhatsApp conectado en Evolution.

---

## Paso 0 — Variables en `.env`

Agregá la **service_role key** de Supabase (NO la publishable del POS):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu-secret-key
EVOLUTION_INSTANCE=comercio-ia
N8N_BASE_URL=http://n8n:5678/
N8N_WEBHOOK_URL=http://n8n:5678/webhook/whatsapp-incoming
```

La sacás de: Supabase → Project Settings → API Keys → **Secret** (service_role).

Recreá N8N para que tome las variables (N8N 2.x necesita `--force-recreate`):

```bash
cd /home/franco/Sistema-kiosco
docker compose up -d n8n --force-recreate
```

> Si el nodo **Responder WhatsApp** falla con `access to env vars denied`, es porque N8N 2.x bloquea `$env` hasta recrear el contenedor con `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` (ya está en `docker-compose.yml`).

---

## Paso 1 — Primera entrada a N8N

1. Abrí **http://localhost:5678**
2. Login HTTP básico: `admin` + contraseña de `.env`
3. **Primera vez:** crear cuenta owner (email + password del panel)

---

## Paso 2 — Registrar tu número en Supabase

SQL Editor:

```sql
INSERT INTO authorized_phones (phone, name) VALUES
  ('549XXXXXXXXXX', 'Franco test')
ON CONFLICT (phone) DO UPDATE SET active = true;
```

Sin `+`, sin espacios. Ejemplo: `5493425123456`

> Si no sabés el formato exacto, hacé el Paso 4 primero (echo test) y copiá el número del log de N8N.

---

## Paso 3 — Importar workflow de PRUEBA (echo)

1. N8N → menú **⋯** (arriba) → **Import from file**
2. Elegir: `developers_anotation/n8n/workflows/01-whatsapp-echo-test.json`
3. Click en el workflow importado
4. Arriba a la derecha: click **Publish** (en N8N 2.x reemplazó al toggle Active/Inactive)
   - Atajo: `Shift + P`
   - Debe quedar con check verde / estado **Published**
   - **Solo Save no alcanza** — sin Publish el webhook de producción no recibe mensajes
5. Guardar si hace falta (autosave suele bastar)

### Probar

- Desde **otro teléfono**, mandá WhatsApp a tu número conectado: `hola test`
- N8N → **Executions** (menú izquierdo) → filtro **Production** → debe aparecer ejecución verde
- Deberías recibir: `Recibido: hola test`

> **NO uses "Test workflow"** en el editor para probar WhatsApp real. Eso es `mode: test` y no recibe mensajes de Evolution. Los mensajes reales solo aparecen en **Executions → Production** con el workflow **Published**.

> Si Code node falla con `process is not defined`, reimportá el workflow (usa `$env`, no `process.env`) y recreá n8n: `docker compose up -d n8n --force-recreate`

Si funciona: webhook + Evolution + N8N están bien conectados.

> **¿Ves `connection.update` con `state: connecting`?** Es normal: Evolution avisa el estado de la sesión WhatsApp, no es un mensaje de chat. El workflow lo ignora. Esperá `state: open` en Evolution Manager y mandá un mensaje desde **otro teléfono**.

**Desactivá** este workflow antes del siguiente: menú **⋯** → **Unpublish** (mismo path de webhook).

---

## Paso 4 — Activar el BOT (después del echo)

Tu número ya llega bien (`5493426489504`). Seguí en este orden:

### 4.1 Registrar tu número en Supabase

SQL Editor → ejecutar (usá el phone exacto que viste en N8N):

```sql
INSERT INTO authorized_phones (phone, name) VALUES
  ('5493426489504', 'Franco')
ON CONFLICT (phone) DO UPDATE SET active = true;
```

### 4.2 Cambiar de echo a bot

1. **Unpublish** `01 - WhatsApp Echo Test` (⋯ → Unpublish)
2. Import → `developers_anotation/n8n/workflows/02-comercio-ia-bot.json`
3. **Publish** `02 - Comercio IA Bot`

> Solo UN workflow publicado con path `whatsapp-incoming`.

### 4.3 Probar consultas

| Mensaje | Respuesta esperada |
|---------|-------------------|
| `hola` | Menú de ayuda |
| `cuánto vendí hoy` | Total ventas del día |
| `stock de coca` | Stock de Coca Cola |
| `cómo está el negocio` | Resumen general |
| Número no autorizado | **Silencio total** — no responde nada (seguridad) |

---

## Cómo funciona el bot (workflow 02)

```
WhatsApp → Evolution → Webhook N8N
    → Extraer teléfono y texto
    → Verificar authorized_phones (Supabase)
    → Si NO autorizado → **silencio** (no envía mensaje)
    → Clasificar intención (ventas / stock / resumen)
    → Consultar Supabase (fn_get_sales, fn_get_stock, etc.)
    → Formatear respuesta
    → Enviar por Evolution API
```

---

## Paso 5 — Verificar webhook URL

Evolution debe apuntar a:

```
http://n8n:5678/webhook/whatsapp-incoming
```

Eso ya está en `docker-compose.yml` (`N8N_WEBHOOK_URL` en `.env`).

**Importante:** la instancia `comercio-ia` guarda su propia config de webhook en la base de Evolution. Si los mensajes no llegan, ejecutá:

```bash
npm run webhook:fix
```

Eso fuerza `webhookByEvents: false` y solo evento `MESSAGES_UPSERT` en la URL correcta.

Si cambiás el path del webhook en N8N, actualizá `.env` y reiniciá:

```bash
docker compose restart evolution-api n8n
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| No llegan ejecuciones | Workflow **Published** (no solo guardado). Reiniciar Evolution. |
| "No autorizado" con tu número | Formato del phone en `authorized_phones`. Ver número en Executions → nodo "Extraer". |
| Error Supabase 401 | `SUPABASE_SERVICE_ROLE_KEY` incorrecta en `.env`. Reiniciar n8n. |
| Error al enviar WhatsApp | Verificar `EVOLUTION_API_KEY` en `.env`. |
| Dos workflows publicados | Solo UNO con path `whatsapp-incoming` publicado a la vez. |
| Solo veo "Test workflow" | Normal en N8N 2.x. Usá **Publish** arriba a la derecha, no el botón de test. |
| Ejecución con `connection.update` | Evento de conexión WhatsApp, no un mensaje. Ignorarlo; probá cuando `state: open`. |
| Error `access to env vars denied` | Reiniciar N8N tras agregar `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` en docker-compose |
| `webhookUrl` con path duplicado | En `.env` usar `N8N_BASE_URL=http://n8n:5678/` y `N8N_WEBHOOK_URL=.../webhook/whatsapp-incoming` |
| Executions rojas | Click en la ejecución → ver qué nodo falló. |

---

## Próximos pasos (después del bot básico)

1. Agregar OpenAI para lenguaje natural (reemplazar clasificador por keywords)
2. Compras/gastos con confirmación SI/NO
3. Alertas automáticas (cron stock bajo)
4. Audio → Whisper

---

## Archivos de workflows

| Archivo | Uso |
|---------|-----|
| `01-whatsapp-echo-test.json` | Prueba de conexión (echo) |
| `02-comercio-ia-bot.json` | Bot keywords (ventas/stock/resumen) |
| `03-comercio-ia-openai.json` | **Bot con OpenAI + contexto DB** |

Prompts IA (futuro): `developers_anotation/n8n/prompts/`
