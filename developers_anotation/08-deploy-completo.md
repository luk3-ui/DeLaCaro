# Deploy Completo — Referencia Técnica

Documento de referencia. Para pasos detallados ver los archivos numerados del índice.

## Arquitectura de deploy

```
┌─────────────────┐     ┌─────────────────┐
│  Vercel         │     │  Supabase Cloud │
│  (POS Web)      │────▶│  (PostgreSQL)   │
└─────────────────┘     └────────┬────────┘
                                 │
┌─────────────────┐     ┌────────▼────────┐
│  Evolution API  │────▶│  N8N Cloud      │
│  (WhatsApp)     │     │  (Automatización)│
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  OpenAI API     │
                        │  (GPT + Whisper)│
                        └─────────────────┘
```

## 1. Supabase

```bash
# SQL Editor — en orden:
supabase/schema.sql
supabase/functions.sql
supabase/seed.sql
```

Variables frontend:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

Variables N8N (service role, NO anon):
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## 2. Frontend (Vercel)

```bash
npm run build
npx vercel --prod
```

## 3. Evolution API

```bash
docker compose up -d
```

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "comercio-ia", "qrcode": true}'
```

## 4. N8N Cloud

Importar workflows desde `developers_anotation/n8n/workflows/`

Variables:
```
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=comercio-ia
OWNER_PHONE=
OPENAI_API_KEY=
```

## Costos

| Servicio | Costo/mes |
|----------|-----------|
| Supabase | $0–25 |
| Vercel | $0 |
| N8N Cloud | $20–50 |
| OpenAI | $5–30 |
| Evolution API | ~$5 |
| **Total** | **$30–80 USD** |
