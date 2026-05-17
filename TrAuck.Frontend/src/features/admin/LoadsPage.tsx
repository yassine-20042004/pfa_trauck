import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Box, CheckCircle2, Weight, Maximize, AlertTriangle, ShieldCheck, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

interface LoadPlan {
  id: string;
  tripId: string;
  description: string;
  totalWeight: number;
}

interface Trip { id: string; origin: string; destination: string; }

const INITIAL_QUEUE = [
  { id: "PKG-1001", weight: "2.5 kg", dims: "40x30x20", type: "Fragile", color: "blue", delay: 0.5, h: 24, w: 20 },
  { id: "PKG-1002", weight: "12.0 kg", dims: "80x60x40", type: "Heavy", color: "purple", delay: 0.7, h: 32, w: 32 },
  { id: "PKG-1003", weight: "1.2 kg", dims: "20x20x15", type: "Standard", color: "emerald", delay: 0.9, h: 16, w: 16 },
  { id: "PKG-1004", weight: "8.5 kg", dims: "50x50x50", type: "Standard", color: "emerald", delay: 1.1, h: 28, w: 28 },
  { id: "PKG-1005", weight: "4.0 kg", dims: "30x30x30", type: "Liquid", color: "blue", delay: 1.3, h: 20, w: 20 },
];

