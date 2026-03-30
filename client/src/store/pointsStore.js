import { create } from 'zustand';
import { api } from '../utils/api';

export const usePointsStore = create((set) => ({
  programs: [],
  transactions: [],
  loading: false,
  error: null,

  fetchPrograms: async () => {
    set({ loading: true, error: null });
    try {
      const programs = await api.getPoints();
      set({ programs, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createOrUpdateProgram: async (data) => {
    const program = await api.createPoint(data);
    set((s) => {
      const exists = s.programs.find((p) => p.id === program.id);
      if (exists) {
        return { programs: s.programs.map((p) => (p.id === program.id ? program : p)) };
      }
      return { programs: [...s.programs, program] };
    });
    return program;
  },

  updateProgram: async (id, data) => {
    const program = await api.updatePoint(id, data);
    set((s) => ({ programs: s.programs.map((p) => (p.id === id ? program : p)) }));
    return program;
  },

  deleteProgram: async (id) => {
    await api.deletePoint(id);
    set((s) => ({ programs: s.programs.filter((p) => p.id !== id) }));
  },

  fetchTransactions: async (program) => {
    const transactions = await api.getTransactions(program);
    set({ transactions });
  },

  createTransaction: async (data) => {
    const txn = await api.createTransaction(data);
    set((s) => ({ transactions: [txn, ...s.transactions] }));
    // Refresh programs to get updated balances
    const programs = await api.getPoints();
    set({ programs });
    return txn;
  },

  getTotalValue: () => {
    const { programs } = usePointsStore.getState();
    return programs.reduce((sum, p) => sum + (p.balance * p.cpp) / 100, 0);
  },
}));
