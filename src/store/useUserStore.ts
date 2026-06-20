import { create } from 'zustand';
import type { User } from '../../shared';

interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => void;
}

const MOCK_CURRENT_USER: User = {
  id: 'current-user',
  nickname: '匿名玩家',
  avatar: '🎭',
  reputation: 100,
  hostedCount: 0,
  ghostCount: 0,
  playStyles: [],
  reviews: [],
};

export const useUserStore = create<UserState>((set) => ({
  currentUser: MOCK_CURRENT_USER,
  setCurrentUser: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));
