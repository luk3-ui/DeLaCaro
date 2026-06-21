-- Datos de ejemplo para desarrollo / demo
-- Ejecutar después de schema.sql

INSERT INTO products (barcode, name, category, price, stock_current, stock_minimum) VALUES
  ('7790895001234', 'Coca Cola 2.25L', 'Bebidas', 2500, 47, 20),
  ('7790895005678', 'Pepsi 2.25L', 'Bebidas', 2200, 5, 20),
  ('7790315001234', 'Oreo Original', 'Golosinas', 1000, 30, 15),
  ('7790315005678', 'Papas Lays Clásicas', 'Snacks', 1800, 12, 10),
  ('7790744001234', 'Quilmes 1L', 'Bebidas', 1500, 8, 15),
  ('7790744005678', 'Agua Mineral 2L', 'Bebidas', 800, 50, 20),
  ('7790895009999', 'Red Bull 250ml', 'Bebidas', 2000, 3, 10),
  ('7790315009999', 'Alfajor Havanna', 'Golosinas', 1200, 25, 10)
ON CONFLICT (barcode) DO NOTHING;

INSERT INTO authorized_phones (phone, name) VALUES
  ('5493420000000', 'Dueña')
ON CONFLICT (phone) DO NOTHING;
