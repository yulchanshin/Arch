import type { StateCreator } from 'zustand';
import type { AppStore } from './index';
import type { Session, User } from '@supabase/supabase-js';

export type AuthSlice = {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
};

export const createAuthSlice: StateCreator<AppStore, [['zustand/immer', never]], [], AuthSlice> = (set) => ({
  user: null,
  session: null,
  authLoading: true,

  setUser: (user) => {
    set((state) => {
      state.user = user;
      state.authLoading = false;
    });
  },

  setSession: (session) => {
    set((state) => {
      state.session = session;
    });
  },
});
