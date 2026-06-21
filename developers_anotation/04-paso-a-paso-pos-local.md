# Paso a Paso — Probar el POS en Local (Socio)

Tiempo estimado: 20 minutos

**Prerequisito:** Franco ya configuró Supabase y el `.env` está listo.

## 1. Instalar y levantar

```bash
cd /home/franco/Sistema-kiosco
npm install
npm run dev
```

Abrí el navegador en: **http://localhost:5173**

## 2. Qué vas a ver

Es una **web app** con barra azul arriba:

- Título: **Comercio IA**
- Indicador: **CAJA CERRADA** (rojo) o **CAJA ABIERTA** (verde)
- Menú: Abrir Caja | Vender | Reposición | Cerrar Caja | Productos

Funciona en Chrome, Edge, Firefox. Ideal en pantalla táctil o con lector de código de barras USB.

## 3. Flujo de prueba completo

### Paso A — Abrir caja
1. Click en **Abrir Caja**
2. Monto inicial: `5000` (o 0)
3. Click **ABRIR CAJA**
4. El indicador pasa a **CAJA ABIERTA** (verde)

### Paso B — Vender
1. Click en **Vender**
2. En el campo de escaneo, escribí el código demo y presioná Enter:
   ```
   7790895001234
   ```
   (Coca Cola 2.25L)
3. Repetí para agregar más unidades
4. Probá **+ Producto Manual** → "Pan" → $800
5. Seleccioná medio de pago: **EFECTIVO**, **QR** o **TARJETA**
6. Click **COBRAR**
7. Aparece pantalla verde: **VENTA REGISTRADA**

### Paso C — Reposición
1. Click **Reposición**
2. Escaneá/escribí: `7790895001234` + Enter
3. Cantidad: `24`
4. Click **AGREGAR STOCK**

### Paso D — Cerrar caja
1. Click **Cerrar Caja**
2. Verificá totales (efectivo, QR, tarjeta, operaciones)
3. Click **CERRAR CAJA** → confirmar

### Paso E — Productos
1. Click **Productos**
2. Ver listado, buscar, crear, editar, desactivar

## 4. Cargar productos reales del kiosco

1. Ir a **Productos** → **+ Nuevo**
2. Completar: código de barras, nombre, categoría, precio, stock inicial
3. Repetir para los productos más vendidos primero
4. Tip: empezá con 20–30 productos clave, no todo el inventario de una

## 5. Simular lector de barras

Un lector USB funciona como teclado: apunta al campo de escaneo, escanea, y manda Enter automáticamente. No hace falta configuración extra.

## Verificación

- [ ] Abrir caja funciona
- [ ] Venta con producto escaneado funciona
- [ ] Venta manual (pan/fiambre) funciona
- [ ] Stock baja después de vender (ver en Supabase Table Editor)
- [ ] Reposición suma stock
- [ ] Cierre muestra totales correctos
- [ ] Anular última venta revierte stock
