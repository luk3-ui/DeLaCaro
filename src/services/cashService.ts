import { supabase } from './supabase';
import type { CashSession } from '../types';

export async function getActiveSession(): Promise<CashSession | null> {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('status', 'OPEN')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function openSession(openingAmount: number): Promise<CashSession> {
  const existing = await getActiveSession();
  if (existing) {
    throw new Error('Ya hay una caja abierta');
  }

  const { data, error } = await supabase
    .from('cash_sessions')
    .insert({
      opening_amount: openingAmount,
      status: 'OPEN',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function closeSession(sessionId: string): Promise<CashSession> {
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('total, payment_method')
    .eq('cash_session_id', sessionId)
    .eq('status', 'completed');

  if (salesError) throw salesError;

  const totals = (sales ?? []).reduce(
    (acc, sale) => {
      acc.total += Number(sale.total);
      acc.count += 1;
      if (sale.payment_method === 'cash') acc.cash += Number(sale.total);
      if (sale.payment_method === 'qr') acc.qr += Number(sale.total);
      if (sale.payment_method === 'card') acc.card += Number(sale.total);
      return acc;
    },
    { total: 0, cash: 0, qr: 0, card: 0, count: 0 }
  );

  const { data, error } = await supabase
    .from('cash_sessions')
    .update({
      status: 'CLOSED',
      closed_at: new Date().toISOString(),
      total_sales: totals.total,
      total_cash: totals.cash,
      total_qr: totals.qr,
      total_card: totals.card,
      sales_count: totals.count,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionSummary(sessionId: string) {
  const { data: sales, error } = await supabase
    .from('sales')
    .select('total, payment_method')
    .eq('cash_session_id', sessionId)
    .eq('status', 'completed');

  if (error) throw error;

  return (sales ?? []).reduce(
    (acc, sale) => {
      acc.total += Number(sale.total);
      acc.count += 1;
      if (sale.payment_method === 'cash') acc.cash += Number(sale.total);
      if (sale.payment_method === 'qr') acc.qr += Number(sale.total);
      if (sale.payment_method === 'card') acc.card += Number(sale.total);
      return acc;
    },
    { total: 0, cash: 0, qr: 0, card: 0, count: 0 }
  );
}
