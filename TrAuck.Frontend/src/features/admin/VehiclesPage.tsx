import { Card, CardContent } from "@/components/ui/card";
import { Truck, Plus, Search, AlertTriangle, Maximize, RefreshCw, Activity, CheckCircle, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  // API may return either camelCase (old) or PascalCase (domain)
  plateNumber?: string;
  licensePlate?: string;
  capacityTons?: number;
  capacity?: number;
  status?: string;
}

// Normalizers: handle both field name variants
const getPlate = (v: Vehicle) => v.plateNumber ?? v.licensePlate ?? "—";
const getCapacity = (v: Vehicle) => v.capacityTons ?? v.capacity ?? 0;

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    licensePlate: "",
    capacity: 0
  });

  const fetchVehicles = async () => {
    setIsSyncing(true);
    try {
      const data = await apiRequest<Vehicle[]>("/vehicles");
      setVehicles(data);
      setIsBackendOffline(false);
    } catch (error) {
      setIsBackendOffline(true);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/vehicles", "POST", formData);
      await fetchVehicles();
      setFormData({ make: "", model: "", licensePlate: "", capacity: 0 });
    } catch (error) {
      console.error("Failed to add vehicle", error);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getPlate(v).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highCapacityCount = vehicles.filter(v => getCapacity(v) >= 40).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Vehicles Fleet
          </h1>
          <p className="text-zinc-400 mt-1">Manage, monitor, and register your logistics transport units.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchVehicles}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 group shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 group-hover:text-emerald-300 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Data
          </button>
          
          {isBackendOffline ? (
            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-yellow-500/5">
              <AlertTriangle className="w-4 h-4" /> API Offline
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Units</p>
              <h3 className="text-2xl font-bold text-white">{vehicles.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Available</p>
              <h3 className="text-2xl font-bold text-white">{vehicles.filter(v => v.status !== "Maintenance").length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">High Capacity (&gt;=40T)</p>
              <h3 className="text-2xl font-bold text-white">{highCapacityCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Register Vehicle
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddVehicle} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Make</label>
                    <input 
                      type="text" 
                      value={formData.make}
                      onChange={e => setFormData({...formData, make: e.target.value})}
                      required
                      placeholder="Volvo"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Model</label>
                    <input 
                      type="text" 
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      required
                      placeholder="FH16"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">License Plate</label>
                  <input 
                    type="text" 
                    value={formData.licensePlate}
                    onChange={e => setFormData({...formData, licensePlate: e.target.value})}
                    required
                    placeholder="ABC-1234"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Capacity (Tons)</label>
                  <input 
                    type="number"
                    step="0.1" 
                    value={formData.capacity || ""}
                    onChange={e => setFormData({...formData, capacity: parseFloat(e.target.value)})}
                    placeholder="40"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
                  />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all mt-4 shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                  Register Unit
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles Grid Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search fleet by make, model or plate..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 backdrop-blur-xl shadow-inner transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredVehicles.map((vehicle) => (
                <motion.div 
                  key={vehicle.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all group hover:bg-zinc-900/60 relative overflow-hidden"
                >
                  {/* Capacity Indicator Glow */}
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 pointer-events-none transition-colors ${
                    getCapacity(vehicle) >= 40 ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors shadow-inner">
                          <Truck className="w-6 h-6 text-zinc-300" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-xs font-mono text-zinc-500 mt-0.5 font-bold tracking-widest">{getPlate(vehicle)}</p>
                      </div>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${
                      getCapacity(vehicle) >= 40 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {getCapacity(vehicle) >= 40 ? 'Heavy Duty' : 'Standard'}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Maximize className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-white">{getCapacity(vehicle)}</span> <span className="text-xs">Tons</span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      ID: #{vehicle.id.substring(0, 8)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredVehicles.length === 0 && (
              <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white font-medium">
                  {isBackendOffline ? "API Offline" : "No vehicles registered"}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">
                  {isBackendOffline ? "Ensure the .NET API is running on localhost:5198" : "Use the form to register your first vehicle"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
