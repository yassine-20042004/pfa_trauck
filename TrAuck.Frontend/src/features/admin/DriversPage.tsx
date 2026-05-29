import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ShieldCheck, Search, AlertTriangle, User, RefreshCw, Star, Phone, MapPin, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  isAvailable: boolean;
  phone?: string;
  rating?: number;
}


export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    licenseNumber: "",
    phone: ""
  });

  const fetchDrivers = async () => {
    setIsSyncing(true);
    try {
      const data = await apiRequest<Driver[]>("/drivers");
      setDrivers(data.map(d => ({ ...d, rating: d.rating || (4 + Math.random()), phone: d.phone || "+212 600 000000" })));
      setIsBackendOffline(false);
    } catch (error) {
      console.warn("Backend offline");
      setIsBackendOffline(true);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/drivers", "POST", formData);
      await fetchDrivers();
      setFormData({ firstName: "", lastName: "", licenseNumber: "", phone: "" });
    } catch (error) {
      console.error("Failed to add driver", error);
    }
  };

  const filteredDrivers = drivers.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = drivers.filter(d => d.isAvailable).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Drivers Fleet
          </h1>
          <p className="text-zinc-400 mt-1">Manage and synchronize your logistics personnel in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDrivers}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 group shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 ${isSyncing ? "animate-spin" : ""}`} />
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Drivers</p>
              <h3 className="text-2xl font-bold text-white">{drivers.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Available Now</p>
              <h3 className="text-2xl font-bold text-white">{availableCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">On Mission</p>
              <h3 className="text-2xl font-bold text-white">{drivers.length - availableCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" /> Register Driver
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddDriver} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      required
                      placeholder="John"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      required
                      placeholder="Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">License ID</label>
                  <input 
                    type="text" 
                    value={formData.licenseNumber}
                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                    required
                    placeholder="LIC-000000"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Phone Contact</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+212 6..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                  />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                  Onboard Driver
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Grid Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search fleet by name or license..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 backdrop-blur-xl shadow-inner transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredDrivers.map((driver) => (
                <motion.div 
                  key={driver.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all group hover:bg-zinc-900/60 relative overflow-hidden"
                >
                  {/* Status Indicator Glow */}
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 pointer-events-none transition-colors ${
                    driver.isAvailable ? 'bg-emerald-500' : 'bg-orange-500'
                  }`} />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors shadow-inner">
                          <span className="text-lg font-bold text-white/80">
                            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950 ${
                          driver.isAvailable ? 'bg-emerald-500' : 'bg-orange-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">{driver.firstName} {driver.lastName}</h3>
                        <p className="text-xs font-mono text-zinc-500 mt-0.5">{driver.licenseNumber}</p>
                      </div>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${
                      driver.isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                      {driver.isAvailable ? 'Available' : 'On Route'}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-500 text-sm font-medium bg-yellow-500/5 px-2 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-yellow-500" />
                      {driver.rating?.toFixed(1) || "New"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredDrivers.length === 0 && (
              <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-white font-medium">No drivers found</h3>
                <p className="text-zinc-500 text-sm mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
