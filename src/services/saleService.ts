import { supabase } from './supabase';
import type { CreateSaleInput, Sale, SaleItem } from '../types';

export async function createSale(input: CreateSaleInput): Promise<Sale> {
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      cash_session_id: input.cashSessionId,
      total: input.total,
      payment_method: input.paymentMethod,
      status: 'completed',
    })
    .select()
    .single();

  if (saleError) throw saleError;

  const items = input.items.map((item) => ({
    sale_id: sale.id,
    product_id: item.productId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase.from('sale_items').insert(items);
  if (itemsError) throw itemsError;

  return sale;
}

export async function getLastSale(sessionId: string): Promise<(Sale & { items: SaleItem[] }) | null> {
  const { data: sale, error } = await supabase
    .from('sales')
    .select('*')
    .eq('cash_session_id', sessionId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!sale) return null;

  const { data: items, error: itemsError } = await supabase
    .from('sale_items')
    .select('*')
    .eq('sale_id', sale.id);

  if (itemsError) throw itemsError;

  return { ...sale, items: items ?? [] };
}

export async function cancelLastSale(sessionId: string): Promise<void> {
  const lastSale = await getLastSale(sessionId);
  if (!lastSale) throw new Error('No hay ventas para anular');

  const { error } = await supabase
    .from('sales')
    .update({ status: 'cancelled' })
    .eq('id', lastSale.id);

  if (error) throw error;
}

export async function getTodaySales(): Promise<{ total: number; count: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('sales')
    .select('total')
    .eq('status', 'completed')
    .gte('created_at', today.toISOString());

  if (error) throw error;

  const sales = data ?? [];
  return {
    total: sales.reduce((sum, s) => sum + Number(s.total), 0),
    count: sales.length,
  };
}
