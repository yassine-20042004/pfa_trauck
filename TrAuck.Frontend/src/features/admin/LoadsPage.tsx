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
      await apiRequest("/loadplans", "POST", formData);
      await fetchData();
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            Load Planning & Optimization
          </h1>
          <p className="text-zinc-400 mt-1">Manage, optimize, and visualize cargo loading across trips.</p>
        </div>
        <div className="flex gap-2">
          {isBackendOffline ? (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-medium flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <AlertTriangle className="w-4 h-4" /> Demo Mode
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium flex items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <ShieldCheck className="w-4 h-4" /> API Connected
            </span>
          )}
        </div>
      </motion.div>

      {/* API Integrated Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-colors h-full">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Create Load Plan
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddLoadPlan} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Related Trip</label>
                  <select value={formData.tripId} onChange={e => setFormData({...formData, tripId: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all">
                    <option value="">Select a Trip...</option>
                    {trips.map(t => <option key={t.id} value={t.id}>{t.origin} → {t.destination}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                  <input type="text" placeholder="e.g. Electronics Shipment" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Weight (Tons)</label>
                  <input type="number" step="0.1" placeholder="0.0" value={formData.totalWeight || ""} onChange={e => setFormData({...formData, totalWeight: parseFloat(e.target.value)})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] mt-2">
                  Add Load Plan
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden h-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/60 text-zinc-400 font-semibold border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4">PLAN ID</th>
                      <th className="px-6 py-4">TRIP REF</th>
                      <th className="px-6 py-4">DESCRIPTION</th>
                      <th className="px-6 py-4 text-right">WEIGHT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {loadPlans.map((lp) => (
                        <motion.tr key={lp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-500 group-hover:text-blue-400 transition-colors">#{lp.id?.substring(0, 8) || "N/A"}</td>
                          <td className="px-6 py-4 text-zinc-400 font-mono">
                            <span className="bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-white/10">#{lp.tripId?.substring(0, 8) || "N/A"}</span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">{lp.description}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-mono text-xs border border-blue-500/20">
                              <Weight className="w-3 h-3" /> {lp.totalWeight} T
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {loadPlans.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                          <div className="flex flex-col items-center gap-2 opacity-50">
                            <Box className="w-8 h-8" />
                            <p>No load plans recorded yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px] lg:h-[500px]">
        {/* Package List Sidebar */}
        <Card className="col-span-1 bg-zinc-950/50 border-white/10 backdrop-blur-xl flex flex-col h-full overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
            <CardTitle className="text-white flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" /> Manifest Queue
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-md font-mono">{queue.length} left</span>
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
                  className="p-3 bg-black/40 border border-white/5 hover:border-white/20 transition-colors rounded-xl relative overflow-hidden group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-zinc-600 to-zinc-800 group-hover:from-emerald-400 group-hover:to-emerald-600 transition-colors" />
                  <div className="flex justify-between items-center mb-2 relative z-10 pl-2">
                    <span className="font-semibold text-white text-sm">{pkg.id}</span>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1"><Weight className="w-3 h-3 text-zinc-500"/> {pkg.weight}</span>
                  </div>
                  <div className="flex justify-between items-center relative z-10 text-xs text-zinc-500 pl-2">
                    <span className="flex items-center gap-1"><Maximize className="w-3 h-3 text-zinc-500"/> {pkg.dims}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      pkg.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      pkg.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {pkg.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {queue.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="font-medium text-zinc-400">All packages loaded</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* 3D Visualization Area */}
        <Card className="col-span-2 bg-zinc-950/50 border-white/10 backdrop-blur-xl flex flex-col h-full overflow-hidden relative group">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black pointer-events-none z-10"></div>
          
          <CardHeader className="border-b border-white/5 relative z-20 bg-black/40 backdrop-blur-md">
            <CardTitle className="text-white flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-400" /> TRK-001 Live Cargo Feed
              </span>
              <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Fill:</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${utilization > 80 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} 
                      animate={{ width: `${utilization}%` }} 
                      transition={{ type: "spring", bounce: 0.4 }}
                    />
                  </div>
                  <strong className={`font-mono text-sm ${utilization > 80 ? 'text-red-400' : utilization > 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {utilization}%
                  </strong>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex items-center justify-center relative p-0 overflow-hidden bg-[#050505] z-0 perspective-[1000px]">
             {/* Dynamic 3D Scene */}
             <div className="relative w-full h-full flex items-center justify-center">
                <motion.div 
                  animate={{ rotateY: [0, -360] }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="w-[85%] md:w-[26rem] h-64 border-2 border-indigo-500/20 bg-indigo-950/10 relative flex items-end p-4 flex-wrap gap-2 content-end shadow-[0_0_50px_rgba(79,70,229,0.1)]"
                  style={{ transformStyle: 'preserve-3d', transform: 'rotateX(20deg)' }}
                >
                  {/* Container Wireframe Back/Bottom */}
                  <div className="absolute inset-0 border-2 border-indigo-500/10 bg-indigo-500/5" style={{ transform: 'translateZ(-100px)' }}>
                    <div className="w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[200px] border-2 border-indigo-500/20 bg-indigo-500/10 origin-bottom" style={{ transform: 'rotateX(90deg)' }}>
                    <div className="w-full h-full opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  
                  {/* Packed Boxes */}
                  <AnimatePresence>
                    {packed.map((pkg, i) => (
                      <motion.div 
                        key={`packed-${pkg.id}-${i}`}
                        initial={{ y: -300, opacity: 0, scale: 0.5, rotateX: 45 }} 
                        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }} 
                        transition={{ type: "spring", stiffness: 80, damping: 12 }}
                        className={`border-2 flex items-center justify-center text-xs font-bold relative group ${
                          pkg.color === 'emerald' ? 'bg-emerald-500/90 border-emerald-300 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                          pkg.color === 'purple' ? 'bg-purple-500/90 border-purple-300 text-purple-950 shadow-[0_0_15px_rgba(168,85,247,0.4)]' :
                          'bg-blue-500/90 border-blue-300 text-blue-950 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        }`}
                        style={{ height: `${pkg.h}px`, width: `${pkg.w}px`, transform: `translateZ(${Math.random() * 60 - 30}px)` }}
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {pkg.type === 'Heavy' ? <Weight className="w-4 h-4 opacity-50"/> : null}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Container Wireframe Front */}
                  <div className="absolute inset-0 border-4 border-indigo-500/30 pointer-events-none" style={{ transform: 'translateZ(100px)' }}></div>
                </motion.div>
             </div>

             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-xs text-indigo-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
               Live 3D Optimization Engine
             </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
