import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (data: { token: string; role: string; firstName: string; lastName: string; email?: string; userId?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      firstName: null,
      lastName: null,
      email: null,
      userId: null,
      isAuthenticated: false,
      setAuth: (data) => set({ ...data, isAuthenticated: true }),
      logout: () => set({ token: null, role: null, firstName: null, lastName: null, email: null, userId: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
