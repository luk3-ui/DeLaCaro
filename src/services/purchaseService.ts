import { supabase } from './supabase';
import type { CreatePurchaseInput, Purchase } from '../types';

export async function createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      source: input.source ?? 'manual',
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  const { error: itemError } = await supabase.from('purchase_items').insert({
    purchase_id: purchase.id,
    product_id: input.productId,
    quantity: input.quantity,
  });

  if (itemError) throw itemError;

  return purchase;
}

export async function getRecentPurchases(limit = 10) {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      purchase_items (
        quantity,
        products (name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
