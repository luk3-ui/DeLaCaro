# WhatsApp + N8N — Test con tu propio número

Tiempo estimado: 2–3 horas (primera vez)

**Prerequisitos:** POS funcionando + Supabase con ventas/productos.

---

## Orden correcto (no saltear pasos)

```
1. Autorizar tu número en Supabase
2. Crear workflow mínimo en N8N (webhook de prueba)
3. Levantar Evolution API + escanear QR con TU WhatsApp
4. Conectar Evolution → webhook N8N
5. Agregar OpenAI + consultas Supabase
6. Agregar compras/gastos con confirmación
7. (Después) Alertas automáticas
```

---

## Paso 0 — Decisión de infraestructura

Evolution API corre en **tu PC** (`localhost:8080`). N8N Cloud está en **internet**.

| Dirección | ¿Funciona? |
|-----------|------------|
| Evolution → N8N (webhook) | ✅ Sí — Evolution puede llamar a una URL pública de N8N |
| N8N → Evolution (enviar respuesta) | ❌ No — N8N Cloud no puede llegar a tu `localhost:8080` |

**Solución para test:** exponer Evolution con un túnel.

### Opción recomendada: Cloudflare Tunnel (gratis)

```bash
# Instalar cloudflared (Manjaro/Arch)
sudo pacman -S cloudflared

# Exponer puerto 8080
cloudflared tunnel --url http://localhost:8080
```

Te da una URL tipo: `https://xxxx.trycloudflare.com`  
Esa URL la usás como `EVOLUTION_API_URL` en N8N.

**Alternativa:** correr N8N también en Docker local (más setup, sin túnel).

---

## Paso 1 — Autorizar tu número en Supabase

1. Supabase → **SQL Editor**
2. Ejecutar (reemplazá con tu número real):

```sql
INSERT INTO authorized_phones (phone, name) VALUES
  ('549XXXXXXXXXX', 'Franco test')
ON CONFLICT (phone) DO UPDATE SET active = true;
```

### Formato del número

- Código país + área + número
- **Sin** `+`, **sin** espacios, **sin** `@s.whatsapp.net`
- Ejemplo Argentina: `5493425123456`

> Tip: cuando Evolution esté conectado, el primer mensaje que llegue a N8N trae el número exacto en el webhook. Podés copiarlo de ahí y registrarlo.

---

## Paso 2 — OpenAI API Key

