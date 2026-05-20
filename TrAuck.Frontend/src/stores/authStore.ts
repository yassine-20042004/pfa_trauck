import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { token: string; role: string; firstName: string; lastName: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      setAuth: (data) => set({ ...data, isAuthenticated: true }),
      logout: () => set({ token: null, role: null, firstName: null, lastName: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
