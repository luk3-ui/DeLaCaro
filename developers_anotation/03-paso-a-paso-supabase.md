# Paso a Paso — Supabase (Franco)

Tiempo estimado: 30–45 minutos

## 1. Crear proyecto

1. Ir a [supabase.com](https://supabase.com) → Sign in
2. **New Project**
3. Nombre: `comercio-ia-kiosco` (o el que prefieras)
4. Región: **South America (São Paulo)** (más cerca de Argentina)
5. Database password: guardarla en un lugar seguro
6. Esperar ~2 minutos a que se cree

## 2. Ejecutar SQL

1. En el panel izquierdo → **SQL Editor**
2. **New query**
3. Copiar TODO el contenido de `supabase/schema.sql` → pegar → **Run**
4. Nueva query → copiar `supabase/functions.sql` → **Run**
5. Nueva query → copiar `supabase/seed.sql` → **Run** (opcional, productos demo)

Si hay error, revisar que no queden tablas duplicadas de un intento anterior.

## 3. Obtener credenciales (UI actual de Supabase)

Supabase cambió el menú. Ya no dice solo "Settings → API". Usá **una de estas dos rutas**:

### Opción A — Botón Connect (más fácil)

1. Entrá a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Arriba a la derecha, click en **Connect** (o "Conectar")
3. Pestaña **API Keys** (o "API")
4. Ahí ves:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon** o **Publishable key** → `VITE_SUPABASE_ANON_KEY`

### Opción B — Settings → API Keys

1. Panel izquierdo → ícono de engranaje **Project Settings**
2. Sección **Configuration** → **API Keys**
   - (A veces aparece como **Data API** en Integrations — es lo mismo)
3. Copiar:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** (legacy) **o** **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_ANON_KEY`
   - **service_role** (legacy) **o** **Secret key** (`sb_secret_...`) → solo para N8N/backend (NUNCA en el frontend)

### ¿Cuál key usar en el POS?

| Key en Supabase | Variable en `.env` | ¿Dónde? |
|-----------------|-------------------|---------|
| Project URL | `VITE_SUPABASE_URL` | Frontend |
| anon public **o** Publishable | `VITE_SUPABASE_ANON_KEY` | Frontend |
| service_role **o** Secret | variable aparte en N8N | Solo backend |

Si tu proyecto es nuevo, puede que solo veas **Publishable** y **Secret**. Usá la Publishable en el `.env` del React.

Para ver la **service_role / Secret**: en API Keys → "Reveal" o pestaña "Secret keys". Guardala solo para N8N, nunca la commitees.

## 4. Configurar `.env` local

En la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 5. Verificar en Table Editor

1. **Table Editor** → `products` → deberían aparecer 8 productos demo (si corriste seed)
2. `cash_sessions` → vacía (normal)
3. `authorized_phones` → 1 registro demo

## 6. Registrar teléfonos reales

SQL Editor → nueva query:

```sql
INSERT INTO authorized_phones (phone, name) VALUES
  ('549342XXXXXXXX', 'Dueña'),
  ('549342YYYYYYYY', 'Encargado')
ON CONFLICT (phone) DO NOTHING;
```

Formato del teléfono: código país + área + número, **sin + ni espacios**.
Ejemplo: `5493425123456`

## 7. Avisar al socio

Cuando termines, pasale al socio:
- Confirmación de que Supabase está listo
- Las credenciales NO se comparten por WhatsApp — el socio usa su propio `.env` o las variables en Vercel

## Verificación rápida

- [ ] Tablas creadas (11 tablas)
- [ ] Vistas creadas (`vw_top_products`, etc.)
- [ ] `.env` configurado
- [ ] `npm run dev` levanta sin errores de Supabase en consola
