import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, AlertCircle, Package, Activity, MapPin, Clock, TrendingUp, Users } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const MOROCCAN_CITIES = [
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { name: 'Tanger', lat: 35.7595, lon: -5.8340 },
  { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { name: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { name: 'Fès', lat: 34.0331, lon: -5.0003 },
  { name: 'Meknès', lat: 33.8926, lon: -5.5511 },
  { name: 'Oujda', lat: 34.6814, lon: -1.9086 },
  { name: 'Nador', lat: 35.1667, lon: -2.9333 },
  { name: 'Laâyoune', lat: 27.1500, lon: -13.2000 },
  { name: 'Dakhla', lat: 23.6848, lon: -15.9580 },
  { name: 'Kenitra', lat: 34.2610, lon: -6.5802 },
  { name: 'Tetouan', lat: 35.5785, lon: -5.3684 },
  { name: 'Safi', lat: 32.2994, lon: -9.2372 },
  { name: 'El Jadida', lat: 33.2311, lon: -8.5007 },
  { name: 'Beni Mellal', lat: 32.3394, lon: -6.3608 },
  { name: 'Errachidia', lat: 31.9314, lon: -4.4244 },
  { name: 'Ouarzazate', lat: 30.9189, lon: -6.8934 },
  { name: 'Al Hoceima', lat: 35.2442, lon: -3.9366 },
  { name: 'Chefchaouen', lat: 35.1714, lon: -5.2697 },
];

const getTripCoords = (cityName: string, customCoords: any, type: string, zoneId?: string): [number, number] => {
  if (type === 'origin' && customCoords?.origin) return [customCoords.origin.lat, customCoords.origin.lon];
  if (type === 'destination' && customCoords?.destination) return [customCoords.destination.lat, customCoords.destination.lon];
  if (type === 'zone' && zoneId && customCoords?.zones?.[zoneId]) return [customCoords.zones[zoneId].lat, customCoords.zones[zoneId].lon];
  
  const city = MOROCCAN_CITIES.find(c => c.name.toLowerCase() === (cityName || '').toLowerCase());
  if (city) return [city.lat, city.lon];
  return [33.5731, -7.5898]; // fallback Casablanca
};

const buildRouteArray = (trip: any): [number, number][] => {
  const route: [number, number][] = [];
  const customCoords = trip.customCoordsJson ? JSON.parse(trip.customCoordsJson) : {};
  
  route.push(getTripCoords(trip.origin, customCoords, 'origin'));
  
  const zones = trip.zonesJson ? JSON.parse(trip.zonesJson) : [];
  zones.forEach((z: any) => {
      route.push(getTripCoords(z.city, customCoords, 'zone', z.id));
  });
  
  route.push(getTripCoords(trip.destination, customCoords, 'destination'));
  
  return route;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Simple route builder (straight line) – used as fallback
const buildSimpleRouteArray = (trip: any): [number, number][] => {
  const route: [number, number][] = [];
  const customCoords = trip.customCoordsJson ? JSON.parse(trip.customCoordsJson) : {};
  route.push(getTripCoords(trip.origin, customCoords, 'origin'));
  const zones = trip.zonesJson ? JSON.parse(trip.zonesJson) : [];
  zones.forEach((z: any) => {
    route.push(getTripCoords(z.city, customCoords, 'zone', z.id));
  });
  route.push(getTripCoords(trip.destination, customCoords, 'destination'));
  return route;
};

// Fetch real road route from OSRM (public server)
const fetchRoadRoute = async (points: [number, number][]): Promise<[number, number][]> => {
  if (points.length < 2) return points;
  // OSRM expects lon,lat order
  const coords = points.map(p => `${p[1]},${p[0]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.routes?.[0]?.geometry?.coordinates) {
      // Convert back to [lat, lon]
      return data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
    }
  } catch (e) {
    console.error('OSRM routing error', e);
  }
  return points; // fallback to straight line
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function DashboardPage() {
  // Live API data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  // Store computed road routes per trip id
  const [routesMap, setRoutesMap] = useState<Record<string, [number, number][]>>({});
  
  // Computed stats
  const activeVehicles = vehicles.filter(v => v.status !== "Maintenance" && v.status !== "Available").length;
  const totalVehicles = vehicles.length;
  const alertCount = activeIncidents.filter(i => i.severity === "Critical" || i.severity === "High").length;

  // Animated delivery counter (demo)
  const [deliveries, setDeliveries] = useState(142);
  const [globalT, setGlobalT] = useState(0);
  const [feedLogs, setFeedLogs] = useState([
    { id: 1, time: "Just now", text: "TRK-001 passed Checkpoint Alpha", type: "info" },
    { id: 2, time: "2m ago", text: "TRK-005 reported unexpected roadblock", type: "warning" },
    { id: 3, time: "5m ago", text: "Dijkstra recalculation complete for TRK-002", type: "success" },
    { id: 4, time: "12m ago", text: "Warehouse B received shipment PKG-882", type: "info" },
  ]);

  // Fetch live stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [v, i, t] = await Promise.all([
          apiRequest<any[]>("/vehicles").catch(() => []),
          apiRequest<any[]>("/incidents").catch(() => []),
          apiRequest<any[]>("/trips").catch(() => [])
        ]);
        setVehicles(v);
        setActiveIncidents(i);
        setTrips(t);
        // After trips are set, compute road routes
        const computeRoutes = async () => {
          const newMap: Record<string, [number, number][]> = {};
          await Promise.all(t.map(async (trip: any) => {
            const simple = buildSimpleRouteArray(trip);
            const road = await fetchRoadRoute(simple);
            newMap[trip.id] = road;
          }));
          setRoutesMap(newMap);
        };
        computeRoutes();
        // Update feed with real incident data
        if (i.length > 0) {
          const recentIncident = i[0];
          setFeedLogs(prev => [{
            id: Date.now(),
            time: "Just now",
            text: `Incident reported: ${recentIncident.description?.substring(0, 50)}`,
            type: recentIncident.severity === "Critical" || recentIncident.severity === "High" ? "warning" : "info"
          }, ...prev.slice(0, 3)]);
        }
      } catch {}
    };
    fetchStats();
    const refreshInterval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(refreshInterval);
  }, []);

  // Simulate live updates
  useEffect(() => {
    // Delivery ticker
    const delInterval = setInterval(() => {
      if (Math.random() > 0.7) setDeliveries(prev => prev + 1);
    }, 4000);

    // Map truck animation
    const mapInterval = setInterval(() => {
      setGlobalT((p) => (p + 0.002) % 1);
    }, 50);

    return () => {
      clearInterval(delInterval);
      clearInterval(mapInterval);
    };
  }, []);

  const lerp = (route: [number, number][], t: number): [number, number] => {
    if (!route || route.length === 0) return [0,0];
    if (route.length === 1) return route[0];
    const idx = t * (route.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = route[Math.min(i, route.length - 1)];
    const b = route[Math.min(i + 1, route.length - 1)];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  };

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
              <div className="text-4xl font-bold text-white tracking-tight">
                {totalVehicles > 0 ? activeVehicles : "—"}
                <span className="text-xl text-zinc-500 font-normal">/{totalVehicles > 0 ? totalVehicles : "—"}</span>
              </div>
              <div className="flex items-center mt-2 text-xs text-blue-400">
                <Activity className="w-3 h-3 mr-1" />
                <span>Real-time tracking active</span>
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700" 
                  style={{ width: totalVehicles > 0 ? `${(activeVehicles / totalVehicles) * 100}%` : "0%" }}
                />
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
              <div className="text-4xl font-bold text-red-400 tracking-tight">{alertCount}</div>
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
                  center={[31, -6]} // Wider view including sea
                  zoom={4} 
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%', background: '#09090b' }}
                  zoomControl={false}
                >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                         {/* Dynamic Routes & Trucks */}
                {trips.slice(0, 5).map((trip, idx) => {
  const baseRoute = routesMap[trip.id] || [];
  if (baseRoute.length === 0) return null;
  // Add a point out to sea (westward) for demonstration
  const seaPoint: [number, number] = [baseRoute[baseRoute.length - 1][0], baseRoute[baseRoute.length - 1][1] - 1];
  const route = [...baseRoute, seaPoint];

  const isBellman = trip.winner === 'Bellman-Ford';
  const color = isBellman ? '#ef4444' : '#3b82f6';
  // Add slight offset so they don't all overlap if they start at same time
  const t = (globalT + (idx * 0.13)) % 1;
  const truckPos = lerp(route, t);

  return (
    <React.Fragment key={trip.id}>
      <Polyline positions={route} color={color} weight={3} opacity={0.6} dashArray={isBellman ? "10 6" : undefined} />
      <CircleMarker center={truckPos} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}>
        <Popup className="dark-popup">
          <span className="text-xs">
            <strong className={isBellman ? "text-red-500" : ""}>TRK-{trip.vehicleId?.substring(0,4) || 'XXX'}</strong>
            <br/>Route: {trip.origin} ➔ {trip.destination}
            <br/>{trip.winner}
          </span>
        </Popup>
      </CircleMarker>
      {/* Origin marker */}
      <CircleMarker center={route[0]} radius={4} pathOptions={{ color: '#22d3ee', weight: 2, fillColor: '#161b22', fillOpacity: 1 }} />
      {/* Destination marker (original destination) */}
      <CircleMarker center={baseRoute[baseRoute.length - 1]} radius={4} pathOptions={{ color: '#22c55e', weight: 2, fillColor: '#161b22', fillOpacity: 1 }} />
      {/* Sea marker */}
      <CircleMarker center={seaPoint} radius={4} pathOptions={{ color: '#00ffff', weight: 2, fillColor: '#00ffff', fillOpacity: 1 }} />
    </React.Fragment>
  );
})}
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
              {trips.slice(0, 5).map((trip, idx) => {
                const zones = trip.zonesJson ? JSON.parse(trip.zonesJson) : [];
                const routeCities = [trip.origin, ...zones.map((z: any) => z.city), trip.destination];
                const N = routeCities.length;
                const isBellman = trip.winner === 'Bellman-Ford';
                
                // Calculate dynamic progress
                const t = (globalT + (idx * 0.13)) % 1;
                let text = "";
                let cityDisplay = "";
                
                if (N > 1) {
                  const segmentProgress = t * (N - 1);
                  const currentIdx = Math.floor(segmentProgress);
                  const city = routeCities[currentIdx];
                  
                  if (currentIdx === 0) {
                    text = `Départ imminent`;
                    cityDisplay = city;
                  } else if (currentIdx === N - 1) {
                    text = `Arrivé à destination`;
                    cityDisplay = city;
                  } else {
                    text = `Étape actuelle`;
                    cityDisplay = city;
                  }
                } else {
                  text = `Localisation`;
                  cityDisplay = routeCities[0];
                }

                return (
                  <div key={trip.id} className="relative pl-4 border-l border-white/10 group">
                    <div className={`absolute -left-1 top-1 w-2 h-2 rounded-full ${
                      isBellman ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                      'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                    }`} />
                    <div className="text-[10px] text-zinc-500 font-mono mb-1">
                      TRK-{trip.vehicleId?.substring(0,4) || 'XXX'} • Live
                    </div>
                    <div className="flex flex-col gap-0.5 group-hover:text-white transition-colors">
                      <span className="text-xs text-zinc-400">{text}</span>
                      <span className="text-sm font-bold text-white">{cityDisplay}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
