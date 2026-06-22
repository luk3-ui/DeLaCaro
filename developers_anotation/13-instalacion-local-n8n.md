# Instalación local — N8N + Evolution (una sola vez)

## Requisitos previos en tu PC

### Permisos Docker (importante)

Después de `sudo usermod -aG docker $USER` el grupo **no se activa** hasta que cerrás sesión.

**Sin cerrar sesión**, usá:

```bash
newgrp docker
```

En esa misma terminal:

```bash
docker ps
```

Si funciona sin error, ya podés correr `npm run stack:start`.

**Alternativa con sudo** (comandos separados, sin `#` en la misma línea):

```bash
cd /home/franco/Sistema-kiosco
sudo docker-compose up -d
sudo docker-compose logs -f
```

### Instalar docker-compose (si falta)

```bash
sudo pacman -S docker-compose
```

---

## Configurar `.env`

Tu `.env` ya tiene Supabase. Completá estas líneas:

```env
# Contraseña de la base de Supabase (Project Settings → Database)
EVOLUTION_DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.gbwadnzelsuzrmtmjumi.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.gbwadnzelsuzrmtmjumi.supabase.co:5432/postgres

# Clave para Evolution (inventá una larga)
EVOLUTION_API_KEY=comercio-ia-evolution-key-local

# Panel N8N (usuario/contraseña local)
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=comercio-ia-local-2026
```

---

## Levantar el stack

```bash
cd /home/franco/Sistema-kiosco
docker compose down
npm run stack:start
npm run stack:diagnose
```

Evolution usa **Postgres local en Docker** (no Supabase). Así evitamos problemas de contraseñas con `#`/`?` y conexiones externas.

O manualmente:

```bash
docker-compose up -d
docker-compose logs -f
```

---

## Acceder

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **N8N** | http://localhost:5678 | admin / (ver `.env`) |
| **Evolution API** | http://localhost:8081 | apikey en `.env` |

> Puerto **8081** por defecto (no pisa Burp en 8080). Cambiá `EVOLUTION_PORT` en `.env` si necesitás otro.

Webhook para workflows:
```
http://localhost:5678/webhook/whatsapp-incoming
```

---

## Conectar tu WhatsApp (test)

```bash
# Crear instancia
curl -X POST http://localhost:8081/instance/create \
  -H "apikey: TU_EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"instanceName":"comercio-ia","qrcode":true,"integration":"WHATSAPP-BAILEYS"}'

# Obtener QR
curl http://localhost:8081/instance/connect/comercio-ia \
  -H "apikey: TU_EVOLUTION_API_KEY"
```

Escaneá el QR con tu WhatsApp personal (solo test).

---

## Parar el stack

```bash
docker-compose down
```

---

## Ventaja vs N8N Cloud

Con N8N **local en Docker**, Evolution y N8N están en la **misma red**:

- Evolution envía webhooks a `http://n8n:5678/...` ✅
- N8N responde a `http://evolution-api:8080/...` ✅
- **No necesitás túnel** (cloudflared)

Esto es exactamente lo mismo que vas a tener en el VPS KVM.

---

## Próximo paso en N8N

1. Abrí http://localhost:5678
2. Crear cuenta owner (primera vez)
3. New Workflow → Webhook POST `whatsapp-incoming`
4. Activar workflow
5. Enviar WhatsApp → ver ejecución en Executions

Guía completa: `11-whatsapp-test-tu-numero.md`
