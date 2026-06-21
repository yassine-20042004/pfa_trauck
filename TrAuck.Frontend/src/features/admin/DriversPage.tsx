import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ShieldCheck, Search, AlertTriangle, User, RefreshCw, Star, Phone, MapPin, Activity, Mail, Lock, FileText } from "lucide-react";
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
  email?: string;
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
    phone: "",
    email: "",
    password: ""
  });

  const fetchDrivers = async () => {
    setIsSyncing(true);
    try {
      const data = await apiRequest<Driver[]>("/drivers");
      setDrivers(data.map(d => ({ 
        ...d, 
        rating: d.rating || (4 + Math.random()), 
        phone: d.phone || "+212 600 000000" 
      })));
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
      setFormData({ firstName: "", lastName: "", licenseNumber: "", phone: "", email: "", password: "" });
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16 px-2 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            Drivers Fleet
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base font-medium">
            Manage, provision and synchronize your logistics crew in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDrivers}
            className="px-5 py-2.5 bg-zinc-950/80 border border-white/10 hover:border-white/20 hover:bg-zinc-900 rounded-2xl text-sm font-semibold text-white transition-all flex items-center gap-2 group shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_30px_rgba(59,130,246,0.15)] active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Data
          </button>
          
          {isBackendOffline ? (
            <span className="px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/5">
              <AlertTriangle className="w-4 h-4 animate-bounce" /> Demo Mode
            </span>
          ) : (
            <span className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Activity className="w-4 h-4 animate-pulse" /> Live Sync
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: "Total Drivers", value: drivers.length, icon: User, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
          { title: "Available Now", value: availableCount, icon: ShieldCheck, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
          { title: "On Mission", value: drivers.length - availableCount, icon: MapPin, color: "from-indigo-500/20 to-indigo-600/5", iconColor: "text-indigo-400" }
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="p-6 flex items-center gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon className={`w-7 h-7 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{kpi.title}</p>
                  <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-white/5 bg-black/40">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                Onboard Driver
              </h2>
            </div>
            
            <CardContent className="p-6">
              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      required
                      placeholder="John"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      required
                      placeholder="Doe"
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" /> License ID
                  </label>
                  <input 
                    type="text" 
                    value={formData.licenseNumber}
                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                    required
                    placeholder="LIC-000000"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700 font-mono tracking-wide"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> Phone Contact
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                    placeholder="+212 600 000 000"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="driver@trauck.com"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" /> Account Password
                  </label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20 transition-all placeholder:text-zinc-700"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all mt-6 shadow-[0_4px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_35px_rgba(59,130,246,0.5)] active:scale-[0.98] border border-blue-400/20"
                >
                  Onboard Crew Member
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Grid Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search fleet by driver name or license..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 backdrop-blur-xl shadow-inner transition-all placeholder:text-zinc-600 hover:border-white/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredDrivers.map((driver) => (
                <motion.div 
                  key={driver.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-zinc-950/40 border border-white/5 hover:border-white/20 rounded-3xl p-6 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:bg-zinc-900/40 relative overflow-hidden"
                >
                  {/* Neon Glow Corner */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-15 pointer-events-none transition-colors ${
                    driver.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-zinc-800 via-zinc-900 to-zinc-950 flex items-center justify-center border border-white/10 group-hover:border-blue-500/40 transition-all duration-300 shadow-inner">
                          <span className="text-xl font-black text-zinc-300 group-hover:text-white transition-colors uppercase">
                            {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-3 border-zinc-950 animate-pulse ${
                          driver.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                          {driver.firstName} {driver.lastName}
                        </h3>
                        <p className="text-xs font-mono text-zinc-500 font-bold mt-1 tracking-wider uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5 w-fit">
                          {driver.licenseNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-xl text-[10px] uppercase tracking-widest font-black border ${
                      driver.isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                    }`}>
                      {driver.isAvailable ? 'Available' : 'On Mission'}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-zinc-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <span>{driver.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-amber-500 text-sm font-black bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-xl shadow-md">
                      <Star className="w-4 h-4 fill-amber-500" />
                      {driver.rating?.toFixed(1) || "New"}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredDrivers.length === 0 && (
              <div className="md:col-span-2 py-16 flex flex-col items-center justify-center text-center bg-zinc-950/20 rounded-3xl border border-dashed border-white/10 p-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-inner">
                  <Search className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-white font-extrabold text-lg">No crew members found</h3>
                <p className="text-zinc-500 text-sm mt-1 max-w-xs">We couldn't find any drivers matching your search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
