# División de Trabajo

## Franco — Backend / IA / Infraestructura

- [ ] Crear y configurar proyecto Supabase
- [ ] Ejecutar SQL (schema, functions, seed)
- [ ] Configurar `.env` con credenciales
- [ ] Levantar Evolution API (Docker)
- [ ] Configurar N8N Cloud
- [ ] Importar workflows de WhatsApp
- [ ] Conectar OpenAI (GPT + Whisper)
- [ ] Registrar teléfonos autorizados en `authorized_phones`
- [ ] Activar alertas automáticas (cron)
- [ ] Validar que la IA responde correctamente

**Guías:** `03`, `06`, `07`, `08`

---

## Socio — Frontend / Operación / Kiosco

- [ ] Instalar dependencias (`npm install`)
- [ ] Probar POS en local con Supabase conectado
- [ ] Cargar productos reales del kiosco en `/admin`
- [ ] Deploy en Vercel
- [ ] Configurar PC/tablet del kiosco con la URL
- [ ] Probar flujo completo con empleados (abrir → vender → cerrar)
- [ ] Capacitar empleados (< 5 minutos)
- [ ] Capacitar a la dueña en WhatsApp

**Guías:** `04`, `05`, `07`

---

## Flujo de trabajo sugerido

```
Semana 1
├── Franco: Supabase + .env
├── Socio:  Probar POS local
└── Socio:  Cargar productos reales

Semana 2
├── Socio:  Deploy Vercel + PC del kiosco
├── Franco: WhatsApp + N8N + OpenAI
└── Ambos:  Checklist de validación

Semana 3+
└── Piloto en el kiosco (30 días)
```

---

## Comunicación

- Franco avisa cuando Supabase esté listo → Socio puede probar POS
- Socio avisa cuando Vercel esté deployado → URL para el kiosco
- Franco avisa cuando WhatsApp funcione → Dueña puede probar consultas
