-- Comercio IA - Schema completo MVP
-- Ejecutar en Supabase SQL Editor

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_current INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 10,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opening_amount NUMERIC(12,2) DEFAULT 0,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    total_sales NUMERIC(12,2) DEFAULT 0,
    total_cash NUMERIC(12,2) DEFAULT 0,
    total_qr NUMERIC(12,2) DEFAULT 0,
    total_card NUMERIC(12,2) DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_session_id UUID REFERENCES cash_sessions(id),
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT DEFAULT 'manual',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    source TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    movement_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authorized_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_sales_session ON sales(cash_session_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_phone ON ai_conversations(phone);

-- ============================================================
-- RESTRICCIÓN: UNA SOLA CAJA ABIERTA
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_open_cash_session
ON cash_sessions (status)
WHERE status = 'OPEN';

-- ============================================================
-- TRIGGERS: STOCK EN VENTA
-- ============================================================

CREATE OR REPLACE FUNCTION sale_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        UPDATE products
        SET stock_current = stock_current - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;

        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id)
        VALUES (NEW.product_id, 'SALE', -NEW.quantity, NEW.sale_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sale_stock ON sale_items;
CREATE TRIGGER trg_sale_stock
AFTER INSERT ON sale_items
FOR EACH ROW EXECUTE FUNCTION sale_stock_trigger();

-- ============================================================
-- TRIGGERS: STOCK EN COMPRA
-- ============================================================

CREATE OR REPLACE FUNCTION purchase_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_current = stock_current + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id)
    VALUES (NEW.product_id, 'PURCHASE', NEW.quantity, NEW.purchase_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_purchase_stock ON purchase_items;
CREATE TRIGGER trg_purchase_stock
AFTER INSERT ON purchase_items
FOR EACH ROW EXECUTE FUNCTION purchase_stock_trigger();

-- ============================================================
-- TRIGGERS: ALERTA STOCK BAJO
-- ============================================================

CREATE OR REPLACE FUNCTION low_stock_alert_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_current <= NEW.stock_minimum AND NEW.active = TRUE THEN
        INSERT INTO alerts (type, title, description, status)
        VALUES (
            CASE WHEN NEW.stock_current = 0 THEN 'OUT_OF_STOCK' ELSE 'LOW_STOCK' END,
            NEW.name,
            'Stock: ' || NEW.stock_current || ' | Mínimo: ' || NEW.stock_minimum,
            'pending'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_low_stock_alert ON products;
CREATE TRIGGER trg_low_stock_alert
AFTER UPDATE OF stock_current ON products
FOR EACH ROW EXECUTE FUNCTION low_stock_alert_trigger();

-- ============================================================
-- TRIGGERS: ANULACIÓN DE VENTA (revertir stock)
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_sale_stock_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
        UPDATE products p
        SET stock_current = p.stock_current + si.quantity,
            updated_at = NOW()
        FROM sale_items si
        WHERE si.sale_id = NEW.id
          AND si.product_id = p.id;

        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id)
        SELECT si.product_id, 'ADJUSTMENT', si.quantity, NEW.id
        FROM sale_items si
        WHERE si.sale_id = NEW.id AND si.product_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cancel_sale_stock ON sales;
CREATE TRIGGER trg_cancel_sale_stock
AFTER UPDATE OF status ON sales
FOR EACH ROW EXECUTE FUNCTION cancel_sale_stock_trigger();

-- ============================================================
-- VISTAS PARA IA
-- ============================================================

CREATE OR REPLACE VIEW vw_top_products AS
SELECT
    p.name,
    p.barcode,
    COALESCE(SUM(si.quantity), 0) AS total_sold,
    COALESCE(SUM(si.subtotal), 0) AS total_revenue
FROM products p
LEFT JOIN sale_items si ON si.product_id = p.id
LEFT JOIN sales s ON s.id = si.sale_id AND s.status = 'completed'
WHERE p.active = TRUE
GROUP BY p.id, p.name, p.barcode
ORDER BY total_sold DESC;

CREATE OR REPLACE VIEW vw_low_stock AS
SELECT
    id,
    name,
    barcode,
    stock_current,
    stock_minimum,
    CASE
        WHEN stock_current = 0 THEN 'OUT_OF_STOCK'
        WHEN stock_current <= stock_minimum THEN 'LOW_STOCK'
        ELSE 'OK'
    END AS status
FROM products
WHERE active = TRUE
  AND stock_current <= stock_minimum
ORDER BY stock_current ASC;

CREATE OR REPLACE VIEW vw_daily_sales AS
SELECT
    DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') AS sale_date,
    COUNT(*) AS sales_count,
    SUM(total) AS total_amount,
    SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) AS cash_total,
    SUM(CASE WHEN payment_method = 'qr' THEN total ELSE 0 END) AS qr_total,
    SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) AS card_total
FROM sales
WHERE status = 'completed'
GROUP BY DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires')
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW vw_daily_expenses AS
SELECT
    DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') AS expense_date,
    COUNT(*) AS expense_count,
    SUM(amount) AS total_amount
FROM expenses
GROUP BY DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires')
ORDER BY expense_date DESC;

CREATE OR REPLACE VIEW vw_restock_recommendations AS
SELECT
    p.id,
    p.name,
    p.stock_current,
    p.stock_minimum,
    COALESCE(
        ROUND(AVG(si.quantity)::NUMERIC, 1),
        0
    ) AS avg_weekly_sales
FROM products p
LEFT JOIN sale_items si ON si.product_id = p.id
LEFT JOIN sales s ON s.id = si.sale_id
    AND s.status = 'completed'
    AND s.created_at >= NOW() - INTERVAL '7 days'
WHERE p.active = TRUE
GROUP BY p.id, p.name, p.stock_current, p.stock_minimum
HAVING p.stock_current < COALESCE(AVG(si.quantity), p.stock_minimum)
ORDER BY p.stock_current ASC;

CREATE OR REPLACE VIEW vw_no_movement_products AS
SELECT
    p.id,
    p.name,
    p.stock_current,
    COALESCE(MAX(s.created_at), p.created_at) AS last_sale_at,
    EXTRACT(DAY FROM NOW() - COALESCE(MAX(s.created_at), p.created_at)) AS days_without_sale
FROM products p
LEFT JOIN sale_items si ON si.product_id = p.id
LEFT JOIN sales s ON s.id = si.sale_id AND s.status = 'completed'
WHERE p.active = TRUE
GROUP BY p.id, p.name, p.stock_current, p.created_at
HAVING COALESCE(MAX(s.created_at), p.created_at) < NOW() - INTERVAL '30 days'
ORDER BY days_without_sale DESC;

-- ============================================================
-- RLS (Row Level Security) - MVP monocliente
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON cash_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON purchase_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON authorized_phones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON ai_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON alerts FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DATOS INICIALES DE EJEMPLO (opcional, comentar en prod)
-- ============================================================

-- INSERT INTO authorized_phones (phone, name) VALUES ('5493420000000', 'Dueña');
