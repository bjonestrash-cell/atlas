import { create } from 'zustand';
import { api } from '../utils/api';

export const useTripStore = create((set) => ({
  trips: [],
  loading: false,
  error: null,

  fetchTrips: async (params) => {
    set({ loading: true, error: null });
    try {
      const trips = await api.getTrips(params);
      set({ trips, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createTrip: async (data) => {
    const trip = await api.createTrip(data);
    set((s) => ({ trips: [...s.trips, trip] }));
    return trip;
  },

  updateTrip: async (id, data) => {
    const trip = await api.updateTrip(id, data);
    set((s) => ({ trips: s.trips.map((t) => (t.id === id ? trip : t)) }));
    return trip;
  },

  deleteTrip: async (id) => {
    await api.deleteTrip(id);
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
  },
}));
