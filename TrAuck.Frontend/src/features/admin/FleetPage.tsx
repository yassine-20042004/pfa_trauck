import { Card, CardContent } from "@/components/ui/card";
import { Truck, BatteryFull, BatteryMedium, BatteryLow, AlertTriangle, Search, RefreshCw, Activity, X, MapPin, ChevronLeft, ChevronRight, Clock, Navigation, User, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
];

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const INITIAL_FLEET = [
  { id: "TRK-001", driver: "Yassine J.", status: "On Route", battery: 85, location: "Casablanca", destination: "Warehouse B" },
  { id: "TRK-002", driver: "Amine M.", status: "Delivering", battery: 42, location: "Rabat", destination: "Client X" },
  { id: "TRK-003", driver: "Karim S.", status: "Idle", battery: 100, location: "Warehouse A", destination: "N/A" },
  { id: "TRK-004", driver: "Hamza B.", status: "Maintenance", battery: 15, location: "Service Center", destination: "N/A" },
  { id: "TRK-005", driver: "Tariq L.", status: "Emergency SOS", battery: 60, location: "Highway A3", destination: "Recalculating..." },
];

interface FleetItem {
  id: string;
  driver: string;
  status: string;
  battery: number;
  location: string;
  destination: string;
  vehicleDbId: string;
}

