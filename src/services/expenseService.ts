import { supabase } from './supabase';
import type { CreateExpenseInput, Expense } from '../types';

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      description: input.description,
      amount: input.amount,
      source: input.source ?? 'manual',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentExpenses(limit = 10): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getWeeklyExpenses(): Promise<{ total: number; items: Expense[] }> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const items = data ?? [];
  return {
    total: items.reduce((sum, e) => sum + Number(e.amount), 0),
    items,
  };
}
