export type PaymentMethod = 'cash' | 'qr' | 'card';

export type CashSessionStatus = 'OPEN' | 'CLOSED';

export type SaleStatus = 'completed' | 'cancelled';

export type MovementType = 'SALE' | 'PURCHASE' | 'MANUAL' | 'ADJUSTMENT';

export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RECOMMEND_RESTOCK';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string | null;
  price: number;
  stock_current: number;
  stock_minimum: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CashSession {
  id: string;
  opening_amount: number;
  opened_at: string;
  closed_at: string | null;
  total_sales: number;
  total_cash: number;
  total_qr: number;
  total_card: number;
  sales_count: number;
  status: CashSessionStatus;
}

export interface Sale {
  id: string;
  cash_session_id: string;
  total: number;
  payment_method: PaymentMethod;
  status: SaleStatus;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  source: string;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  source: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateProductInput {
  barcode: string;
  name: string;
  category?: string;
  price: number;
  stock_current?: number;
  stock_minimum?: number;
}

export interface CreateSaleInput {
  cashSessionId: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  total: number;
}

export interface CreatePurchaseInput {
  productId: string;
  quantity: number;
  source?: string;
  notes?: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  source?: string;
}
