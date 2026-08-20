import { create } from 'zustand';
import { User } from '@/types';
import { signInUser, signOutUser, getStoredSession } from '@/lib/firebase/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => void;
  login: (email: string, pass: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  usersList: User[];
  addUser: (u: User) => void;
  deleteUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  usersList: [
    { id: 'usr-1', name: 'Admin', email: 'admin@gmail.com', role: 'admin', status: 'active', createdAt: '2026-01-01' },
    { id: 'usr-2', name: 'Tenzin Norgay (Manager)', email: 'manager@gajagamini.com', role: 'manager', status: 'active', createdAt: '2026-01-15' },
    { id: 'usr-3', name: 'Priya Sharma (Operator)', email: 'operator@gajagamini.com', role: 'operator', status: 'active', createdAt: '2026-02-01' },
  ],

  initialize: () => {
    try {
      const stored = getStoredSession();
      set({ user: stored, isLoading: false, error: null });
    } catch (e) {
      set({ user: null, isLoading: false, error: null });
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await signInUser(email, pass);
      set({ user, isLoading: false, error: null });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Login failed' });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOutUser();
      set({ user: null, isLoading: false, error: null });
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  addUser: (u) => set((state) => ({ usersList: [u, ...state.usersList] })),
  deleteUser: (id) => set((state) => ({ usersList: state.usersList.filter((x) => x.id !== id) })),
}));
