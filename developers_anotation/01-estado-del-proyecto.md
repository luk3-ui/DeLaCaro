# Estado del Proyecto

Última actualización: junio 2026

## ¿Qué es Comercio IA?

Una **aplicación web** (Mini POS) que corre en el navegador del kiosco + un **asistente por WhatsApp** para la dueña.

```
Empleado  →  Navegador (Chrome/Edge)  →  POS Web  →  Supabase
Dueña     →  WhatsApp  →  N8N  →  OpenAI  →  Supabase
```

No es una app de celular ni un programa de escritorio. Es una **web responsive** pensada para usarse en PC, tablet o monitor táctil del mostrador.

---

## Lo que YA está hecho (código)

| Módulo | Estado | Ubicación |
|--------|--------|-----------|
| POS Web — 5 pantallas | ✅ Listo | `src/pages/` |
| Servicios Supabase | ✅ Listo | `src/services/` |
| Schema SQL completo | ✅ Listo | `supabase/schema.sql` |
| Triggers de stock | ✅ Listo | `supabase/schema.sql` |
| Funciones RPC para IA | ✅ Listo | `supabase/functions.sql` |
| Datos demo | ✅ Listo | `supabase/seed.sql` |
| Blueprints N8N | ⚠️ Guía | `developers_anotation/n8n/` |
| Build producción | ✅ Compila | `npm run build` |

### Pantallas del POS

| Ruta | Pantalla |
|------|----------|
| `/open` | Apertura de caja |
| `/pos` | Venta principal (escaneo + cobro) |
| `/restock` | Reposición de stock |
| `/close` | Cierre de caja |
| `/admin` | Gestión de productos |

---

## Lo que FALTA conectar (infraestructura)

| Tarea | Responsable | Guía |
|-------|-------------|------|
| Crear proyecto Supabase | Franco | `03-paso-a-paso-supabase.md` |
| Configurar `.env` | Franco | `03-paso-a-paso-supabase.md` |
| Probar POS local | Socio | `04-paso-a-paso-pos-local.md` |
| Deploy web en Vercel | Socio | `05-paso-a-paso-deploy-vercel.md` |
| Evolution API + WhatsApp | Franco | `06-paso-a-paso-whatsapp-n8n.md` |
| Workflows N8N + OpenAI | Franco | `06-paso-a-paso-whatsapp-n8n.md` |
| Cargar productos reales del kiosco | Socio | `04-paso-a-paso-pos-local.md` |
| Validación final | Ambos | `07-checklist-validacion.md` |

---

## Costos estimados del piloto

| Servicio | Costo/mes |
|----------|-----------|
| Supabase | $0–25 |
| Vercel | $0 |
| N8N Cloud | $20–50 |
| OpenAI | $5–30 |
| Evolution API | ~$5 |
| **Total** | **$30–80 USD** |
