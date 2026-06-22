# Developers Anotation — Comercio IA

Documentación interna del equipo. **No es código de producción.**

## Índice

| Archivo | Para quién | Contenido |
|---------|------------|-----------|
| [01-estado-del-proyecto.md](./01-estado-del-proyecto.md) | Ambos | Qué está hecho y qué falta |
| [02-division-trabajo.md](./02-division-trabajo.md) | Ambos | Franco (backend) vs Socio (frontend/operación) |
| [03-paso-a-paso-supabase.md](./03-paso-a-paso-supabase.md) | Franco | Base de datos |
| [04-paso-a-paso-pos-local.md](./04-paso-a-paso-pos-local.md) | Socio | Probar el POS en la PC |
| [05-paso-a-paso-deploy-vercel.md](./05-paso-a-paso-deploy-vercel.md) | Socio | Publicar la web del kiosco |
| [06-paso-a-paso-whatsapp-n8n.md](./06-paso-a-paso-whatsapp-n8n.md) | Franco | WhatsApp + IA |
| [07-checklist-validacion.md](./07-checklist-validacion.md) | Ambos | Verificar que todo funciona |
| [08-deploy-completo.md](./08-deploy-completo.md) | Franco | Referencia técnica de deploy |
| [09-como-se-ve-el-pos.md](./09-como-se-ve-el-pos.md) | Ambos | Qué es la app web y cómo se ve |
| [10-paso-a-paso-github-colaboracion.md](./10-paso-a-paso-github-colaboracion.md) | Ambos | GitHub + trabajo en paralelo |
| [11-whatsapp-test-tu-numero.md](./11-whatsapp-test-tu-numero.md) | Franco | WhatsApp test con tu número |
| [12-deploy-vps-kvm.md](./12-deploy-vps-kvm.md) | Franco | Migración a VPS KVM |
| [13-instalacion-local-n8n.md](./13-instalacion-local-n8n.md) | Franco | **Instalar N8N local ahora** |
| [14-configurar-n8n-desde-cero.md](./14-configurar-n8n-desde-cero.md) | Franco | **Importar workflows N8N (vacío → bot)** |
| [15-n8n-openai-bot.md](./15-n8n-openai-bot.md) | Franco | **Bot con OpenAI + fix doble respuesta** |
| [n8n/](./n8n/) | Franco | Workflows JSON y prompts para importar |

## Orden recomendado

1. Franco → `03-paso-a-paso-supabase.md`
2. Socio → `04-paso-a-paso-pos-local.md`
3. Socio → `05-paso-a-paso-deploy-vercel.md`
4. Franco → `13-instalacion-local-n8n.md` → **`14-configurar-n8n-desde-cero.md`**
5. Ambos → `07-checklist-validacion.md`
