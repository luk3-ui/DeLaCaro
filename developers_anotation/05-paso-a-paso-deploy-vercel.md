# Paso a Paso — Deploy en Vercel (Socio)

Tiempo estimado: 15 minutos

**Prerequisito:** POS probado en local y funcionando.

## 1. Build local (verificar que compila)

```bash
npm run build
```

Si termina sin errores, seguí.

## 2. Crear cuenta Vercel

1. [vercel.com](https://vercel.com) → Sign up (con GitHub recomendado)
2. Si el repo está en GitHub, conectar el repositorio
3. Si no, deploy manual:

```bash
npx vercel
```

Seguí el asistente:
- Set up and deploy? **Y**
- Which scope? tu cuenta
- Link to existing project? **N**
- Project name: `comercio-ia-kiosco`
- Directory: `./`
- Override settings? **N**

## 3. Variables de entorno en Vercel

En el dashboard de Vercel → tu proyecto → **Settings** → **Environment Variables**:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | URL de Supabase (Franco te la pasa) |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase |

Aplicar a: **Production**, **Preview**, **Development**

## 4. Deploy producción

```bash
npx vercel --prod
```

O push a GitHub si está conectado (deploy automático).

## 5. Configurar PC del kiosco

1. Abrí Chrome/Edge en la PC del mostrador
2. Ir a la URL de Vercel (ej: `https://comercio-ia-kiosco.vercel.app`)
3. **F11** para pantalla completa (opcional)
4. Pin en barra de tareas
5. Configurar inicio automático del navegador (opcional)

## 6. Hardware recomendado

| Dispositivo | Uso |
|-------------|-----|
| PC o tablet | Pantalla del POS |
| Lector código barras USB | Escaneo de productos |
| Conexión internet | Obligatoria (Supabase en la nube) |

## Verificación

- [ ] URL pública carga el POS
- [ ] Abrir caja funciona desde la URL de producción
- [ ] Venta se guarda en Supabase
- [ ] Empleado puede usar sin capacitación formal
