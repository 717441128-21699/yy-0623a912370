import { create } from 'zustand';
import type { Fleet } from '../../shared';
import { fleetApi } from '../utils/api';

interface FleetState {
  fleets: Fleet[];
  currentFleet: Fleet | null;
  loading: boolean;
  error: string | null;
  filters: {
    city: string;
    district: string;
    type: string;
    startTime: string;
  };
  setFilters: (filters: Partial<FleetState['filters']>) => void;
  fetchFleets: () => Promise<void>;
  fetchFleet: (id: string) => Promise<void>;
  clearCurrentFleet: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  fleets: [],
  currentFleet: null,
  loading: false,
  error: null,
  filters: {
    city: '上海',
    district: '',
    type: '',
    startTime: '',
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchFleets();
  },

  fetchFleets: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const fleets = await fleetApi.getFleets(filters);
      set({ fleets, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchFleet: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const fleet = await fleetApi.getFleet(id);
      set({ currentFleet: fleet, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearCurrentFleet: () => {
    set({ currentFleet: null });
  },
}));
