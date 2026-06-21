import { create } from 'zustand';
import type { CashSession } from '../types';
import * as cashService from '../services/cashService';

interface CashStore {
  session: CashSession | null;
  loading: boolean;
  error: string | null;
  loadSession: () => Promise<void>;
  openSession: (amount: number) => Promise<void>;
  closeSession: () => Promise<void>;
}

export const useCashStore = create<CashStore>((set, get) => ({
  session: null,
  loading: false,
  error: null,

  loadSession: async () => {
    set({ loading: true, error: null });
    try {
      const session = await cashService.getActiveSession();
      set({ session, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  openSession: async (amount) => {
    set({ loading: true, error: null });
    try {
      const session = await cashService.openSession(amount);
      set({ session, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  closeSession: async () => {
    const { session } = get();
    if (!session) throw new Error('No hay caja abierta');

    set({ loading: true, error: null });
    try {
      await cashService.closeSession(session.id);
      set({ session: null, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },
}));
