import { create } from 'zustand';
import type { RadarSubscription, FleetMatch, RadarSubscriptionCreateInput } from '../../shared';
import { radarApi } from '../utils/api';
import { useUserStore } from './useUserStore';

interface RadarState {
  subscriptions: RadarSubscription[];
  matches: FleetMatch[];
  loading: boolean;
  error: string | null;
  fetchSubscriptions: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  addSubscription: (data: RadarSubscriptionCreateInput) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  markMatchRead: (id: string) => Promise<void>;
  batchMarkRead: (matchIds: string[]) => Promise<void>;
}

export const useRadarStore = create<RadarState>((set, get) => ({
  subscriptions: [],
  matches: [],
  loading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useUserStore.getState().currentUser?.id;
      const subscriptions = await radarApi.getSubscriptions(userId);
      set({ subscriptions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const userId = useUserStore.getState().currentUser?.id;
      const matches = await radarApi.getMatches({ userId });
      set({ matches, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addSubscription: async (data) => {
    set({ loading: true, error: null });
    try {
      await radarApi.createSubscription(data);
      await get().fetchSubscriptions();
      await get().fetchMatches();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  removeSubscription: async (id) => {
    set({ loading: true, error: null });
    try {
      await radarApi.deleteSubscription(id);
      await get().fetchSubscriptions();
      await get().fetchMatches();
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  markMatchRead: async (id) => {
    try {
      await radarApi.markMatchRead(id);
      await get().fetchMatches();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  batchMarkRead: async (matchIds) => {
    try {
      const userId = useUserStore.getState().currentUser?.id;
      await radarApi.batchMarkRead({ userId, matchIds });
      await get().fetchMatches();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
