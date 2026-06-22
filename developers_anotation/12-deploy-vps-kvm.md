# Deploy en VPS KVM — Comercio IA

## ¿Conviene el plan KVM 2?

**Sí, es recomendable** para este proyecto.

| Recurso | KVM 2 | Lo que necesitás |
|---------|-------|------------------|
| 2 vCPU | ✅ | N8N + Evolution + Nginx |
| 8 GB RAM | ✅ sobra | N8N ~512MB, Evolution ~512MB, resto libre |
| 100 GB NVMe | ✅ sobra | Datos en Supabase cloud |
| ~$9/mo promo | ✅ | vs N8N Cloud $20–50/mo solo |

**Ventajas vs N8N Cloud:**
- N8N + Evolution en la **misma máquina** → sin túneles, sin problemas localhost
- Un solo servidor para automatización + WhatsApp
- El POS web puede seguir en **Vercel gratis** o también en el VPS con Nginx
- Supabase y OpenAI siguen en la nube (no cambian)

**Migración:** es copiar el mismo `docker-compose.yml`, cambiar URLs en `.env`, apuntar dominio.

---

## Arquitectura en VPS

```
                    Internet
                       │
              ┌────────▼────────┐
              │  Nginx (443)    │
              │  wa.tudominio.com → :8080 Evolution
              │  n8n.tudominio.com → :5678 N8N
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │     VPS KVM 2              │
         │  docker compose up -d      │
         │  ├── n8n                   │
         │  └── evolution-api         │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │  Supabase (cloud)        │
         │  OpenAI (cloud)          │
         │  Vercel POS (cloud)      │
         └──────────────────────────┘
```

---

## Pasos para migrar (cuando compres el VPS)

### 1. VPS base (Ubuntu 22.04 recomendado)

```bash
# En el VPS
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo usermod -aG docker $USER
```

### 2. Subir proyecto

```bash
git clone https://github.com/TU-USUARIO/comercio-ia-kiosco.git
cd comercio-ia-kiosco
cp .env.example .env
nano .env   # URLs con tu dominio
```

### 3. `.env` en producción

```env
N8N_HOST=n8n.tudominio.com
N8N_PROTOCOL=https
N8N_WEBHOOK_URL=https://n8n.tudominio.com/
EVOLUTION_SERVER_URL=https://wa.tudominio.com
N8N_BASIC_AUTH_PASSWORD=clave-muy-segura
EVOLUTION_API_KEY=clave-muy-segura
EVOLUTION_DATABASE_URL=postgresql://...
```

### 4. Levantar stack

```bash
docker compose up -d
```

### 5. Nginx + SSL

```bash
sudo certbot --nginx -d n8n.tudominio.com -d wa.tudominio.com
```

Config Nginx proxy_pass a puertos 5678 y 8080.

### 6. Recrear instancia WhatsApp

Mismo curl de QR, escanear de nuevo (sesión no migra entre servidores).

---

## Local ahora → VPS después

| Local (hoy) | VPS (después) |
|-------------|---------------|
| `http://localhost:5678` | `https://n8n.tudominio.com` |
| `http://localhost:8080` | `https://wa.tudominio.com` |
| Webhook interno Docker | Misma red Docker, URLs públicas |
| Sin túnel necesario | Nginx + Let's Encrypt |

El `docker-compose.yml` es **el mismo archivo**. Solo cambiás `.env`.
