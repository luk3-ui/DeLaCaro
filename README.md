# Comercio IA

Mini POS web + Asistente IA por WhatsApp para kioscos.

## Inicio rápido

```bash
npm install
cp .env.example .env   # configurar Supabase
npm run dev            # http://localhost:5173
```

## Documentación del equipo

Toda la guía de trabajo, deploy y validación está en:

**[`developers_anotation/`](./developers_anotation/README.md)**

## Estructura

```
src/                    # POS web (React)
supabase/               # SQL de base de datos
developers_anotation/   # Guías, checklists, N8N (solo equipo)
docker-compose.yml      # Evolution API (WhatsApp)
vercel.json             # Deploy frontend
```

## Stack

React · Vite · TypeScript · Supabase · N8N · OpenAI · Evolution API