export function LoadsPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [packed, setPacked] = useState<typeof INITIAL_QUEUE>([]);
  const [utilization, setUtilization] = useState(0);

  // API Integration
  const [loadPlans, setLoadPlans] = useState<LoadPlan[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [formData, setFormData] = useState({ tripId: "", description: "", totalWeight: 0 });

  const fetchData = async () => {
    try {
      const [loadsData, tripsData] = await Promise.all([
        apiRequest<LoadPlan[]>("/loadplans"),
        apiRequest<Trip[]>("/trips")
      ]);
      setLoadPlans(loadsData);
      setTrips(tripsData);
      setIsBackendOffline(false);
    } catch (error) {
      setIsBackendOffline(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLoadPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isBackendOffline) {
        const newPlan = { ...formData, id: Math.random().toString() };
        setLoadPlans([...loadPlans, newPlan]);
      } else {
        await apiRequest("/loadplans", "POST", formData);
        await fetchData();
      }
      setFormData({ tripId: "", description: "", totalWeight: 0 });
    } catch (error) {
      console.error("Failed to add load plan", error);
    }
  };

  // Simulate automated packing process
  useEffect(() => {
    if (queue.length === 0) return;

    const packInterval = setInterval(() => {
      setQueue(prevQueue => {
        if (prevQueue.length === 0) {
          clearInterval(packInterval);
          return prevQueue;
        }
        
        const nextPkg = prevQueue[0];
        setPacked(prevPacked => [...prevPacked, nextPkg]);
        setUtilization(prev => Math.min(100, prev + Math.floor(Math.random() * 15) + 5));
        
        return prevQueue.slice(1);
      });
    }, 2000);

    return () => clearInterval(packInterval);
  }, [queue]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Load Planning & Optimization</h1>
        <div className="flex gap-2">
          {isBackendOffline ? (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Demo Mode
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> API Connected
            </span>
          )}
        </div>
      </div>

      {/* API Integrated Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl">
          <div className="p-6 border-b border-white/5 bg-black/20">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create Load Plan
            </h2>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleAddLoadPlan} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Related Trip</label>
                <select value={formData.tripId} onChange={e => setFormData({...formData, tripId: e.target.value})} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                  <option value="">Select a Trip</option>
                  {trips.map(t => <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Total Weight (Tons)</label>
                <input type="number" step="0.1" value={formData.totalWeight || ""} onChange={e => setFormData({...formData, totalWeight: parseFloat(e.target.value)})} required className="w-full bg-black/50 border border-white/10 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl transition-colors mt-4">
                Add Load Plan
              </button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-black/40 text-zinc-400 font-medium border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Trip</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {loadPlans.map((lp) => (
                      <motion.tr key={lp.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">#{lp.id?.substring(0, 8) || "N/A"}</td>
                        <td className="px-6 py-4 text-zinc-400 font-mono">#{lp.tripId?.substring(0, 8) || "N/A"}</td>
                        <td className="px-6 py-4 text-white font-medium">{lp.description}</td>
                        <td className="px-6 py-4">
                          <span className="text-blue-400 font-mono">{lp.totalWeight}T</span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {loadPlans.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 italic">No load plans recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px] lg:h-[500px]">
        {/* Package List Sidebar */}
        <Card className="col-span-1 bg-zinc-950/50 border-white/10 backdrop-blur-xl flex flex-col h-full overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-black/20">
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" /> Manifest Queue
              </span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-md">{queue.length} left</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {queue.map((pkg, i) => (
                <motion.div 
                  key={`queue-${pkg.id}-${i}`} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="font-semibold text-white">{pkg.id}</span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1"><Weight className="w-3 h-3"/> {pkg.weight}</span>
                  </div>
                  <div className="flex justify-between items-center relative z-10 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3"/> {pkg.dims}</span>
                    <span className={`px-2 py-0.5 rounded-md ${
                      pkg.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                      pkg.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {pkg.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 opacity-50">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <p>All packages loaded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3D Visualization Area */}
        <Card className="col-span-2 bg-zinc-950/50 border-white/10 backdrop-blur-xl flex flex-col h-full overflow-hidden relative group">
          <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none z-10"></div>
          
          <CardHeader className="border-b border-white/5 relative z-20 bg-black/20">
            <CardTitle className="text-white flex items-center justify-between">
              <span>Trailer Visualization (TRK-001)</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-normal text-zinc-400">Utilization:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500 rounded-full" 
                      animate={{ width: `${utilization}%` }} 
                      transition={{ type: "spring" }}
                    />
                  </div>
                  <strong className="text-emerald-400 font-mono">{utilization}%</strong>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex items-center justify-center relative p-0 overflow-hidden bg-gradient-to-b from-zinc-900 to-black z-0">
             {/* Abstract CSS 3D Representation */}
             <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
                <motion.div 
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="w-[90%] md:w-[28rem] h-64 border border-blue-500/20 bg-blue-500/5 relative flex items-end p-4 flex-wrap gap-2 content-end"
                  style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg)' }}
                >
                  {/* Container Wireframe Back/Bottom */}
                  <div className="absolute inset-0 border border-blue-500/20" style={{ transform: 'translateZ(-80px)' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-[160px] border border-blue-500/20 bg-blue-500/5 origin-bottom" style={{ transform: 'rotateX(90deg)' }}></div>
                  
                  {/* Packed Boxes */}
                  <AnimatePresence>
                    {packed.map((pkg, i) => (
                      <motion.div 
                        key={`packed-${pkg.id}-${i}`}
                        initial={{ y: -200, opacity: 0, scale: 0.5 }} 
                        animate={{ y: 0, opacity: 1, scale: 1 }} 
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                        className={`border shadow-2xl flex items-center justify-center text-xs font-bold ${
                          pkg.color === 'emerald' ? 'bg-emerald-500/80 border-emerald-400 text-emerald-950' :
                          pkg.color === 'purple' ? 'bg-purple-500/80 border-purple-400 text-purple-950' :
                          'bg-blue-500/80 border-blue-400 text-blue-950'
                        }`}
                        style={{ height: `${pkg.h}px`, width: `${pkg.w}px`, transform: `translateZ(${Math.random() * 40 - 20}px)` }}
                      >
                        {pkg.type === 'Heavy' ? <Box className="w-4 h-4"/> : null}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Container Wireframe Front */}
                  <div className="absolute inset-0 border-2 border-blue-500/40 pointer-events-none" style={{ transform: 'translateZ(80px)' }}></div>
                </motion.div>
             </div>

             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full border border-white/10 text-xs text-zinc-300 shadow-xl">
               Live GPU Simulation
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
