import { Button } from "@/components/ui/button";
import { Navigation, MapPin, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useAuthStore } from "@/stores/authStore";
import { apiRequest } from "@/lib/api";

const currentLocIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(59,130,246,0.8);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destinationIcon = new L.DivIcon({
  html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 20px rgba(16,185,129,0.8);"></div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

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

const fetchRoadRoute = async (points: [number, number][]): Promise<[number, number][]> => {
  if (points.length < 2) return points;
  const coords = points.map(p => `${p[1]},${p[0]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data?.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
    }
  } catch (e) {
    console.error('OSRM routing error', e);
  }
  return points;
};

export function TripPage() {
  const userId = useAuthStore(state => state.userId);
  const [driver, setDriver] = useState<any>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  // Swipe to SOS logic
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 200],
    ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 1)"]
  );

  const fetchDriverAndTrip = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get all drivers
      const drivers = await apiRequest<any[]>("/drivers");
      const currentDriver = drivers.find(d => d.userId === userId);

      if (!currentDriver) {
        setError("Driver account profile not found. Please contact the administrator.");
        setIsLoading(false);
        return;
      }
      setDriver(currentDriver);

      // 2. Get all trips
      const trips = await apiRequest<any[]>("/trips");
      // Find active trip assigned to this driver
      const trip = trips.find(t => t.driverId === currentDriver.id && t.status !== "Completed" && t.status !== "Cancelled");

      if (!trip) {
        setActiveTrip(null);
        setIsLoading(false);
        return;
      }

      setActiveTrip(trip);
      setIsEmergency(trip.winner === "Bellman-Ford");

      // 3. Compute road route
      const simpleRoute = buildSimpleRouteArray(trip);
      const roadRoute = await fetchRoadRoute(simpleRoute);
      setRoutePoints(roadRoute);
    } catch (err: any) {
      setError("Failed to load active trip data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDriverAndTrip();
    }
  }, [userId]);

  const handleDragEnd = async (_event: any, info: any) => {
    if (info.offset.x > 150 && activeTrip) {
      try {
        setIsEmergency(true);
        
        // 1. Report incident
        await apiRequest("/incidents", "POST", {
          tripId: activeTrip.id,
          description: "SOS emergency protocol activated by driver",
          severity: "Critical"
        });

        // 2. Update trip winner routing to Bellman-Ford
        await apiRequest(`/trips/${activeTrip.id}`, "PUT", {
          id: activeTrip.id,
          origin: activeTrip.origin,
          destination: activeTrip.destination,
          driverId: activeTrip.driverId,
          vehicleId: activeTrip.vehicleId,
          distance: activeTrip.distance,
          duration: activeTrip.duration,
          winner: "Bellman-Ford",
          zonesJson: activeTrip.zonesJson,
          customCoordsJson: activeTrip.customCoordsJson,
          status: "Ongoing"
        });

        // Refetch trip
        fetchDriverAndTrip();
      } catch (err) {
        console.error("SOS trigger failed", err);
      }
    }
  };

  const handleResumeNavigation = async () => {
    if (!activeTrip) return;
    try {
      setIsEmergency(false);
      
      // Update trip: reset winner routing to Dijkstra and ensure status is Ongoing
      await apiRequest(`/trips/${activeTrip.id}`, "PUT", {
        id: activeTrip.id,
        origin: activeTrip.origin,
        destination: activeTrip.destination,
        driverId: activeTrip.driverId,
        vehicleId: activeTrip.vehicleId,
        distance: activeTrip.distance,
        duration: activeTrip.duration,
        winner: "Dijkstra",
        zonesJson: activeTrip.zonesJson,
        customCoordsJson: activeTrip.customCoordsJson,
        status: "Ongoing"
      });

      // Refetch trip to recalculate route
      fetchDriverAndTrip();
    } catch (err) {
      console.error("Failed to resume navigation", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-sm">Retrieving active trip data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950 text-zinc-400 p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
        <p className="text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-950 text-zinc-400 p-6 text-center">
        <MapPin className="w-12 h-12 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Trip</h2>
        <p className="text-sm max-w-xs">You currently don't have any active trip assigned. Check back later or contact dispatcher.</p>
      </div>
    );
  }

  const startCoord = routePoints[0] || [33.5731, -7.5898];
  const destCoord = routePoints[routePoints.length - 1] || [33.5950, -7.6200];

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Map Area */}
      <div className="relative flex-1 bg-zinc-900 overflow-hidden z-0 mask-image-bottom">
         <MapContainer 
            center={startCoord} 
            zoom={13} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#09090b' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={startCoord} icon={currentLocIcon}>
              <Popup className="dark-popup">Origin: {activeTrip.origin}</Popup>
            </Marker>

            <Marker position={destCoord} icon={destinationIcon}>
              <Popup className="dark-popup">Destination: {activeTrip.destination}</Popup>
            </Marker>

            {routePoints.length > 0 && (
              <Polyline 
                positions={routePoints} 
                color={isEmergency ? "#ef4444" : "#3b82f6"} 
                weight={6} 
                dashArray={isEmergency ? "15, 15" : ""}
                className={isEmergency ? "animate-pulse" : ""}
              />
            )}
          </MapContainer>
          
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

          {isEmergency && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 py-4 bg-red-600/90 backdrop-blur-md border border-red-400 text-white font-bold rounded-2xl shadow-[0_20px_40px_rgba(239,68,68,0.5)] flex items-center justify-center gap-3"
              >
                <ShieldAlert className="w-6 h-6 animate-pulse" /> 
                <span className="tracking-widest uppercase text-sm">Rerouting Protocol Active</span>
              </motion.div>
            </div>
          )}
      </div>

      {/* Info Panel */}
      <div className="h-[48%] bg-zinc-950/90 backdrop-blur-2xl p-6 rounded-t-[40px] -mt-10 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t border-white/10 flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent rounded-t-[40px] pointer-events-none" />
        
        <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 shadow-inner" />
        
        <div className="mt-6 relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                 <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase">
                   Next Stop • {driver?.firstName} {driver?.lastName}
                 </p>
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-2">
                {activeTrip.destination}
              </h2>
              <p className="text-zinc-500 mt-1 font-medium flex items-center gap-1.5 font-sans">
                <MapPin className="w-4 h-4" /> Route from {activeTrip.origin}
              </p>
            </div>
            <div className="text-right bg-gradient-to-br from-blue-500/20 to-blue-600/5 px-5 py-3 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <p className="text-3xl font-black text-blue-400 tracking-tight">
                {Math.round(activeTrip.duration)}<span className="text-base text-blue-400/70 ml-1 font-medium">min</span>
              </p>
              <p className="text-sm font-bold text-zinc-400 mt-0.5 tracking-wider">{activeTrip.distance.toFixed(1)} km</p>
            </div>
          </div>
          
          <Button 
            onClick={handleResumeNavigation} 
            className="w-full h-16 text-lg font-bold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="h-6 w-6 fill-current" />
            Resume Navigation
          </Button>
        </div>

        {/* Swipe to SOS */}
        <div className="mt-auto pt-6 pb-2 relative z-10">
          {!isEmergency ? (
            <div className="relative h-16 bg-zinc-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-red-500/20 shadow-inner">
               <motion.div style={{ background }} className="absolute inset-0" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-sm font-black tracking-widest text-red-500/80 uppercase">Slide for SOS</span>
               </div>
               <motion.div
                 drag="x"
                 dragConstraints={{ left: 0, right: 280 }}
                 dragElastic={0.05}
                 onDragEnd={handleDragEnd}
                 style={{ x }}
                 className="absolute left-1.5 top-1.5 bottom-1.5 w-16 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10 border border-red-400"
               >
                 <AlertTriangle className="h-6 w-6 text-white" />
               </motion.div>
            </div>
          ) : (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center border border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)] relative overflow-hidden"
             >
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
               <span className="text-base font-black text-white uppercase tracking-widest flex items-center gap-3 relative z-10">
                 <AlertTriangle className="h-6 w-6" />
                 Emergency Alert Sent
               </span>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