export function FleetPage() {
  const [fleetData, setFleetData] = useState<FleetItem[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExactSearch, setIsExactSearch] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<any[]>([]);
  // Pagination for completed missions
  const [completedPage, setCompletedPage] = useState(0);
  const COMPLETED_PER_PAGE = 2;
  const [isCompletedExactSearch, setIsCompletedExactSearch] = useState(false);
  // Pagination for active fleet
  const [fleetPage, setFleetPage] = useState(0);
  const FLEET_PER_PAGE = 2;
  // Detail modal for completed missions
  const [selectedMission, setSelectedMission] = useState<any>(null);
  // Search inside completed missions
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");

  const fetchFleetStatus = async () => {
    setIsSyncing(true);
    try {
      const [trips, drivers, vehicles, incidents] = await Promise.all([
        apiRequest<any[]>("/trips").catch(() => []),
        apiRequest<any[]>("/drivers").catch(() => []),
        apiRequest<any[]>("/vehicles").catch(() => []),
        apiRequest<any[]>("/incidents").catch(() => [])
      ]);

      const activeTrips = trips.filter((t: any) => t.status !== "Completed" && t.status !== "Cancelled");
      const completedTrips = trips.filter((t: any) => t.status === "Completed");

      const mappedCompleted = completedTrips.map((t: any) => {
        const driverObj = drivers.find((d: any) => d.id === t.driverId);
        const vehicleObj = vehicles.find((v: any) => v.id === t.vehicleId);
        const vehiclePlateStr = vehicleObj ? (vehicleObj.plateNumber || (vehicleObj.id ? String(vehicleObj.id).substring(0, 4) : "0000")) : "N/A";
        let zones: any[] = [];
        try { zones = JSON.parse(t.zonesJson || "[]"); } catch {}
        return {
          id: t.id,
          vehiclePlate: vehiclePlateStr.toUpperCase(),
          vehicleMake: vehicleObj ? `${vehicleObj.make || ''} ${vehicleObj.model || ''}`.trim() : "N/A",
          vehicleType: vehicleObj?.type || "N/A",
          driverName: driverObj && driverObj.firstName && driverObj.lastName ? `${driverObj.firstName} ${driverObj.lastName}` : "Chauffeur",
          driverPhone: driverObj?.phone || "N/A",
          driverRating: driverObj?.rating || null,
          origin: t.origin || "N/A",
          destination: t.destination || "N/A",
          distance: t.distance || 0,
          duration: t.duration || 0,
          zones,
          winner: t.winner || "Dijkstra",
          createdAt: t.createdAt || null
        };
      }).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setCompletedMissions(mappedCompleted);

      const mappedFleet = vehicles.map((v: any) => {
        const activeTrip = activeTrips.find((t: any) => t.vehicleId === v.id);
        const driverObj = activeTrip ? drivers.find((d: any) => d.id === activeTrip.driverId) : null;

        let status = "Idle";
        let location = "Dépôt";
        let destination = "N/A";
        let driverName = "Aucun Chauffeur";
        let fuelVal = 100;

        if (v.status === "Maintenance") {
          // ── 1. Maintenance ──────────────────────────────────
          status = "Maintenance";
          location = "Centre Service";
        } else if (activeTrip) {
          driverName = driverObj && driverObj.firstName && driverObj.lastName
            ? `${driverObj.firstName} ${driverObj.lastName}`
            : "Chauffeur Assigné";
          destination = activeTrip.destination || "N/A";
          location = activeTrip.origin || "Dépôt";

          // Parse customCoordsJson once — safely
          let cc: any = {};
          try {
            if (activeTrip.customCoordsJson) cc = JSON.parse(activeTrip.customCoordsJson);
          } catch { cc = {}; }

          // Real GPS position (from simulation telemetry sync)
          const hasGps = cc.currentLocation
            && typeof cc.currentLocation.lat === "number"
            && typeof cc.currentLocation.lon === "number";

          // Update location label from GPS
          if (hasGps) {
            let nearestCity = MOROCCAN_CITIES[0];
            let minDist = Infinity;
            for (const city of MOROCCAN_CITIES) {
              const d = haversine(cc.currentLocation.lat, cc.currentLocation.lon, city.lat, city.lon);
              if (d < minDist) { minDist = d; nearestCity = city; }
            }
            location = minDist < 20
              ? `Près de ${nearestCity.name}`
              : `En transit (${cc.currentLocation.lat.toFixed(2)}, ${cc.currentLocation.lon.toFixed(2)})`;
          }

          // Real fuel from simulation
          if (cc.simulatedFuel !== undefined && !isNaN(Number(cc.simulatedFuel))) {
            fuelVal = Math.round(Number(cc.simulatedFuel));
          } else {
            const dur = !isNaN(Number(activeTrip.duration)) ? Number(activeTrip.duration) : 0;
            fuelVal = Math.max(5, Math.round(80 - (dur % 40)));
          }

          // ── 2. En attente (trip not started yet) ─────────────
          if (activeTrip.status === "Planned") {
            status = "En attente";
          }
          // ── 3. Emergency SOS (Bellman-Ford winner) ───────────
          else if (activeTrip.winner === "Bellman-Ford") {
            status = "Emergency SOS";
            location = "⚡ Alerte SOS en Cours";
            destination = "Routage d'urgence...";
          }
          // ── 4. Resting ───────────────────────────────────────
          else {
            // Check incidents sorted by reportedAt (newest first)
            const tripIncidents = incidents
              .filter((i: any) => i.tripId === activeTrip.id)
              .sort((a: any, b: any) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

            const latestIncident = tripIncidents[0];
            const latestDesc = latestIncident?.description || "";

            // isResting is TRUE only when:
            //   - customCoordsJson flag isResting===true  AND
            //   - latest incident is NOT [REPRISE] (which clears rest)
            // OR latest incident IS a [PAUSE] tag
            const flagSaysResting = cc.isResting === true;
            const flagSaysResume = cc.isResting === false;
            const incidentIsResting = latestDesc.includes("[PAUSE]") || latestDesc.includes("[PAUSE AUTOMATIQUE]");
            const incidentIsResume = latestDesc.includes("[REPRISE]");

            const isResting = (flagSaysResting && !incidentIsResume && !flagSaysResume) || (incidentIsResting && !incidentIsResume);

            if (isResting) {
              status = "Resting";
              const stopName = cc.activeRestStop || null;
              // Extract stop name from incident description
              const stopMatch = latestDesc.match(/aire de repos\s*[:\-]?\s*([^.]+?)(?:\.|$)/i);
              location = stopName
                ? `☕ Aire: ${stopName}`
                : stopMatch
                  ? `☕ ${stopMatch[1].trim()}`
                  : "☕ Aire de repos";
            }
            // ── 5. Delivering (close to destination) ──────────
            else {
              // Only mark "Delivering" if we have REAL GPS coords AND real destination coords
              // Never fall back to a default city to avoid false positives
              let isCloseToDest = false;

              if (hasGps) {
                // Prefer explicit destination coords stored in customCoordsJson
                const hasDestCoords = cc.destination
                  && typeof cc.destination.lat === "number"
                  && typeof cc.destination.lon === "number";

                // Fallback: find destination city in known cities list (exact name match)
                const destCity = activeTrip.destination
                  ? MOROCCAN_CITIES.find(c =>
                      c.name.toLowerCase() === (activeTrip.destination || "").toLowerCase()
                    )
                  : null;

                if (hasDestCoords) {
                  const dist = haversine(
                    cc.currentLocation.lat, cc.currentLocation.lon,
                    cc.destination.lat, cc.destination.lon
                  );
                  isCloseToDest = dist <= 8.0;
                } else if (destCity) {
                  const dist = haversine(
                    cc.currentLocation.lat, cc.currentLocation.lon,
                    destCity.lat, destCity.lon
                  );
                  isCloseToDest = dist <= 8.0;
                }
                // If neither source available → never show Delivering (avoid false positive)
              }

              status = isCloseToDest ? "Delivering" : "On Route";
            }
          }
        } else {
          // No active trip → check if vehicle has a completed/cancelled trip to show clean idle
          fuelVal = 100;
        }

        const normalizedFuel = isNaN(fuelVal) ? 100 : Math.max(5, Math.min(100, fuelVal));
        const vehicleIdStr = v.id ? String(v.id) : "";
        return {
          id: `TRK-${v.plateNumber || (vehicleIdStr ? vehicleIdStr.substring(0, 4) : "0000")}`.toUpperCase(),
          driver: driverName,
          status,
          battery: normalizedFuel,
          location,
          destination,
          vehicleDbId: v.id
        };
      });

      setFleetData(mappedFleet);
      setIsBackendOffline(false);
    } catch (error) {
      console.warn("Backend offline, using demo data");
      setIsBackendOffline(true);
      // Fallback
      setFleetData(INITIAL_FLEET.map(t => ({ ...t, vehicleDbId: t.id })));
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchFleetStatus();
    // Poll updates every 6 seconds for real-time dashboard feel
    const poll = setInterval(fetchFleetStatus, 6000);
    return () => clearInterval(poll);
  }, []);

  const filteredFleet = fleetData.filter(truck => {
    const matchesTab = 
      activeTab === "All" || 
      truck.status === activeTab || 
      (activeTab === "On Route" && truck.status === "Delivering");
    
    let matchesSearch = false;
    if (!searchQuery) {
      matchesSearch = true;
    } else {
      const q = searchQuery.toLowerCase().trim();
      const idLower = truck.id.toLowerCase().trim();
      const driverLower = truck.driver.toLowerCase().trim();
      if (isExactSearch) {
        const idWithoutPrefix = idLower.replace(/^trk-/, "");
        matchesSearch = idLower === q || idWithoutPrefix === q || driverLower === q;
      } else {
        matchesSearch = idLower.includes(q) || driverLower.includes(q);
      }
    }
    return matchesTab && matchesSearch;
  });

  const paginatedFleet = filteredFleet.slice(
    fleetPage * FLEET_PER_PAGE,
    (fleetPage + 1) * FLEET_PER_PAGE
  );

  const tabs = ["All", "En attente", "On Route", "Delivering", "Resting", "Emergency SOS", "Maintenance", "Idle"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Fleet Monitoring</h1>
          <p className="text-zinc-500 text-sm mt-1">Surveillance en temps réel de l'état des camions, chauffeurs et missions actives.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchFleetStatus}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2 group"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Status
          </button>
          {isBackendOffline ? (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Demo Mode
            </span>
          ) : (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Telemetry
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/50 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setFleetPage(0); }}
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

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-900/60 border border-white/10 px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition-colors">
            <input 
              type="checkbox" 
              checked={isExactSearch}
              onChange={(e) => { setIsExactSearch(e.target.checked); setFleetPage(0); }}
              className="w-3.5 h-3.5 rounded border-white/20 bg-zinc-950 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-500"
            />
            <span className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Recherche exacte</span>
          </label>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search TRK or Driver..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setFleetPage(0); }}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-650 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/40 text-zinc-400 font-medium border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Véhicule ID</th>
                  <th className="px-6 py-4">Chauffeur</th>
                  <th className="px-6 py-4">Statut Mission</th>
                  <th className="px-6 py-4">Localisation Actuelle</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Carburant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {paginatedFleet.map((truck) => (
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
                        <div className={`p-2 rounded-lg ${
                          truck.status === 'Emergency SOS' ? 'bg-red-500/10' :
                          truck.status === 'Maintenance' ? 'bg-orange-500/10' :
                          truck.status === 'Delivering' ? 'bg-emerald-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          <Truck className={`w-4 h-4 ${
                            truck.status === 'Emergency SOS' ? 'text-red-400' :
                            truck.status === 'Maintenance' ? 'text-orange-400' :
                            truck.status === 'Delivering' ? 'text-emerald-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        {truck.id}
                      </td>
                      <td className="px-6 py-4 text-zinc-350">{truck.driver}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                          truck.status === 'On Route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          truck.status === 'Delivering' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' :
                          truck.status === 'Resting' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse' :
                          truck.status === 'Emergency SOS' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse font-black' :
                          truck.status === 'En attente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold' :
                          truck.status === 'Maintenance' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {truck.status === 'Emergency SOS' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {truck.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{truck.location}</td>
                      <td className="px-6 py-4 text-zinc-450">{truck.destination}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {truck.battery > 70 ? <BatteryFull className="w-4 h-4 text-emerald-400 animate-pulse" /> :
                           truck.battery > 30 ? <BatteryMedium className="w-4 h-4 text-yellow-400" /> :
                           <BatteryLow className="w-4 h-4 text-red-400 animate-pulse" />}
                          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              layout
                              className={`h-full rounded-full ${truck.battery > 30 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} 
                              style={{ width: `${truck.battery}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-450 font-mono w-8">{truck.battery}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredFleet.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-semibold">
                      Aucun véhicule ne correspond aux filtres de recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(() => {
            const totalPages = Math.ceil(filteredFleet.length / FLEET_PER_PAGE);
            if (filteredFleet.length <= FLEET_PER_PAGE) return null;
            return (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20">
                <span className="text-xs text-zinc-500">
                  Page {fleetPage + 1} / {totalPages} — {filteredFleet.length} véhicule{filteredFleet.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFleetPage(p => Math.max(0, p - 1))}
                    disabled={fleetPage === 0}
                    className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-semibold text-white disabled:opacity-30 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                  </button>
                  <button
                    onClick={() => setFleetPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={fleetPage >= totalPages - 1}
                    className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-semibold text-white disabled:opacity-30 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    Suivant <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Completed Missions History Table — with pagination + detail modal */}
      <div className="mt-12 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Missions Terminées</h2>
            <p className="text-zinc-500 text-sm mt-1">Historique et archives des trajets livrés — cliquez pour voir les détails.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-900/60 border border-white/10 px-3 py-2 rounded-xl hover:bg-zinc-800/80 transition-colors">
              <input 
                type="checkbox" 
                checked={isCompletedExactSearch}
                onChange={(e) => { setIsCompletedExactSearch(e.target.checked); setCompletedPage(0); }}
                className="w-3.5 h-3.5 rounded border-white/20 bg-zinc-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <span className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">Recherche exacte</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Chauffeur ou TRK..."
                value={completedSearchQuery}
                onChange={(e) => { setCompletedSearchQuery(e.target.value); setCompletedPage(0); }}
                className="bg-zinc-900/80 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-650 focus:outline-none focus:border-emerald-500/50 transition-colors w-52"
              />
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold whitespace-nowrap">
              {completedMissions.length} mission{completedMissions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-black/40 text-zinc-400 font-medium border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Véhicule</th>
                    <th className="px-6 py-4">Chauffeur</th>
                    <th className="px-6 py-4">Origine</th>
                    <th className="px-6 py-4">Destination</th>
                    <th className="px-6 py-4">Distance</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 rounded-tr-2xl">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {completedMissions
                    .filter((m) => {
                      if (!completedSearchQuery) return true;
                      const q = completedSearchQuery.toLowerCase().trim();
                      const driverLower = m.driverName.toLowerCase().trim();
                      const plateLower = m.vehiclePlate.toLowerCase().trim();
                      if (isCompletedExactSearch) {
                        const plateWithoutPrefix = plateLower.replace(/^trk-/, "");
                        const queryWithoutPrefix = q.replace(/^trk-/, "");
                        return (
                          driverLower === q ||
                          plateLower === q ||
                          plateWithoutPrefix === queryWithoutPrefix ||
                          `trk-${plateLower}` === q
                        );
                      } else {
                        return (
                          driverLower.includes(q) ||
                          plateLower.includes(q) ||
                          `trk-${plateLower}`.includes(q)
                        );
                      }
                    })
                    .slice(completedPage * COMPLETED_PER_PAGE, (completedPage + 1) * COMPLETED_PER_PAGE)
                    .map((mission) => (
                    <tr
                      key={mission.id}
                      onClick={() => setSelectedMission(mission)}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                          <Truck className="w-4 h-4 text-emerald-400" />
                        </div>
                        TRK-{mission.vehiclePlate}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{mission.driverName}</td>
                      <td className="px-6 py-4 text-zinc-400">{mission.origin}</td>
                      <td className="px-6 py-4 text-zinc-400">{mission.destination}</td>
                      <td className="px-6 py-4 text-zinc-450 font-mono text-xs">{(mission.distance || 0).toFixed(1)} km</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {mission.createdAt ? new Date(mission.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          ✓ Complété
                        </span>
                      </td>
                    </tr>
                  ))}
                  {completedMissions.filter((m) => {
                      if (!completedSearchQuery) return true;
                      const q = completedSearchQuery.toLowerCase();
                      return m.driverName.toLowerCase().includes(q) || m.vehiclePlate.toLowerCase().includes(q) || `trk-${m.vehiclePlate}`.toLowerCase().includes(q);
                    }).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-semibold">
                        {completedSearchQuery ? `Aucun résultat pour "${completedSearchQuery}"` : 'Aucune mission complétée dans les archives.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(() => {
              const filtered = completedMissions.filter((m) => {
                if (!completedSearchQuery) return true;
                const q = completedSearchQuery.toLowerCase();
                return m.driverName.toLowerCase().includes(q) || m.vehiclePlate.toLowerCase().includes(q) || `trk-${m.vehiclePlate}`.toLowerCase().includes(q);
              });
              const totalPages = Math.ceil(filtered.length / COMPLETED_PER_PAGE);
              if (filtered.length <= COMPLETED_PER_PAGE) return null;
              return (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-black/20">
                  <span className="text-xs text-zinc-500">
                    Page {completedPage + 1} / {totalPages} — {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCompletedPage(p => Math.max(0, p - 1))}
                      disabled={completedPage === 0}
                      className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-semibold text-white disabled:opacity-30 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                    </button>
                    <button
                      onClick={() => setCompletedPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={completedPage >= totalPages - 1}
                      className="px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-semibold text-white disabled:opacity-30 hover:bg-zinc-800 transition-colors flex items-center gap-1"
                    >
                      Suivant <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Mission Detail Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedMission(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Détails Mission</h3>
                    <p className="text-zinc-500 text-xs font-mono">TRK-{selectedMission.vehiclePlate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMission(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Route */}
                <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                  <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5" /> Itinéraire
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                      <span className="text-white font-semibold text-sm">{selectedMission.origin}</span>
                      <span className="text-zinc-600 text-xs ml-1">Départ</span>
                    </div>
                    {selectedMission.zones && selectedMission.zones.length > 0 && selectedMission.zones.map((z: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 ml-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-amber-300 text-xs">{z.city || '—'}</span>
                        <span className="text-zinc-600 text-xs">Zone</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-white font-semibold text-sm">{selectedMission.destination}</span>
                      <span className="text-zinc-600 text-xs ml-1">Destination</span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Distance</span>
                    </div>
                    <p className="text-white font-black text-xl">{(selectedMission.distance || 0).toFixed(1)} <span className="text-zinc-400 text-sm font-normal">km</span></p>
                  </div>
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Durée</span>
                    </div>
                    <p className="text-white font-black text-xl">
                      {Math.round((selectedMission.duration || 0) / 60)}h
                      <span className="text-zinc-400 text-sm font-normal"> {Math.round((selectedMission.duration || 0) % 60)}m</span>
                    </p>
                  </div>
                </div>

                {/* Driver & Vehicle */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Chauffeur</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{selectedMission.driverName}</p>
                    {selectedMission.driverPhone && selectedMission.driverPhone !== 'N/A' && (
                      <p className="text-zinc-500 text-xs mt-0.5">{selectedMission.driverPhone}</p>
                    )}
                    {selectedMission.driverRating && (
                      <p className="text-amber-400 text-xs mt-1">★ {selectedMission.driverRating}/5</p>
                    )}
                  </div>
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Véhicule</span>
                    </div>
                    <p className="text-white font-semibold text-sm">TRK-{selectedMission.vehiclePlate}</p>
                    {selectedMission.vehicleMake && selectedMission.vehicleMake !== 'N/A' && (
                      <p className="text-zinc-500 text-xs mt-0.5">{selectedMission.vehicleMake}</p>
                    )}
                    {selectedMission.vehicleType && selectedMission.vehicleType !== 'N/A' && (
                      <p className="text-zinc-600 text-xs">{selectedMission.vehicleType}</p>
                    )}
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      selectedMission.winner === 'Bellman-Ford'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {selectedMission.winner === 'Bellman-Ford' ? '⚡ Bellman-Ford (SOS)' : '🔵 Dijkstra'}
                    </span>
                  </div>
                  <span className="text-zinc-600 text-xs">
                    {selectedMission.createdAt
                      ? new Date(selectedMission.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
