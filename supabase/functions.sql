-- Funciones RPC para N8N / IA
-- Ejecutar después de schema.sql

-- Consultar stock de un producto por nombre
CREATE OR REPLACE FUNCTION fn_get_stock(p_product_name TEXT DEFAULT NULL)
RETURNS TABLE(name TEXT, stock_current INTEGER, stock_minimum INTEGER, status TEXT) AS $$
BEGIN
  IF p_product_name IS NOT NULL THEN
    RETURN QUERY
    SELECT p.name, p.stock_current, p.stock_minimum,
      CASE
        WHEN p.stock_current = 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock_current <= p.stock_minimum THEN 'LOW_STOCK'
        ELSE 'OK'
      END
    FROM products p
    WHERE p.active = TRUE AND p.name ILIKE '%' || p_product_name || '%';
  ELSE
    RETURN QUERY
    SELECT p.name, p.stock_current, p.stock_minimum,
      CASE
        WHEN p.stock_current = 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock_current <= p.stock_minimum THEN 'LOW_STOCK'
        ELSE 'OK'
      END
    FROM products p
    WHERE p.active = TRUE
    ORDER BY p.name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ventas por período
CREATE OR REPLACE FUNCTION fn_get_sales(p_period TEXT DEFAULT 'today')
RETURNS TABLE(total NUMERIC, sales_count BIGINT, avg_sale NUMERIC) AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  start_date := CASE p_period
    WHEN 'today' THEN DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')
    WHEN 'yesterday' THEN DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires') - INTERVAL '1 day'
    WHEN 'week' THEN NOW() - INTERVAL '7 days'
    WHEN 'month' THEN NOW() - INTERVAL '30 days'
    ELSE DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')
  END;

  RETURN QUERY
  SELECT
    COALESCE(SUM(s.total), 0),
    COUNT(*),
    COALESCE(ROUND(AVG(s.total), 2), 0)
  FROM sales s
  WHERE s.status = 'completed'
    AND s.created_at >= start_date
    AND (p_period != 'yesterday' OR s.created_at < DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'));
END;
$$ LANGUAGE plpgsql;

-- Registrar compra desde IA (con producto por nombre)
CREATE OR REPLACE FUNCTION fn_create_purchase(p_product_name TEXT, p_quantity INTEGER)
RETURNS JSON AS $$
DECLARE
  v_product_id UUID;
  v_purchase_id UUID;
BEGIN
  SELECT id INTO v_product_id
  FROM products
  WHERE active = TRUE AND name ILIKE '%' || p_product_name || '%'
  LIMIT 1;

  IF v_product_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Producto no encontrado: ' || p_product_name);
  END IF;

  INSERT INTO purchases (source, notes) VALUES ('whatsapp', 'Registrado via IA')
  RETURNING id INTO v_purchase_id;

  INSERT INTO purchase_items (purchase_id, product_id, quantity)
  VALUES (v_purchase_id, v_product_id, p_quantity);

  RETURN json_build_object(
    'success', true,
    'product', p_product_name,
    'quantity', p_quantity,
    'purchase_id', v_purchase_id
  );
END;
$$ LANGUAGE plpgsql;

-- Registrar gasto desde IA
CREATE OR REPLACE FUNCTION fn_create_expense(p_description TEXT, p_amount NUMERIC)
RETURNS JSON AS $$
DECLARE
  v_expense_id UUID;
BEGIN
  INSERT INTO expenses (description, amount, source)
  VALUES (p_description, p_amount, 'whatsapp')
  RETURNING id INTO v_expense_id;

  RETURN json_build_object(
    'success', true,
    'description', p_description,
    'amount', p_amount,
    'expense_id', v_expense_id
  );
END;
$$ LANGUAGE plpgsql;

-- Resumen general del negocio
CREATE OR REPLACE FUNCTION fn_business_summary()
RETURNS JSON AS $$
DECLARE
  v_today_sales NUMERIC;
  v_today_count BIGINT;
  v_critical_count BIGINT;
  v_top_product TEXT;
  v_today_expenses NUMERIC;
BEGIN
  SELECT COALESCE(SUM(total), 0), COUNT(*)
  INTO v_today_sales, v_today_count
  FROM sales
  WHERE status = 'completed'
    AND created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires');

  SELECT COUNT(*) INTO v_critical_count
  FROM products WHERE active = TRUE AND stock_current <= stock_minimum;

  SELECT name INTO v_top_product
  FROM vw_top_products LIMIT 1;

  SELECT COALESCE(SUM(amount), 0) INTO v_today_expenses
  FROM expenses
  WHERE created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires');

  RETURN json_build_object(
    'sales_today', v_today_sales,
    'sales_count', v_today_count,
    'critical_products', v_critical_count,
    'top_product', COALESCE(v_top_product, 'N/A'),
    'expenses_today', v_today_expenses
  );
END;
$$ LANGUAGE plpgsql;

-- Validar teléfono autorizado
CREATE OR REPLACE FUNCTION fn_is_authorized(p_phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM authorized_phones
    WHERE phone = p_phone AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Guardar conversación IA
CREATE OR REPLACE FUNCTION fn_save_conversation(p_phone TEXT, p_role TEXT, p_content TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_conversations (phone, role, content) VALUES (p_phone, p_role, p_content);

  DELETE FROM ai_conversations
  WHERE phone = p_phone
    AND id NOT IN (
      SELECT id FROM ai_conversations
      WHERE phone = p_phone
      ORDER BY created_at DESC
      LIMIT 20
    );
END;
$$ LANGUAGE plpgsql;
