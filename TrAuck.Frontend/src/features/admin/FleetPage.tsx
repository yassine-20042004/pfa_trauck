import { Card, CardContent } from "@/components/ui/card";
import { Truck, BatteryFull, BatteryMedium, BatteryLow, AlertTriangle, ShieldCheck, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const INITIAL_FLEET = [
  { id: "TRK-001", driver: "Yassine J.", status: "On Route", battery: 85, location: "Casablanca", destination: "Warehouse B" },
  { id: "TRK-002", driver: "Amine M.", status: "Delivering", battery: 42, location: "Rabat", destination: "Client X" },
  { id: "TRK-003", driver: "Karim S.", status: "Idle", battery: 100, location: "Warehouse A", destination: "N/A" },
  { id: "TRK-004", driver: "Hamza B.", status: "Maintenance", battery: 15, location: "Service Center", destination: "N/A" },
  { id: "TRK-005", driver: "Tariq L.", status: "Emergency SOS", battery: 60, location: "Highway A3", destination: "Recalculating..." },
];

export function FleetPage() {
  const [fleetData, setFleetData] = useState(INITIAL_FLEET);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Live battery simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFleetData(prev => prev.map(truck => {
        if (truck.status === 'Idle' || truck.status === 'Maintenance') return truck;
        // Decrease battery slightly randomly
        const drop = Math.random() > 0.7 ? 1 : 0;
        return { ...truck, battery: Math.max(0, truck.battery - drop) };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredFleet = fleetData.filter(truck => {
    const matchesTab = activeTab === "All" || truck.status.includes(activeTab) || (activeTab === 'Emergency' && truck.status === 'Emergency SOS');
    const matchesSearch = truck.id.toLowerCase().includes(searchQuery.toLowerCase()) || truck.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = ["All", "On Route", "Delivering", "Idle", "Emergency"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Fleet Management</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> All Systems Nominal
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/50 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search TRK or Driver..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 text-zinc-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Vehicle ID</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Current Location</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4 rounded-tr-xl">Battery/Fuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredFleet.map((truck) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={truck.id} 
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${truck.status === 'Emergency SOS' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                          <Truck className={`w-4 h-4 ${truck.status === 'Emergency SOS' ? 'text-red-400' : 'text-blue-400'}`} />
                        </div>
                        {truck.id}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{truck.driver}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                          truck.status === 'On Route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          truck.status === 'Delivering' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          truck.status === 'Emergency SOS' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {truck.status === 'Emergency SOS' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {truck.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{truck.location}</td>
                      <td className="px-6 py-4 text-zinc-400">{truck.destination}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {truck.battery > 80 ? <BatteryFull className="w-4 h-4 text-emerald-400" /> :
                           truck.battery > 30 ? <BatteryMedium className="w-4 h-4 text-yellow-400" /> :
                           <BatteryLow className="w-4 h-4 text-red-400 animate-pulse" />}
                          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              layout
                              className={`h-full rounded-full ${truck.battery > 30 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} 
                              style={{ width: `${truck.battery}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 font-mono w-8">{truck.battery}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredFleet.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No vehicles found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
