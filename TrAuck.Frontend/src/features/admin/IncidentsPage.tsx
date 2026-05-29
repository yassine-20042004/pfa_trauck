import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Plus, Search, ShieldAlert, Clock, MapPin, RefreshCw, Activity, AlertOctagon, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

interface Incident {
  id: string;
  tripId: string;
  description: string;
  reportedAt: string;
  severity: string;
}

interface Trip { id: string; origin: string; destination: string; }


export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [formData, setFormData] = useState({
    tripId: "",
    description: "",
    severity: "Low"
  });

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const [incidentsData, tripsData] = await Promise.all([
        apiRequest<Incident[]>("/incidents"),
        apiRequest<Trip[]>("/trips").catch(() => [])
      ]);
      setIncidents(incidentsData);
      setTrips(tripsData);
      setIsBackendOffline(false);
    } catch (error) {
      setIsBackendOffline(true);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/incidents", "POST", formData);
      await fetchData();
      setFormData({ tripId: "", description: "", severity: "Low" });
    } catch (error) {
      console.error("Failed to report incident", error);
    }
  };

  const filteredIncidents = incidents.filter(i => 
    (i.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (i.tripId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const criticalCount = incidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
  const resolvedCount = 0; // Will be implemented when Incident gains a 'ResolvedAt' field

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Incidents Watch
          </h1>
          <p className="text-zinc-400 mt-1">Monitor safety alerts and trip anomalies in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 group shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 text-red-400 group-hover:text-red-300 ${isSyncing ? "animate-spin" : ""}`} />
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
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-white/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Incidents</p>
              <h3 className="text-2xl font-bold text-white">{incidents.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Critical / High Priority</p>
              <h3 className="text-2xl font-bold text-white">{criticalCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Resolved (Mock)</p>
              <h3 className="text-2xl font-bold text-white">{resolvedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-400" /> Report Anomaly
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleReportIncident} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Target Route (Trip ID)</label>
                  <select value={formData.tripId} onChange={e => setFormData({...formData, tripId: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-zinc-900">Select an Active Route</option>
                    {trips.map(t => <option key={t.id} value={t.id} className="bg-zinc-900">TRP-{t.id.substring(0,6)} : {t.origin} → {t.destination}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Incident Type & Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required 
                    placeholder="Describe the incident in detail..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[120px] placeholder:text-zinc-600 resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Threat Level</label>
                  <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all appearance-none cursor-pointer">
                    <option value="Low" className="bg-zinc-900">Low - Minor Delay</option>
                    <option value="Medium" className="bg-zinc-900">Medium - Warning</option>
                    <option value="High" className="bg-zinc-900">High - Stop Required</option>
                    <option value="Critical" className="bg-zinc-900 text-red-400">Critical - SOS Dispatch</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 rounded-xl transition-all mt-6 shadow-lg shadow-red-500/20 active:scale-[0.98]">
                  Submit Alert
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Incidents Grid Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search reports by description or Trip ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 backdrop-blur-xl shadow-inner transition-all placeholder:text-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredIncidents.map((incident) => (
                <motion.div 
                  key={incident.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all group hover:bg-zinc-900/60 relative overflow-hidden"
                >
                  {/* Status Indicator Glow */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    incident.severity === 'Critical' ? 'bg-red-500' : 
                    incident.severity === 'High' ? 'bg-orange-500' : 
                    incident.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-10 pointer-events-none transition-colors ${
                    incident.severity === 'Critical' ? 'bg-red-500' : 
                    incident.severity === 'High' ? 'bg-orange-500' : 
                    incident.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />

                  <div className="flex items-start justify-between pl-3">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-2">
                         <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${
                            incident.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            incident.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                            incident.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {incident.severity} Level
                         </span>
                         <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                           <Clock className="w-3.5 h-3.5" />
                           {new Date(incident.reportedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                         </div>
                      </div>
                      
                      <h3 className="text-lg font-medium text-white mb-1 leading-snug">{incident.description}</h3>
                      <p className="text-xs text-zinc-500 font-mono">INCID-{(incident.id || "").substring(0, 8)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right border-l border-white/5 pl-6 min-w-[120px]">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Related Trip</span>
                      <div className="flex items-center gap-2 text-sm text-zinc-300 font-mono bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        TRP-{(incident.tripId || "").substring(0, 6)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredIncidents.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-white font-medium">All Clear</h3>
                <p className="text-zinc-500 text-sm mt-1">No incidents or anomalies reported.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
