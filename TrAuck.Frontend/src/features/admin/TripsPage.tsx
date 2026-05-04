import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, AlertTriangle, ArrowRight, User, Truck, RefreshCw, Activity, Map, Navigation, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  driverId: string;
  vehicleId: string;
  status: string;
}

interface Driver { id: string; firstName: string; lastName: string; }
interface Vehicle { id: string; make: string; model: string; }

const MOCK_TRIPS: Trip[] = [
  { id: "1", origin: "Casablanca", destination: "Rabat", driverId: "1", vehicleId: "1", status: "In Transit" },
  { id: "2", origin: "Tangier", destination: "Marrakesh", driverId: "2", vehicleId: "2", status: "Pending" },
  { id: "3", origin: "Agadir", destination: "Fes", driverId: "3", vehicleId: "3", status: "Completed" },
];

export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    driverId: "",
    vehicleId: ""
  });

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const [tripsData, driversData, vehiclesData] = await Promise.all([
        apiRequest<Trip[]>("/trips"),
        apiRequest<Driver[]>("/drivers").catch(() => []),
        apiRequest<Vehicle[]>("/vehicles").catch(() => [])
      ]);
      setTrips(tripsData.length ? tripsData : MOCK_TRIPS);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setIsBackendOffline(false);
    } catch (error) {
      setIsBackendOffline(true);
      setTrips(MOCK_TRIPS);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isBackendOffline) {
        const newTrip = { ...formData, id: Math.random().toString(), status: "Pending" };
        setTrips([newTrip, ...trips]);
      } else {
        await apiRequest("/trips", "POST", formData);
        await fetchData();
      }
      setFormData({ origin: "", destination: "", driverId: "", vehicleId: "" });
    } catch (error) {
      console.error("Failed to create trip", error);
    }
  };

  const filteredTrips = trips.filter(t => 
    (t.origin?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (t.destination?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const activeTripsCount = trips.filter(t => t.status === "In Transit").length;
  const pendingTripsCount = trips.filter(t => t.status === "Pending").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Trips & Routing
          </h1>
          <p className="text-zinc-400 mt-1">Plan, dispatch, and track logistics routes in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 group shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-400 group-hover:text-indigo-300 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Data
          </button>
          
          {isBackendOffline ? (
            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-yellow-500/5">
              <AlertTriangle className="w-4 h-4" /> Demo Mode
            </span>
          ) : (
            <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/5">
              <Activity className="w-4 h-4 animate-pulse" /> Live Sync
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Map className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Routes</p>
              <h3 className="text-2xl font-bold text-white">{trips.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">In Transit</p>
              <h3 className="text-2xl font-bold text-white">{activeTripsCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Pending Dispatch</p>
              <h3 className="text-2xl font-bold text-white">{pendingTripsCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Dispatch New Trip
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleCreateTrip} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-zinc-800 rounded-full" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-3 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-zinc-950 -translate-x-[3px]" />
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1 block">Origin City</label>
                        <input type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} required placeholder="Casablanca" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600" />
                      </div>
                      
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-3 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-zinc-950 -translate-x-[3px]" />
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1 block">Destination City</label>
                        <input type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} required placeholder="Rabat" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Assigned Driver</label>
                  <select value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-zinc-900">Select a Driver</option>
                    {drivers.map(d => <option key={d.id} value={d.id} className="bg-zinc-900">{d.firstName} {d.lastName}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Assigned Vehicle</label>
                  <select value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-zinc-900">Select a Vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id} className="bg-zinc-900">{v.make} {v.model}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl transition-all mt-6 shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                  Dispatch Trip
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Trips Grid Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search active routes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 backdrop-blur-xl shadow-inner transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredTrips.map((trip) => (
                <motion.div 
                  key={trip.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all group hover:bg-zinc-900/60 relative overflow-hidden"
                >
                  {/* Status Indicator Glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 pointer-events-none transition-colors ${
                    trip.status === 'In Transit' ? 'bg-cyan-500' : 
                    trip.status === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500'
                  }`} />

                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-mono text-zinc-500 tracking-wider">TRP-{(trip.id || "").substring(0, 8)}</span>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${
                      trip.status === 'In Transit' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                      trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {trip.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-medium">Origin</span>
                      <span className="text-base font-bold text-white">{trip.origin}</span>
                    </div>
                    
                    <div className="flex-1 px-4 flex items-center justify-center relative">
                       <div className="w-full h-px bg-zinc-800 relative">
                         {trip.status === 'In Transit' && (
                           <motion.div 
                             className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-500/20 rounded-full flex items-center justify-center z-10"
                             animate={{ x: [0, 100] }}
                             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                           >
                             <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                           </motion.div>
                         )}
                       </div>
                       <ArrowRight className="absolute text-zinc-600 w-4 h-4" />
                    </div>

                    <div className="flex flex-col text-right">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-medium">Destination</span>
                      <span className="text-base font-bold text-white">{trip.destination}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Driver: {(trip.driverId || "N/A").substring(0, 6)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium bg-white/5 px-2.5 py-1.5 rounded-lg">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{(trip.vehicleId || "N/A").substring(0, 6)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredTrips.length === 0 && (
              <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Map className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white font-medium">No trips found</h3>
                <p className="text-zinc-500 text-sm mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