1. [platform.openai.com](https://platform.openai.com) → API Keys
2. Create new secret key
3. Guardarla — la vas a usar en N8N

Costo test: unos pocos centavos de dólar por decenas de mensajes.

---

## Paso 3 — N8N: workflow mínimo (webhook de prueba)

1. [n8n.io](https://n8n.io) → crear cuenta / workspace
2. **New Workflow**
3. Agregar nodos:

### Nodo 1 — Webhook
- Type: **Webhook**
- HTTP Method: **POST**
- Path: `whatsapp-incoming`
- Response Mode: **Respond to Webhook**

Guardar y **Activate** el workflow.

4. Copiar la **Production URL** del webhook, algo como:
   ```
   https://tu-usuario.app.n8n.cloud/webhook/whatsapp-incoming
   ```

5. Probar con curl:
   ```bash
   curl -X POST https://TU-WEBHOOK-URL \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
   Debe aparecer una ejecución en N8N → Executions.

---

## Paso 4 — Evolution API

### 4.1 Variables en `.env` (raíz del proyecto)

Agregar al `.env` (no commitear):

```env
EVOLUTION_API_KEY=mi-clave-segura-larga-123
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.gbwadnzelsuzrmtmjumi.supabase.co:5432/postgres
N8N_WEBHOOK_URL=https://tu-usuario.app.n8n.cloud/webhook/whatsapp-incoming
```

`DATABASE_URL`: Supabase → Project Settings → **Database** → Connection string → URI (modo Session o Direct).

### 4.2 Levantar Evolution

```bash
cd /home/franco/Sistema-kiosco
docker compose up -d
docker logs -f comercio-ia-whatsapp
```

Esperar que arranque sin errores.

### 4.3 Crear instancia WhatsApp

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: mi-clave-segura-larga-123" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "comercio-ia", "qrcode": true, "integration": "WHATSAPP-BAILEYS"}'
```

### 4.4 Conectar TU número (QR)

```bash
curl http://localhost:8080/instance/connect/comercio-ia \
  -H "apikey: mi-clave-segura-larga-123"
```

La respuesta trae el QR (base64). También podés abrir en el navegador el manager de Evolution si está disponible.

**Importante:** usás tu WhatsApp personal solo para **test**. Después conviene un número del comercio.

### 4.5 Verificar conexión

```bash
curl http://localhost:8080/instance/connectionState/comercio-ia \
  -H "apikey: mi-clave-segura-larga-123"
```

Debe decir `"state": "open"`.

---

## Paso 5 — Conectar Evolution → N8N

El `docker-compose.yml` ya envía webhooks a `N8N_WEBHOOK_URL` en cada mensaje entrante.

1. Enviá un WhatsApp **desde otro teléfono** a tu número conectado (o usá otro chat)
2. En N8N → **Executions** → debería aparecer el payload del mensaje
3. Del payload, extraer el número del remitente (campo tipo `data.key.remoteJid`)

Si no llega nada:
- Verificar `N8N_WEBHOOK_URL` en `.env`
- Reiniciar: `docker compose down && docker compose up -d`
- Revisar logs: `docker logs comercio-ia-whatsapp`

---

## Paso 6 — Workflow completo en N8N

Expandir el workflow con estos nodos (en orden):

```
Webhook
  → Set (extraer phone, message, isAudio)
  → Supabase: fn_is_authorized(phone)  OR  query authorized_phones
  → IF autorizado
      → NO: HTTP Request → enviar "No autorizado" por Evolution
      → SI: OpenAI (clasificar intención)
           → Switch por intención
           → Supabase RPC (fn_get_sales, fn_get_stock, etc.)
           → OpenAI (formatear respuesta humana)
           → HTTP Request → enviar respuesta por Evolution
           → Supabase: fn_save_conversation
```

### Credenciales en N8N

| Servicio | Qué poner |
|----------|-----------|
| Supabase | Host: `https://gbwadnzelsuzrmtmjumi.supabase.co` + **service_role** key |
| OpenAI | Tu API key |
| Evolution (HTTP Request) | URL del túnel o localhost si N8N es local |

### Enviar mensaje por Evolution (nodo HTTP Request)

```
POST {{ EVOLUTION_API_URL }}/message/sendText/comercio-ia

Headers:
  apikey: {{ EVOLUTION_API_KEY }}
  Content-Type: application/json

Body:
{
  "number": "549XXXXXXXXXX",
  "text": "Tu respuesta acá"
}
```

Prompts del agente: `developers_anotation/n8n/prompts/system-prompt.txt`

---

## Paso 7 — Consultas para probar (en orden)

Empezá simple, una por una:

| # | Mensaje | Resultado esperado |
|---|---------|-------------------|
| 1 | `hola` | Respuesta del bot (aunque sea genérica) |
| 2 | `¿Cuánto vendí hoy?` | Total de ventas del día |
| 3 | `¿Cuánto stock de Coca Cola?` | Unidades en stock |
| 4 | `¿Qué productos tienen stock bajo?` | Lista de críticos |
| 5 | `Compré 24 Coca Cola` | Pide confirmación SI/NO → sube stock |
| 6 | `Gasté 5000 en bolsas` | Pide confirmación → guarda gasto |
| 7 | Número NO autorizado | "No autorizado" |

---

## Paso 8 — Compras y gastos (confirmación obligatoria)

Para `PURCHASE_CREATE` y `EXPENSE_CREATE`:

1. GPT extrae datos del mensaje
2. Bot responde: *"Detecté: Coca Cola x24. ¿Confirmar? Respondé SI o NO"*
3. Guardar estado pendiente (en N8N static data o tabla auxiliar)
4. Si responde SI → llamar `fn_create_purchase` o `fn_create_expense`
5. Confirmar al usuario

**Nunca ejecutar si el mensaje es ambiguo** ("compré varias coca" → pedir cantidad).

---

## Paso 9 — Alertas (después del test básico)

Solo cuando consultas y registros funcionen:

- Cron cada 60 min → `vw_low_stock` → WhatsApp a tu número
- Cron 20:00 → recomendación de compra

Blueprint: `developers_anotation/n8n/workflows/WF_ALERTS_CRON.json`

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| N8N no recibe mensajes | Revisar webhook URL + reiniciar docker |
| Bot no responde | N8N no llega a Evolution → usar túnel cloudflared |
| "No autorizado" con tu número | Formato del phone en `authorized_phones` |
| OpenAI error 401 | API key incorrecta en N8N |
| Supabase error | Usar **service_role**, no anon key |
| QR expira | Volver a llamar `/instance/connect/comercio-ia` |

---

## Checklist test con tu número

- [ ] Número registrado en `authorized_phones`
- [ ] N8N webhook activo y recibe payloads
- [ ] Evolution conectado (state: open)
- [ ] Túnel activo (si usás N8N Cloud)
- [ ] OpenAI configurado
- [ ] Supabase service_role en N8N
- [ ] "¿Cuánto vendí hoy?" responde bien
- [ ] Compra con confirmación SI/NO funciona
- [ ] Gasto con confirmación funciona

Cuando todo pase → cambiar al número de la dueña del kiosco.
