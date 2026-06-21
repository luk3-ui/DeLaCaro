import { supabase } from './supabase';
import type { CreateProductInput, Product } from '../types';

export async function getByBarcode(barcode: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .or(`name.ilike.%${query}%,barcode.ilike.%${query}%`)
    .order('name')
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      barcode: input.barcode,
      name: input.name,
      category: input.category ?? null,
      price: input.price,
      stock_current: input.stock_current ?? 0,
      stock_minimum: input.stock_minimum ?? 10,
      active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<CreateProductInput & { active: boolean }>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateStock(id: string, quantity: number): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ stock_current: quantity, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
