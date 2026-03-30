import { create } from 'zustand';
import { api } from '../utils/api';

export const useAlertStore = create((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const alerts = await api.getAlerts();
      set({ alerts, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createAlert: async (data) => {
    const alert = await api.createAlert(data);
    set((s) => ({ alerts: [alert, ...s.alerts] }));
    return alert;
  },

  updateAlert: async (id, data) => {
    const alert = await api.updateAlert(id, data);
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? alert : a)) }));
    return alert;
  },

  deleteAlert: async (id) => {
    await api.deleteAlert(id);
    set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) }));
  },
}));
