# Paso a Paso — GitHub y trabajo en paralelo

Tiempo estimado: 20 minutos (una sola vez)

Objetivo: que vos y tu colega trabajen sobre el **mismo código**, cada uno en su PC, sincronizado por GitHub.

---

## Concepto rápido

```
GitHub (repo central)
    ↑ push          ↑ push
  Franco          Colega
    ↓ pull          ↓ pull
  PC Franco       PC Colega
```

- **push** = subir tus cambios a GitHub
- **pull** = bajar los cambios del otro
- **`.env`** = cada uno lo tiene local, **no va a GitHub** (secretos)

---

## Parte 1 — Franco: subir el proyecto (primera vez)

### 1.1 Inicializar Git (si aún no está)

```bash
cd /home/franco/Sistema-kiosco
git init
git branch -M main
```

### 1.2 Crear repo en GitHub

1. [github.com/new](https://github.com/new)
2. Nombre: `comercio-ia-kiosco` (o el que quieran)
3. **Private** (recomendado — es un negocio)
4. **NO** marcar "Add README" (ya tenés código local)
5. Create repository

### 1.3 Primer commit y push

```bash
git add .
git status   # verificar que NO aparezca .env
git commit -m "Initial commit: POS web + SQL Supabase + docs equipo"
git remote add origin https://github.com/TU-USUARIO/comercio-ia-kiosco.git
git push -u origin main
```

Si `git status` muestra `.env`, **no commitees**. Debe estar en `.gitignore`.

### 1.4 Compartir credenciales Supabase con el colega

**No** pasar keys por GitHub. Opciones seguras:

- Password manager (1Password, Bitwarden)
- Mensaje encriptado
- Canal privado acordado

El colega crea su propio `.env` local:

```bash
cp .env.example .env
# Pegar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

Ambos apuntan al **mismo proyecto Supabase** → ven los mismos datos.

---

## Parte 2 — Colega: clonar y empezar

```bash
git clone https://github.com/TU-USUARIO/comercio-ia-kiosco.git
cd comercio-ia-kiosco
npm install
cp .env.example .env
# Editar .env con las credenciales que Franco le pasó
npm run dev
```

---

## Parte 3 — Flujo diario (los dos)

### Antes de empezar a laburar

```bash
git pull origin main
```

Siempre **pull primero** para no pisar cambios del otro.

### Cuando terminás algo

```bash
git add .
git status
git commit -m "Descripción clara de lo que hiciste"
git push origin main
```

### Mensajes de commit útiles

```
feat: pantalla de favoritos en POS
fix: error al cerrar caja sin ventas
docs: actualizar guía Supabase
chore: cargar productos reales en seed
```

---

## Parte 4 — Trabajar en paralelo sin pisarse

### Regla de oro

| Franco (backend) | Colega (frontend/ops) |
|------------------|------------------------|
| `supabase/`, `n8n/`, `.env` backend | `src/pages/`, `src/components/` |
| `developers_anotation/03, 06, 08` | `developers_anotation/04, 05` |

Si tocan el **mismo archivo**, Git avisa al hacer `pull` (conflicto). Se resuelve a mano o hablando por chat.

### Opción avanzada: ramas (recomendado cuando crezcan)

```bash
# Crear rama para una tarea
git checkout -b feat/deploy-vercel

# Laburar, commit, push
git push -u origin feat/deploy-vercel

# En GitHub: Pull Request → revisar → merge a main
```

Mientras tanto el otro sigue en `main` con `git pull`.

---

## Parte 5 — Deploy automático (opcional, Vercel + GitHub)

Cuando el colega conecte Vercel al repo:

1. [vercel.com](https://vercel.com) → Import Git Repository
2. Elegir `comercio-ia-kiosco`
3. Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

Cada **push a `main`** → Vercel rebuilda solo. El kiosco siempre tiene la última versión.

---

## Parte 6 — Qué va y qué NO va a GitHub

| Sí subir | NO subir |
|----------|----------|
| `src/` | `.env` |
| `supabase/*.sql` | `node_modules/` |
| `developers_anotation/` | `dist/` |
| `package.json` | service_role / secret keys |
| `.env.example` (sin valores reales) | passwords de DB |

---

## Comandos de emergencia

```bash
# Ver qué cambió
git status
git diff

# Deshacer cambios locales en un archivo (cuidado)
git checkout -- src/pages/PosPage.tsx

# Actualizar desde GitHub forzando limpieza local (raro)
git fetch origin
git reset --hard origin/main
```

---

## Checklist colaboración

- [ ] Repo GitHub creado (private)
- [ ] Primer push hecho
- [ ] Colega clonó y `npm install` OK
- [ ] Ambos tienen `.env` local (mismo Supabase)
- [ ] Acordaron: pull antes de laburar, push al terminar
- [ ] (Opcional) Vercel conectado al repo
