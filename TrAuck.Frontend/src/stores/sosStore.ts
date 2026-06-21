import { create } from 'zustand';

interface SosStore {
  sosRequested: boolean;
  requestSos: () => void;
  resetSosRequest: () => void;
}

export const useSosStore = create<SosStore>((set) => ({
  sosRequested: false,
  requestSos: () => set({ sosRequested: true }),
  resetSosRequest: () => set({ sosRequested: false }),
}));
