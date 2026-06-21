import { create } from 'zustand';

interface Location {
  lat: number;
  lng: number;
}

interface Vehicle {
  id: string;
  driverId: string;
  status: 'Idle' | 'OnRoute' | 'Emergency';
  location: Location;
}

interface FleetState {
  vehicles: Vehicle[];
  updateVehicleLocation: (id: string, location: Location) => void;
  setVehicleEmergency: (id: string) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  vehicles: [],
  updateVehicleLocation: (id, location) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, location } : v
      ),
    })),
  setVehicleEmergency: (id) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, status: 'Emergency' } : v
      ),
    })),
}));
