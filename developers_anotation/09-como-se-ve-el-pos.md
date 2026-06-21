# Cómo se ve el POS — Guía visual

## ¿Es una app web?

**Sí.** Comercio IA POS es una aplicación web que corre en el navegador.

| Aspecto | Detalle |
|---------|---------|
| Tipo | Single Page Application (SPA) |
| Tecnología | React + Vite + TailwindCSS |
| Acceso | URL en Chrome/Edge (local o Vercel) |
| Dispositivos | PC, tablet, monitor táctil |
| Lector barras | USB (funciona como teclado) |
| Instalación | Ninguna — solo abrir la URL |

No hay que instalar nada en la PC del kiosco. Solo un navegador y conexión a internet.

---

## Pantallas

### 1. Barra superior (siempre visible)

```
┌─────────────────────────────────────────────────────────────┐
│ Comercio IA          Abrir | Vender | Reposición | ...  🟢  │
│                                              CAJA ABIERTA   │
└─────────────────────────────────────────────────────────────┘
```

- Azul oscuro, menú claro
- Indicador verde = caja abierta / rojo = cerrada

### 2. Apertura de caja (`/open`)

- Título: "Apertura de Caja"
- Campo grande: Monto Inicial
- Botón azul: ABRIR CAJA

### 3. Venta principal (`/pos`) — pantalla más importante

```
┌─────────────────────────────────────────┐
│ [ Escanear o buscar producto...    Enter]│
├─────────────────────────────────────────┤
│ [+ Producto Manual]  [Anular Última]    │
├─────────────────────────────────────────┤
│ Coca Cola x2              $5.000    🗑  │
│ Pan x1                      $800    🗑  │
├─────────────────────────────────────────┤
│ TOTAL                        $5.800   │
├─────────────────────────────────────────┤
│ [EFECTIVO]  [QR]  [TARJETA]           │
├─────────────────────────────────────────┤
│            [ COBRAR ]                   │
└─────────────────────────────────────────┘
```

Post-cobro: pantalla verde fullscreen "VENTA REGISTRADA $X.XXX" (1 segundo).

### 4. Reposición (`/restock`)

- Campo escaneo
- Muestra producto + stock actual + stock mínimo
- Campo cantidad + botón AGREGAR STOCK

### 5. Cierre (`/close`)

- Resumen: total vendido, efectivo, QR, tarjeta, operaciones
- Botón rojo: CERRAR CAJA

### 6. Productos (`/admin`)

- Listado con nombre, código, precio, stock
- Buscar, crear, editar, desactivar

---

## Cómo verlo ahora

```bash
npm run dev
# Abrir http://localhost:5173 (o 5174 si 5173 está ocupado)
```

**Nota:** Sin Supabase configurado verás "No hay caja abierta" y listas vacías. Con `.env` conectado funciona el flujo completo.

Ver también: `04-paso-a-paso-pos-local.md`
