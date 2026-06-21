# Checklist de Validación

Usar antes de entregar al kiosco piloto.

## POS Web (Socio + Franco)

### Apertura y cierre
- [ ] Solo se puede abrir una caja a la vez
- [ ] No se puede vender con caja cerrada
- [ ] Cierre muestra totales por medio de pago
- [ ] Cierre muestra cantidad de operaciones

### Ventas
- [ ] Escaneo agrega producto al carrito (< 1 segundo)
- [ ] Escaneo repetido incrementa cantidad
- [ ] Producto desconocido abre modal de creación
- [ ] Producto manual (pan/fiambre) se agrega sin código
- [ ] Cobro con efectivo, QR y tarjeta funciona
- [ ] Pantalla "VENTA REGISTRADA" aparece post-cobro
- [ ] Anular última venta revierte stock

### Stock
- [ ] Venta descuenta stock automáticamente
- [ ] Reposición suma stock automáticamente
- [ ] `stock_movements` registra cada movimiento
- [ ] Producto con stock bajo se marca en admin

### Productos
- [ ] Crear producto con barcode único
- [ ] Editar producto existente
- [ ] Desactivar producto (no eliminar)
- [ ] Buscar por nombre y código

---

## WhatsApp IA (Franco)

### Seguridad
- [ ] Número no autorizado recibe "No autorizado"
- [ ] IA nunca registra ventas
- [ ] Compras/gastos requieren confirmación SI/NO
- [ ] Acciones quedan en `ai_conversations`

### Consultas
- [ ] "¿Cuánto vendí hoy?"
- [ ] "¿Cuánto stock de [producto]?"
- [ ] "¿Qué productos tienen stock bajo?"
- [ ] "¿Qué fue lo más vendido?"
- [ ] "¿Cómo está el negocio?" (resumen general)

### Registros
- [ ] "Compré X unidades de Y" → confirma → stock sube
- [ ] "Gasté X en Y" → confirma → gasto guardado
- [ ] Mensaje ambiguo → pide aclaración (no inventa datos)

### Audio
- [ ] Audio de voz se transcribe y procesa

### Alertas
- [ ] Stock bajo → alerta WhatsApp (cron hora)
- [ ] Recomendación diaria (20:00)
- [ ] Alertas registradas en tabla `alerts`

---

## Operación en kiosco (Ambos)

- [ ] Empleado nuevo aprende en < 5 minutos
- [ ] PC/tablet del kiosco abre la URL de Vercel
- [ ] Lector de barras USB funciona
- [ ] Internet estable en el local
- [ ] Dueña usa WhatsApp como canal principal
- [ ] Sistema opera 30 días sin intervención manual

---

## Criterio de MVP completado

El piloto está listo cuando **todos** los ítems de "Operación en kiosco" están marcados y al menos el 90% del resto.
