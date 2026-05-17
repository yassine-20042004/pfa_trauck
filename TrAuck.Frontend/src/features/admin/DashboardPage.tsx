import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, AlertCircle, Package, Activity, MapPin, Clock, TrendingUp } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";

// Real Casablanca routes (lat/lng)
const DIJKSTRA_ROUTE: [number, number][] = [
  [33.5731, -7.5898], [33.5760, -7.5950], [33.5790, -7.5990],
  [33.5830, -7.6040], [33.5870, -7.6080], [33.5920, -7.6130],
  [33.5960, -7.6170], [33.5990, -7.6210],
];
const BELLMAN_ROUTE: [number, number][] = [
  [33.5530, -7.5898], [33.5560, -7.5840], [33.5600, -7.5770],
  [33.5650, -7.5720], [33.5700, -7.5690],
];
const DESTINATION_PINS: { pos: [number, number]; label: string }[] = [
  { pos: [33.5990, -7.6210], label: "Warehouse B" },
  { pos: [33.5700, -7.5690], label: "Client X" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardPage() {
  // Mock Real-time Data
  const [deliveries, setDeliveries] = useState(142);
  const [truckPos, setTruckPos] = useState({ d: 0, b: 0 });
  const [feedLogs] = useState([
    { id: 1, time: "Just now", text: "TRK-001 passed Checkpoint Alpha", type: "info" },
    { id: 2, time: "2m ago", text: "TRK-005 reported unexpected roadblock", type: "warning" },
    { id: 3, time: "5m ago", text: "Dijkstra recalculation complete for TRK-002", type: "success" },
    { id: 4, time: "12m ago", text: "Warehouse B received shipment PKG-882", type: "info" },
  ]);

  // Simulate live updates
  useEffect(() => {
    // Delivery ticker
    const delInterval = setInterval(() => {
      if (Math.random() > 0.7) setDeliveries(prev => prev + 1);
    }, 4000);

    // Map truck animation
    const mapInterval = setInterval(() => {
      setTruckPos((p) => ({
        d: (p.d + 0.003) % 1,
        b: (p.b + 0.005) % 1,
      }));
    }, 50);

    return () => {
      clearInterval(delInterval);
      clearInterval(mapInterval);
    };
  }, []);

  const lerp = (route: [number, number][], t: number): [number, number] => {
    const idx = t * (route.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = route[Math.min(i, route.length - 1)];
    const b = route[Math.min(i + 1, route.length - 1)];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };
  const dijkstraTruck = lerp(DIJKSTRA_ROUTE, truckPos.d);
  const bellmanTruck = lerp(BELLMAN_ROUTE, truckPos.b);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Top Metric Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Fleet</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Truck className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-white tracking-tight">12<span className="text-xl text-zinc-500 font-normal">/15</span></div>
              <div className="flex items-center mt-2 text-xs text-blue-400">
                <Activity className="w-3 h-3 mr-1" />
                <span>Real-time tracking active</span>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[80%] rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-zinc-400">Deliveries Today</CardTitle>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Package className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-white tracking-tight">{deliveries}</div>
                <motion.div 
                  key={deliveries}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-emerald-400"
                >
                  +1
                </motion.div>
              </div>
              <div className="flex items-center mt-2 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12% from yesterday</span>
              </div>
              {/* Mock Bar Chart */}
              <div className="mt-4 flex items-end gap-1 h-8 opacity-70">
                {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1 }} className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition-colors" />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-xl overflow-hidden relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-400">Active Alerts</CardTitle>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-red-400 tracking-tight">2</div>
              <p className="mt-2 text-xs text-red-400/80">Require immediate dispatcher attention</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300">
                  <span>TRK-005</span>
                  <span className="font-semibold">SOS Alert</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Map Section */}
        <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
          <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden rounded-2xl h-[500px] flex flex-col z-0">
            <CardHeader className="border-b border-white/5 pb-4 bg-zinc-950/80 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400"/> Live Operations Map
                </CardTitle>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative z-0">
              <MapContainer 
                center={[33.5731, -7.5898]} // Casablanca
                zoom={13} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', background: '#09090b' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Routes */}
                <Polyline positions={DIJKSTRA_ROUTE} color="#3b82f6" weight={3} opacity={0.6} />
                <Polyline positions={BELLMAN_ROUTE} color="#ef4444" weight={3} opacity={0.8} dashArray="10 6" />
                
                {/* Animated trucks */}
                <CircleMarker center={dijkstraTruck} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#3b82f6', fillOpacity: 1 }}>
                  <Popup className="dark-popup"><span className="text-xs"><strong>TRK-001</strong><br/>On Route · Dijkstra</span></Popup>
                </CircleMarker>
                <CircleMarker center={bellmanTruck} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#ef4444', fillOpacity: 1 }}>
                  <Popup className="dark-popup"><span className="text-xs text-red-500"><strong>TRK-005 (SOS)</strong><br/>Emergency Reroute</span></Popup>
                </CircleMarker>
                
                {/* Destination pins */}
                {DESTINATION_PINS.map((pin) => (
                  <CircleMarker key={pin.label} center={pin.pos} radius={5} pathOptions={{ color: '#10b981', weight: 2, fillColor: '#fff', fillOpacity: 1 }}>
                    <Popup className="dark-popup"><span className="text-xs text-emerald-500 font-bold">{pin.label}</span></Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Legend overlay */}
              <div className="absolute bottom-4 right-4 z-[400] bg-zinc-950/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md">
                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2 tracking-widest">Routing Engines</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <div className="w-4 h-1 bg-blue-500 rounded-full" /> Dijkstra Standard
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <div className="w-4 h-1 border-t-2 border-dashed border-red-500" /> Bellman-Ford SOS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={item} className="md:col-span-1">
          <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden rounded-2xl h-[500px] flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4 bg-zinc-950/80">
              <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400"/> Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {feedLogs.map((log) => (
                <div key={log.id} className="relative pl-4 border-l border-white/10 group">
                  <div className={`absolute -left-1 top-1 w-2 h-2 rounded-full ${
                    log.type === 'warning' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                    log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                  }`} />
                  <div className="text-[10px] text-zinc-500 font-mono mb-1">{log.time}</div>
                  <p className="text-sm text-zinc-300 leading-tight group-hover:text-white transition-colors">{log.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
