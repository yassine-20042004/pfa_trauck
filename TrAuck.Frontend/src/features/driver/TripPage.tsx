import { 
  Navigation, MapPin, AlertTriangle, ShieldAlert, Phone, Wrench, 
  HeartPulse, AlertOctagon, Copy, Check, X, RefreshCw, 
  Coffee, Play, Pause, Gauge, Clock, Sun, Cloud, CloudRain, 
  ShieldCheck, Zap, ChevronDown, ChevronUp 
} from "lucide-react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useAuthStore } from "@/stores/authStore";
import { useSosStore } from "@/stores/sosStore";
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

const truckLocIcon = new L.DivIcon({
  html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(245,158,11,0.8); display: flex; align-items: center; justify-content: center; font-size: 12px;">🚚</div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
  { name: 'Chefchaouen', lat: 35.1714, lon: -5.2697 },
  { name: 'Tetouan', lat: 35.5785, lon: -5.3684 },
  { name: 'Safi', lat: 32.2994, lon: -9.2372 },
  { name: 'El Jadida', lat: 33.2311, lon: -8.5007 },
  { name: 'Beni Mellal', lat: 32.3394, lon: -6.3608 },
  { name: 'Errachidia', lat: 31.9314, lon: -4.4244 },
  { name: 'Ouarzazate', lat: 30.9189, lon: -6.8934 },
  { name: 'Al Hoceima', lat: 35.2442, lon: -3.9366 },
];

// Per-incident type configuration: suggestion shown to driver + action button
const INCIDENT_CONFIG: Record<string, { icon: string; suggestion: string; actionLabel: string; phone: string; routeNote: string }> = {
  "Accident": {
    icon: "💥",
    suggestion: "Route potentiellement bloquée. Le système Bellman-Ford recalcule un contournement via Beni Mellal. Signalez l'accident à la gendarmerie.",
    actionLabel: "Gendarmerie (177)",
    phone: "177",
    routeNote: "Détour alternatif calculé — suivez le tracé rouge"
  },
  "Panne Mécanique": {
    icon: "🔧",
    suggestion: "Immobilisez le véhicule en lieu sûr (voie d'urgence). Un dépanneur a été alerté. N'utilisez pas les feux de détresse en mouvement.",
    actionLabel: "Dispatcher (+212 5 22 00 00)",
    phone: "+212522000000",
    routeNote: "Véhicule immobilisé — attente dépanneur"
  },
  "Urgence Médicale": {
    icon: "🏥",
    suggestion: "Les secours médicaux (SAMU 15) ont été notifiés. Restez sur place. Bellman-Ford actif pour faciliter l'accès des secours.",
    actionLabel: "SAMU (15)",
    phone: "15",
    routeNote: "Détour calculé pour accès secours — ne bougez pas"
  },
  "Menace Sécurité": {
    icon: "🛡️",
    suggestion: "Continuez à rouler vers un lieu sûr et éclairé. Évitez de vous arrêter. La gendarmerie a été alertée automatiquement.",
    actionLabel: "Gendarmerie (177)",
    phone: "177",
    routeNote: "Route alternative calculée — quittez la zone"
  },
  "Route Bloquée": {
    icon: "🚧",
    suggestion: "Route impraticable. L'algorithme Bellman-Ford a recalculé un itinéraire alternatif passant par Beni Mellal. Suivez le tracé rouge sur la carte.",
    actionLabel: "Dispatcher (+212 5 22 00 00)",
    phone: "+212522000000",
    routeNote: "Contournement via Beni Mellal — suivez le tracé rouge"
  },
  "Autre": {
    icon: "⚠️",
    suggestion: "Incident signalé au dispatcher. Restez en sécurité et attendez les instructions. Bellman-Ford en standby si la route est compromise.",
    actionLabel: "Dispatcher (+212 5 22 00 00)",
    phone: "+212522000000",
    routeNote: "En attente d'instructions du dispatcher"
  },
  "SOS Général": {
    icon: "🚨",
    suggestion: "Alerte SOS générale envoyée au centre de contrôle. Bellman-Ford actif. Restez en sécurité et signalez votre position.",
    actionLabel: "Dispatcher (+212 5 22 00 00)",
    phone: "+212522000000",
    routeNote: "Contournement d'urgence calculé"
  }
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

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
  
  if (trip.winner === "Bellman-Ford") {
    const detourCity = "Beni Mellal";
    if (
      trip.origin.toLowerCase() !== detourCity.toLowerCase() &&
      trip.destination.toLowerCase() !== detourCity.toLowerCase() &&
      !zones.some((z: any) => z.city.toLowerCase() === detourCity.toLowerCase())
    ) {
      route.splice(1, 0, getTripCoords(detourCity, {}, 'zone'));
    }
  }

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
  const [routeStatus, setRouteStatus] = useState<'idle'|'calculating'|'ready'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);

  // SOS state variables
  const { sosRequested, resetSosRequest } = useSosStore();
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showIncidentTypeModal, setShowIncidentTypeModal] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Rest state variables
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);

  // SOS timer, checklist toggle and completion modal
  const [sosElapsedTime, setSosElapsedTime] = useState(0);
  const [isChecklistOpen, setIsChecklistOpen] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Ordinateur de bord & tabs state
  const [currentTab, setCurrentTab] = useState<'guidage' | 'telemetrie' | 'journal'>('guidage');

  // Simulation states
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(10); // pts per sec

  // Rest stops interactions & shift logbook states
  const [breakLogs, setBreakLogs] = useState<{ id: string; stopName: string; duration: number; timestamp: string }[]>([]);
  const [approachingStop, setApproachingStop] = useState<any>(null);
  const [hasAlertedForStop, setHasAlertedForStop] = useState<Record<string, boolean>>({});
  const [activeRestStopName, setActiveRestStopName] = useState<string | null>(null);

  // Telemetry details
  const [simulatedFuel, setSimulatedFuel] = useState(100);
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [simulatedEcoScore] = useState(94);

  const telemetryRef = useRef({ currentRouteIndex, simulatedFuel, simulatedSpeed, activeTrip, routePoints });
  useEffect(() => {
    telemetryRef.current = { currentRouteIndex, simulatedFuel, simulatedSpeed, activeTrip, routePoints };
  }, [currentRouteIndex, simulatedFuel, simulatedSpeed, activeTrip, routePoints]);

  useEffect(() => {
    if (!isSimulating) return;

    const syncPos = async () => {
      const { currentRouteIndex: idx, simulatedFuel: fuel, simulatedSpeed: speed, activeTrip: trip, routePoints: points } = telemetryRef.current;
      if (!trip || points.length === 0) return;
      const pos = points[idx];
      if (!pos) return;

      try {
        const customCoords = trip.customCoordsJson ? JSON.parse(trip.customCoordsJson) : {};
        customCoords.currentLocation = { lat: pos[0], lon: pos[1] };
        customCoords.simulatedFuel = fuel;
        customCoords.simulatedSpeed = speed;

        await apiRequest(`/trips/${trip.id}`, "PUT", {
          ...trip,
          customCoordsJson: JSON.stringify(customCoords)
        });
      } catch (err) {
        console.error("Failed to sync telemetry to backend", err);
      }
    };

    // Sync immediately upon starting, then every 4.5 seconds
    syncPos();
    const interval = setInterval(syncPos, 4500);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Swipe to SOS logic
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 200],
    ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 1)"]
  );

  // Traffic details (deterministic based on trip ID)
  const trafficStatus = activeTrip ? (() => {
    const charCodeSum = activeTrip.id.split('').reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0);
    const statuses = ['Fluid', 'Slow', 'Heavy'] as const;
    return statuses[charCodeSum % 3];
  })() : 'Fluid';

  const trafficDelay = activeTrip ? (() => {
    if (trafficStatus === 'Fluid') return 0;
    if (trafficStatus === 'Slow') return Math.round(activeTrip.duration * 0.15 + 3);
    return Math.round(activeTrip.duration * 0.40 + 8);
  })() : 0;

  // Rest stops details
  const restStops = activeTrip && activeTrip.customCoordsJson ? (() => {
    try {
      const customCoords = JSON.parse(activeTrip.customCoordsJson);
      return customCoords.restStops || [];
    } catch {
      return [];
    }
  })() : [];

  const triggerSosSequence = () => {
    if (!activeTrip) return;
    setIsCountingDown(true);
    setCountdown(3);
  };

  // Listen to SOS requested from bottom navigation
  useEffect(() => {
    if (sosRequested) {
      triggerSosSequence();
      resetSosRequest();
    }
  }, [sosRequested]);

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (isCountingDown) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      } else {
        setIsCountingDown(false);
        setShowIncidentTypeModal(true);
      }
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // Rest timer logic
  useEffect(() => {
    let interval: any;
    if (isResting) {
      interval = setInterval(() => {
        setRestSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRestSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isResting]);

  // SOS timer logic
  useEffect(() => {
    let interval: any;
    if (isEmergency) {
      interval = setInterval(() => {
        setSosElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setSosElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isEmergency]);

  // Simulation loop effect
  useEffect(() => {
    let interval: any;
    if (isSimulating && routePoints.length > 0) {
      if (activeTrip && activeTrip.status === "Planned") {
        (async () => {
          try {
            const updatedTrip = { ...activeTrip, status: "Ongoing" };
            await apiRequest(`/trips/${activeTrip.id}`, "PUT", updatedTrip);
            setActiveTrip(updatedTrip);
          } catch (err) {
            console.error("Failed to transition trip to Ongoing", err);
          }
        })();
      }

      interval = setInterval(() => {
        setCurrentRouteIndex(prev => {
          if (prev >= routePoints.length - 1) {
            setIsSimulating(false);
            setSimulatedSpeed(0);
            setShowCompletionModal(true);
            return prev;
          }
          const nextIndex = prev + 1;
          
          // Speed logic matching traffic conditions
          let baseSpeed = 80;
          if (trafficStatus === 'Slow') baseSpeed = 45;
          if (trafficStatus === 'Heavy') baseSpeed = 15;
          const speedFluctuation = Math.floor(Math.random() * 9) - 4; // -4 to +4
          setSimulatedSpeed(Math.max(10, baseSpeed + speedFluctuation));

          // Consume simulated fuel
          setSimulatedFuel(f => Math.max(5, parseFloat((f - 0.05).toFixed(2))));

          return nextIndex;
        });
      }, Math.max(10, 1000 / simulationSpeed));
    } else {
      setSimulatedSpeed(0);
    }
    return () => clearInterval(interval);
  }, [isSimulating, routePoints, simulationSpeed, trafficStatus]);

  // Proximity Alerting Effect
  const currentPos = routePoints[currentRouteIndex];
  useEffect(() => {
    if (restStops.length === 0 || !currentPos) return;

    if (approachingStop) return;

    let foundNear: any = null;
    // Expand check window to 20 points ahead + current position
    const checkWindow = [currentPos, ...routePoints.slice(currentRouteIndex + 1, currentRouteIndex + 21)];

    for (const stop of restStops) {
      if (hasAlertedForStop[stop.name]) continue;
      
      const stopLat = parseFloat(stop.lat || stop.latitude);
      const stopLon = parseFloat(stop.lon || stop.longitude);
      if (isNaN(stopLat) || isNaN(stopLon)) continue;

      const isNear = checkWindow.some(pt => {
        const dist = haversineDistance(pt[0], pt[1], stopLat, stopLon);
        return dist <= 5.0; // expanded from 2.5 to 5km
      });

      if (isNear) {
        foundNear = stop;
        break;
      }
    }

    if (foundNear) {
      setApproachingStop(foundNear);
    }
  }, [currentPos, restStops, hasAlertedForStop, approachingStop, routePoints]);

  const enterRestStop = async (stopName: string) => {
    setIsSimulating(false);
    setApproachingStop(null);
    setHasAlertedForStop(prev => ({ ...prev, [stopName]: true }));
    setActiveRestStopName(stopName);
    setIsResting(true);
    try {
      await apiRequest("/incidents", "POST", {
        tripId: activeTrip.id,
        description: `[PAUSE AUTOMATIQUE] Le chauffeur s'est arrêté à l'aire de repos : ${stopName}.`,
        severity: "Low"
      });

      // Update the currentLocation in the trip immediately to the rest stop
      // Also set isResting=true and activeRestStop for Fleet dashboard sync
      const stop = restStops.find((s: any) => s.name === stopName);
      const customCoords = activeTrip.customCoordsJson ? JSON.parse(activeTrip.customCoordsJson) : {};
      if (stop) {
        customCoords.currentLocation = { lat: stop.lat, lon: stop.lon };
      }
      customCoords.isResting = true;
      customCoords.activeRestStop = stopName;
      const updatedTrip = { ...activeTrip, customCoordsJson: JSON.stringify(customCoords) };
      await apiRequest(`/trips/${activeTrip.id}`, "PUT", updatedTrip);
      setActiveTrip(updatedTrip);
    } catch (e) {
      console.error(e);
    }
  };

  const dismissRestStopAlert = (stopName: string) => {
    setApproachingStop(null);
    setHasAlertedForStop(prev => ({ ...prev, [stopName]: true }));
  };

  const cancelSosCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
  };

  const startRestBreak = async () => {
    if (!activeTrip) return;
    setIsResting(true);
    setActiveRestStopName(null);
    try {
      await apiRequest("/incidents", "POST", {
        tripId: activeTrip.id,
        description: `[PAUSE] Le chauffeur ${driver?.firstName} ${driver?.lastName} a débuté une pause réglementaire.`,
        severity: "Low"
      });
      // Write isResting flag to customCoordsJson
      const customCoords = activeTrip.customCoordsJson ? JSON.parse(activeTrip.customCoordsJson) : {};
      customCoords.isResting = true;
      customCoords.activeRestStop = null;
      const updatedTrip = { ...activeTrip, customCoordsJson: JSON.stringify(customCoords) };
      await apiRequest(`/trips/${activeTrip.id}`, "PUT", updatedTrip);
      setActiveTrip(updatedTrip);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRestBreak = async () => {
    if (!activeTrip) return;
    setIsResting(false);
    
    const duration = restSeconds;
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;

    const currentStopName = activeRestStopName || "Aire de repos";

    setBreakLogs(prev => [
      ...prev,
      {
        id: `BRK-${Date.now().toString().slice(-4)}`,
        stopName: currentStopName,
        duration: duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      await apiRequest("/incidents", "POST", {
        tripId: activeTrip.id,
        description: `[REPRISE] Le chauffeur a quitté l'aire de repos ${currentStopName}. Durée de pause : ${mins}m ${secs}s.`,
        severity: "Low"
      });
      // Clear isResting flag in customCoordsJson
      const customCoords = activeTrip.customCoordsJson ? JSON.parse(activeTrip.customCoordsJson) : {};
      customCoords.isResting = false;
      customCoords.activeRestStop = null;
      const updatedTrip = { ...activeTrip, customCoordsJson: JSON.stringify(customCoords) };
      await apiRequest(`/trips/${activeTrip.id}`, "PUT", updatedTrip);
      setActiveTrip(updatedTrip);
    } catch (e) {
      console.error(e);
    }
  };

  const formatRestTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const submitSosIncident = async (incidentType: string) => {
    if (!activeTrip) return;
    try {
      setIsEmergency(true);
      setIsSimulating(false); // Stop simulation immediately when SOS is triggered!
      setShowIncidentTypeModal(false);
      setSelectedIncidentType(incidentType);

      const description = `[SOS - ${incidentType}] Alerte critique déclenchée par le chauffeur.`;
      
      // 1. Report incident
      await apiRequest("/incidents", "POST", {
        tripId: activeTrip.id,
        description: description,
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
      fetchDriverAndTrip(true);
    } catch (err) {
      console.error("SOS trigger failed", err);
    }
  };

  const fetchDriverAndTrip = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // 1. Get all drivers
      const drivers = await apiRequest<any[]>("/drivers");
      const currentDriver = drivers.find(d => d.userId === userId);

      if (!currentDriver) {
        setError("Driver account profile not found. Please contact the administrator.");
        if (showLoading) setIsLoading(false);
        return;
      }
      setDriver(currentDriver);

      // 2. Get all trips
      const trips = await apiRequest<any[]>("/trips");
      const trip = trips.find(t => t.driverId === currentDriver.id && t.status !== "Completed" && t.status !== "Cancelled");

      if (!trip) {
        setActiveTrip(null);
        if (showLoading) setIsLoading(false);
        return;
      }

      setActiveTrip(trip);
      
      const isEmergencyNow = trip.winner === "Bellman-Ford";
      if (!isEmergencyNow) {
        setSelectedIncidentType(null);
        setRouteStatus('idle');
      } else {
        setRouteStatus('calculating');
      }
      setIsEmergency(isEmergencyNow);

      // 3. Compute road route
      const simpleRoute = buildSimpleRouteArray(trip);
      const roadRoute = await fetchRoadRoute(simpleRoute);
      setRoutePoints(roadRoute);
      if (isEmergencyNow) setRouteStatus('ready');
    } catch (err: any) {
      setError("Failed to load active trip data.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDriverAndTrip(true);
      const pollInterval = setInterval(() => {
        fetchDriverAndTrip(false);
      }, 4500);
      return () => clearInterval(pollInterval);
    }
  }, [userId]);

  const handleDragEnd = async (_event: any, info: any) => {
    if (info.offset.x > 150 && activeTrip) {
      triggerSosSequence();
    }
  };

  const handleResumeNavigation = async () => {
    if (!activeTrip) return;
    try {
      setIsEmergency(false);
      setSelectedIncidentType(null);
      
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

  const completeTrip = async () => {
    if (!activeTrip || !driver) return;
    try {
      // 1. Update trip status to Completed
      await apiRequest(`/trips/${activeTrip.id}`, "PUT", {
        id: activeTrip.id,
        origin: activeTrip.origin,
        destination: activeTrip.destination,
        driverId: activeTrip.driverId,
        vehicleId: activeTrip.vehicleId,
        distance: activeTrip.distance,
        duration: activeTrip.duration,
        winner: activeTrip.winner,
        zonesJson: activeTrip.zonesJson,
        customCoordsJson: activeTrip.customCoordsJson,
        status: "Completed"
      });

      // 2. Update driver availability to true
      await apiRequest(`/drivers/${driver.id}`, "PUT", {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone || "+212 600 000000",
        isAvailable: true,
        rating: driver.rating || 5.0
      });

      // 3. Update vehicle availability to Available
      if (activeTrip.vehicleId) {
        try {
          const vehicle = await apiRequest<any>(`/vehicles/${activeTrip.vehicleId}`);
          if (vehicle) {
            await apiRequest(`/vehicles/${activeTrip.vehicleId}`, "PUT", {
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              plateNumber: vehicle.plateNumber,
              capacityTons: vehicle.capacityTons,
              type: vehicle.type,
              year: vehicle.year,
              status: "Available"
            });
          }
        } catch (vehErr) {
          console.error("Failed to release vehicle availability", vehErr);
        }
      }

      setShowCompletionModal(false);
      
      // Refetch
      fetchDriverAndTrip();
    } catch (e) {
      console.error("Failed to complete trip", e);
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
  
  // Format coordinate telemetry details using active current simulation position
  const lat = currentPos ? currentPos[0].toFixed(5) : startCoord[0].toFixed(5);
  const lon = currentPos ? currentPos[1].toFixed(5) : startCoord[1].toFixed(5);

  // Checkpoints list (Origin, waypoints/zones, Destination)
  const checkPoints = activeTrip ? (() => {
    const list = [];
    const customCoords = activeTrip.customCoordsJson ? JSON.parse(activeTrip.customCoordsJson) : {};
    
    // Origin
    const originCoords = getTripCoords(activeTrip.origin, customCoords, 'origin');
    list.push({ name: activeTrip.origin, coords: originCoords, label: "Départ" });

    // Zones
    const zones = activeTrip.zonesJson ? JSON.parse(activeTrip.zonesJson) : [];
    zones.forEach((z: any) => {
      const zoneCoords = getTripCoords(z.city, customCoords, 'zone', z.id);
      list.push({ name: z.city, coords: zoneCoords, label: `Zone: ${z.name || z.city}` });
    });

    // Destination
    const destCoords = getTripCoords(activeTrip.destination, customCoords, 'destination');
    list.push({ name: activeTrip.destination, coords: destCoords, label: "Destination" });

    return list;
  })() : [];

  const isCheckpointReached = (checkpointCoords: [number, number], index: number) => {
    if (!currentPos) return false;
    if (index === 0) return true; // Origin always true
    if (index === checkPoints.length - 1 && currentRouteIndex >= routePoints.length - 2) return true;
    
    for (let i = 0; i <= currentRouteIndex; i++) {
      const pt = routePoints[i];
      if (pt) {
        const dist = haversineDistance(pt[0], pt[1], checkpointCoords[0], checkpointCoords[1]);
        if (dist < 3.0) return true;
      }
    }
    return false;
  };

  // Simulated weather info along the route
  const weatherInfo = (() => {
    if (!activeTrip || routePoints.length === 0) {
      return { temp: 22, condition: 'Clear', icon: Sun, text: 'Climat Idéal', warning: null };
    }
    const progress = currentRouteIndex / routePoints.length;
    if (progress < 0.4) {
      return { temp: 26, condition: 'Sunny', icon: Sun, text: 'Temps Ensoleillé - Sec', warning: null };
    } else if (progress < 0.75) {
      return { temp: 19, condition: 'Cloudy', icon: Cloud, text: 'Ciel Couvert - Vent modéré', warning: null };
    } else {
      return { temp: 15, condition: 'Rainy', icon: CloudRain, text: 'Pluie Fine - Chaussée Glissante', warning: 'Attention chaussée glissante : réduisez la vitesse' };
    }
  })();

  // Eco driving advice
  const ecoAdvice = (() => {
    if (isResting) return "Moteur coupé. Repos réglementaire en cours.";
    if (!isSimulating) return "Moteur en veille. Prêt pour le départ.";
    if (weatherInfo.condition === 'Rainy') {
      return "Pluie active : Ralentissez de 10km/h et anticipez les distances de freinage.";
    }
    if (simulatedSpeed > 75) {
      return "Vitesse élevée. Réduisez légèrement pour économiser ~5% de carburant.";
    }
    if (simulatedSpeed < 30) {
      return "Vitesse instable. Essayez de maintenir une allure régulière en zone urbaine.";
    }
    return "Conduite optimale : Allure stable et régime moteur idéal (1200 - 1400 RPM).";
  })();

  const speedPercentage = Math.min(100, (simulatedSpeed / 120) * 100);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-zinc-950 text-white overflow-hidden font-sans relative">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 8s linear infinite;
        }
        .neon-border-blue {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        .neon-border-purple {
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.4);
        }
        .neon-border-red {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
        }
      `}</style>

      {/* Ambient Red Glow for Emergency Mode */}
      {isEmergency && (
        <div className="absolute inset-0 border-[6px] border-red-600/40 pointer-events-none animate-pulse z-[999] shadow-[inset_0_0_80px_rgba(239,68,68,0.25)]" />
      )}

      {/* Left Sidebar Column - Telemetry & Driver Controls (1/3 size) */}
      <div className="w-full lg:w-[32%] xl:w-[28%] bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col h-full relative z-20 shadow-2xl shrink-0 overflow-hidden">
        
        {/* Driver Profile Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-blue-400 text-sm tracking-widest shadow-inner">
              {driver ? `${driver.firstName[0]}${driver.lastName[0]}`.toUpperCase() : "DR"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Mission en cours</p>
              </div>
              <h3 className="text-sm font-extrabold text-white truncate max-w-[130px]">
                {driver ? `${driver.firstName} ${driver.lastName}` : "Chauffeur"}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] bg-zinc-850 text-zinc-400 border border-zinc-750 px-2 py-0.5 rounded-full font-mono font-bold">
              TRK-{activeTrip.vehicleId?.substring(0,4) || '001'}
            </span>
          </div>
        </div>

        {/* Tab Navigation (Cockpit menu) */}
        <div className="flex bg-zinc-950/60 p-1 mx-4 mt-3 rounded-xl border border-zinc-850 shrink-0">
          <button
            onClick={() => setCurrentTab('guidage')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'guidage' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Guidage
          </button>
          <button
            onClick={() => setCurrentTab('telemetrie')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'telemetrie' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Télémétrie
          </button>
          <button
            onClick={() => setCurrentTab('journal')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              currentTab === 'journal' 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Journal
          </button>
        </div>

        {/* Tab content - scrollable dynamic view */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {currentTab === 'guidage' && (
            <div className="space-y-4">
              {/* Destination & ETA Info Card */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Destination</p>
                    <h4 className="text-lg font-black text-white mt-1 leading-tight truncate">{activeTrip.destination}</h4>
                    <p className="text-[11px] text-zinc-450 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-blue-550 shrink-0" /> {activeTrip.origin}
                    </p>
                  </div>
                  <div className="text-right bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl shrink-0">
                    <p className="text-xl font-black text-blue-400 tracking-tight leading-none">
                      {Math.round(activeTrip.duration) + trafficDelay}<span className="text-[10px] text-blue-400/80 ml-0.5 font-medium">min</span>
                    </p>
                    <p className="text-[9px] font-bold text-zinc-500 mt-0.5">{(activeTrip.distance||0).toFixed(1)} km</p>
                  </div>
                </div>
                
                {/* Traffic status block */}
                <div className={`p-2 rounded-xl flex items-center justify-between text-[11px] font-bold ${
                  trafficStatus === 'Fluid' ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10' :
                  trafficStatus === 'Slow' ? 'bg-amber-500/5 text-amber-400 border border-amber-500/10' :
                  'bg-red-500/5 text-red-400 border border-red-500/10'
                }`}>
                  <span>Trafic routier</span>
                  <span>
                    {trafficStatus === 'Fluid' ? '🟢 Fluide' :
                     trafficStatus === 'Slow' ? `🟡 Ralenti (+${trafficDelay}m)` :
                     `🔴 Bouchon (+${trafficDelay}m)`}
                  </span>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Météo de la Route</span>
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                    <weatherInfo.icon className="w-3.5 h-3.5 text-blue-400" /> {weatherInfo.temp}°C
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {weatherInfo.condition === 'Sunny' ? '☀️' : weatherInfo.condition === 'Cloudy' ? '☁️' : '🌧️'}
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white">{weatherInfo.text}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Prévisions en temps réel</p>
                  </div>
                </div>
                {weatherInfo.warning && (
                  <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded-lg font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{weatherInfo.warning}</span>
                  </div>
                )}
              </div>

              {/* Recommended Rest Stops Info */}
              {restStops.length > 0 && (
                <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Aires de Repos Suggérées</p>
                  <div className="space-y-1.5">
                    {restStops.map((stop: any, idx: number) => {
                      const alreadyAlerted = hasAlertedForStop[stop.name];
                      return (
                        <div key={idx} className="flex justify-between items-center bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">☕</span>
                            <span className="text-[11px] font-extrabold text-white truncate">{stop.name.replace("Aire de repos ", "")}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            alreadyAlerted ? 'bg-zinc-800 text-zinc-500 border border-zinc-850' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse'
                          }`}>
                            {alreadyAlerted ? 'Passée' : 'À Approcher'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual Rest Break Trigger */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pause Réglementaire</p>
                <button
                  onClick={startRestBreak}
                  disabled={isSimulating}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 hover:border-zinc-750 disabled:opacity-50"
                >
                  <Coffee className="w-4 h-4 text-purple-450" />
                  Débuter une pause
                </button>
              </div>
            </div>
          )}

          {currentTab === 'telemetrie' && (
            <div className="space-y-4">
              {/* Speedometer SVG Gauge */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3">Tachymètre Numérique</span>
                
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track Arc */}
                    <path 
                      d="M 20 75 A 35 35 0 1 1 80 75" 
                      fill="none" 
                      stroke="#27272a" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    {/* Glowing Neon Speed Arc */}
                    <path 
                      d="M 20 75 A 35 35 0 1 1 80 75" 
                      fill="none" 
                      stroke={simulatedSpeed > 80 ? "#ef4444" : "#06b6d4"} 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      strokeDasharray="144"
                      strokeDashoffset={144 - (144 * speedPercentage) / 100}
                      className="transition-all duration-300 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 4px ${simulatedSpeed > 80 ? "rgba(239,68,68,0.6)" : "rgba(6,182,212,0.6)"})`
                      }}
                    />
                  </svg>
                  {/* Center HUD Panel */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-black font-mono text-white tracking-tighter leading-none">
                      {isSimulating ? simulatedSpeed : 0}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mt-1">km/h</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 ${
                      simulatedSpeed > 80 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {simulatedSpeed > 80 ? '⚠️ Excès' : '✓ Limite OK'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-1 px-2">
                  <span>0 km/h</span>
                  <span className="text-zinc-400 font-bold">Limiteur: 80 km/h</span>
                  <span>120 km/h</span>
                </div>
              </div>

              {/* Fuel Bar Card */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Réservoir Gazole</span>
                  <span className={`text-xs font-mono font-black ${simulatedFuel < 20 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                    {simulatedFuel}%
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-850 p-0.5 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      simulatedFuel < 20 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    }`} 
                    style={{ width: `${simulatedFuel}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 mt-2">
                  <span>Autonomie: {Math.round(simulatedFuel * 6.5)} km</span>
                  <span>Diagnostic: {simulatedFuel < 20 ? 'Carburant Bas !' : 'Normal'}</span>
                </div>
              </div>

              {/* Eco Driving Conseiller Card */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Conseiller Éco-Conduite</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 fill-current text-emerald-400" />
                    <span>Score: {simulatedEcoScore}/100</span>
                  </div>
                </div>
                
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl shadow-inner">
                  <p className="text-[11px] text-zinc-300 font-medium leading-relaxed italic">
                    "{ecoAdvice}"
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="bg-zinc-900/50 border border-zinc-850 p-2 rounded-xl">
                    <span className="text-zinc-500 block">Régime RPM</span>
                    <span className="text-white font-mono font-bold mt-0.5 block">{isSimulating ? '1380 RPM' : '750 RPM'}</span>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-850 p-2 rounded-xl">
                    <span className="text-zinc-500 block">Pression Pneus</span>
                    <span className="text-emerald-400 font-mono font-bold mt-0.5 block">2.2 Bar (OK)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'journal' && (
            <div className="space-y-4">
              {/* Shift Driving Hours Info */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Temps de Service Actif</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">Conduite</span>
                    <span className="text-lg font-black text-white font-mono block mt-1">
                      {Math.floor(currentRouteIndex / 5)}m / 9h
                    </span>
                    <div className="w-full h-1 bg-zinc-950 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (currentRouteIndex / 5 / 540) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-black block">Repos Effectué</span>
                    <span className="text-lg font-black text-purple-400 font-mono block mt-1">
                      {formatRestTime(breakLogs.reduce((sum, log) => sum + log.duration, 0))}
                    </span>
                    <span className="text-[8px] text-zinc-500 mt-1 block">Total cumulé</span>
                  </div>
                </div>
              </div>

              {/* Breaks History List */}
              <div className="bg-zinc-950/40 border border-zinc-850 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Historique des Arrêts</span>
                
                {breakLogs.length === 0 ? (
                  <div className="text-center py-6 text-zinc-600 text-xs font-semibold">
                    Aucune pause enregistrée pour ce trajet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {breakLogs.map((log) => (
                      <div key={log.id} className="flex justify-between items-center p-2.5 bg-zinc-900/80 border border-zinc-850 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-xs">☕</span>
                          <div>
                            <span className="text-[11px] font-extrabold text-white block">{log.stopName.replace("Aire de repos ", "")}</span>
                            <span className="text-[8px] text-zinc-500 font-mono">{log.timestamp}</span>
                          </div>
                        </div>
                        <span className="font-mono text-white font-extrabold bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-[10px]">
                          {formatRestTime(log.duration)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Simulation Actions & SOS Slider */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-900/90 backdrop-blur-md space-y-3 shrink-0">
          {/* Simulation controls widget */}
          <div className="bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest font-black">
              <span>Simulation du Camion</span>
              <span className="text-blue-400 font-mono font-bold">{simulationSpeed}x vitesse</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentRouteIndex >= routePoints.length - 1) {
                    setCurrentRouteIndex(0);
                  }
                  setIsSimulating(!isSimulating);
                }}
                disabled={isResting}
                className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  isSimulating 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' 
                    : 'bg-white text-black hover:bg-zinc-200 disabled:opacity-50'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Démarrer
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsSimulating(false);
                  setCurrentRouteIndex(0);
                  setSimulatedFuel(100);
                  setHasAlertedForStop({});
                  setBreakLogs([]);
                  setApproachingStop(null);
                  setActiveRestStopName(null);
                }}
                className="py-2 px-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                Reset
              </button>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* SOS button trigger and Swipe to SOS Slider */}
          <div className="relative h-14 bg-zinc-950 rounded-2xl overflow-hidden border border-red-500/20 shadow-inner">
             <motion.div style={{ background }} className="absolute inset-0" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <span className="text-[10px] font-black tracking-widest text-red-500/85 uppercase">Glisser pour le SOS</span>
             </div>
             <motion.div
               drag="x"
               dragConstraints={{ left: 0, right: 180 }}
               dragElastic={0.05}
               onDragEnd={handleDragEnd}
               style={{ x }}
               className="absolute left-1 top-1 bottom-1 w-12 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10 border border-red-400"
             >
               <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
             </motion.div>
          </div>
        </div>
      </div>

      {/* Right Column - Map View (2/3 size) */}
      <div className="flex-1 h-full relative bg-zinc-950 overflow-hidden z-10 flex flex-col">
        <div className="relative flex-1 bg-zinc-900 z-0 h-full w-full">
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
               <Popup className="dark-popup">Origine: {activeTrip.origin}</Popup>
             </Marker>

             <Marker position={destCoord} icon={destinationIcon}>
               <Popup className="dark-popup">Destination: {activeTrip.destination}</Popup>
             </Marker>

             {routePoints.length > 0 && (
                <>
                  {isEmergency && (
                    <Polyline 
                      positions={routePoints} 
                      color="#ef4444" 
                      weight={12} 
                      opacity={0.3} 
                      className="animate-pulse" 
                    />
                  )}
                  <Polyline 
                    positions={routePoints} 
                    color={isEmergency ? "#ff3333" : trafficStatus === 'Fluid' ? "#10b981" : trafficStatus === 'Slow' ? "#f59e0b" : "#ef4444"} 
                    weight={6} 
                    dashArray={isEmergency ? "15, 15" : ""}
                    className={isEmergency ? "animate-pulse" : ""}
                  />
                </>
              )}

             {/* Suggested rest stops markers */}
             {restStops.map((stop: any, idx: number) => {
               const restIcon = new L.DivIcon({
                 html: `<div style="background-color: #c084fc; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #09090b; box-shadow: 0 0 12px #c084fc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white;">☕</div>`,
                 className: "",
                 iconSize: [22, 22],
                 iconAnchor: [11, 11],
               });
               return (
                 <Marker key={idx} position={[stop.lat, stop.lon]} icon={restIcon}>
                   <Popup className="dark-popup">☕ Aire de Repos : {stop.name}</Popup>
                 </Marker>
               );
             })}
             
             {currentPos && (
               <Marker position={currentPos} icon={truckLocIcon}>
                 <Popup className="dark-popup">🚚 Camion TRK-{activeTrip.vehicleId?.substring(0,4) || '001'} (Simulé)</Popup>
               </Marker>
             )}
           </MapContainer>

           {/* Collapsible Checkpoint Checklist Overlay (top right) */}
           <div className="absolute top-4 right-4 z-[1000] w-64 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
             <button 
               onClick={() => setIsChecklistOpen(!isChecklistOpen)}
               className="w-full px-4 py-3 flex items-center justify-between border-b border-zinc-850/85 hover:bg-zinc-900/40 transition-colors"
             >
               <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                 <ShieldCheck className="w-3.5 h-3.5 text-blue-555" /> Étapes du Trajet
               </span>
               {isChecklistOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
             </button>
             
             <AnimatePresence>
               {isChecklistOpen && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <div className="p-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                     {checkPoints.map((cp, idx) => {
                       const reached = isCheckpointReached(cp.coords, idx);
                       return (
                         <div key={idx} className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                             reached 
                               ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                               : 'border-zinc-700 bg-zinc-900 text-zinc-650'
                           }`}>
                             {reached ? <Check className="w-3 h-3 text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-650" />}
                           </div>
                           <div className="min-w-0 flex-1">
                             <span className={`text-[9px] block leading-none font-bold uppercase tracking-wider ${reached ? 'text-zinc-550' : 'text-zinc-500'}`}>
                               {cp.label}
                             </span>
                             <span className={`text-xs block mt-0.5 truncate font-extrabold ${reached ? 'text-zinc-500 line-through opacity-60' : 'text-zinc-200'}`}>
                               {cp.name}
                             </span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Proximity Rest Stop Alert Popup overlay */}
           <AnimatePresence>
             {approachingStop && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 15, x: "-50%" }}
                 animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                 exit={{ opacity: 0, scale: 0.95, y: 15, x: "-50%" }}
                 className="absolute bottom-6 left-1/2 z-[1000] w-[90%] max-w-sm bg-zinc-950/95 backdrop-blur-md border border-[#c084fc]/30 rounded-2xl p-4 shadow-[0_20px_40px_rgba(192,132,252,0.25)] flex flex-col gap-3"
               >
                 <div className="flex items-start gap-2.5">
                   <div className="w-10 h-10 rounded-xl bg-[#c084fc]/10 border border-[#c084fc]/20 flex items-center justify-center shrink-0 animate-pulse">
                     <Coffee className="w-5 h-5 text-[#c084fc]" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <span className="text-[8px] bg-[#c084fc]/15 border border-[#c084fc]/20 text-[#c084fc] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                       ☕ Aire de Repos Proche
                     </span>
                     <h4 className="text-sm font-extrabold text-white mt-1 truncate">{approachingStop.name}</h4>
                     <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                       Aire suggérée à proximité. Prendre une pause réglementaire ?
                     </p>
                   </div>
                 </div>

                 <div className="flex gap-2 border-t border-white/5 pt-2">
                   <button
                     onClick={() => enterRestStop(approachingStop.name)}
                     className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(192,132,252,0.25)] flex items-center justify-center gap-1"
                   >
                     Entrer dans l'aire
                   </button>
                   <button
                     onClick={() => dismissRestStopAlert(approachingStop.name)}
                     className="py-2 px-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all"
                   >
                     Ignorer
                   </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Immersive Crimson SOS Fullscreen Emergency overlay */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-between z-[99999] text-white p-6 md:p-12 overflow-hidden"
          >
            {/* Concentric radar scanning & red background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
            <div className="absolute inset-0 border-[8px] border-red-650 pointer-events-none animate-pulse" />

            {/* Emergency Top Header */}
            <div className="w-full max-w-4xl flex justify-between items-center z-10 border-b border-red-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500 flex items-center justify-center text-2xl animate-pulse">
                  {(INCIDENT_CONFIG[selectedIncidentType || 'SOS Général'] || INCIDENT_CONFIG['SOS Général']).icon}
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-red-500">Alerte Critique SOS</h1>
                  <p className="text-xs text-zinc-400 mt-0.5">Centre de Dispatch & Secours notifié immédiatement</p>
                </div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-black block">Type Incident</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">{selectedIncidentType || "SOS Général"}</span>
              </div>
            </div>

            {/* Middle content: Radar & details split */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-auto z-10">
              {/* Left side: Animated SVG radar scan + recommendation */}
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative w-52 h-52 flex items-center justify-center rounded-full bg-red-950/40 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden">
                  {/* Concentric rings */}
                  <div className="absolute inset-4 rounded-full border border-red-500/10" />
                  <div className="absolute inset-10 rounded-full border border-red-500/15" />
                  <div className="absolute inset-16 rounded-full border border-red-500/20" />
                  <div className="absolute inset-22 rounded-full border border-red-500/25" />
                  {/* Radar sweeper */}
                  <svg className="absolute inset-0 w-full h-full transform animate-radar-sweep" viewBox="0 0 100 100">
                    <line x1="50" y1="50" x2="50" y2="0" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                    <path d="M 50 0 A 50 50 0 0 1 100 50 L 50 50 Z" fill="url(#radarGrad2)" opacity="0.2" />
                    <defs>
                      <radialGradient id="radarGrad2">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
                      </radialGradient>
                    </defs>
                  </svg>
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-white animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white absolute" />
                </div>
                
                {/* Elapsed emergency timer */}
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">Durée Incident SOS</span>
                  <span className="text-3xl font-black font-mono text-white mt-1 block">{formatRestTime(sosElapsedTime)}</span>
                </div>

                {/* Recommendation card */}
                <div className="w-full bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 text-left">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2">💡 Recommandation</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {(INCIDENT_CONFIG[selectedIncidentType || 'SOS Général'] || INCIDENT_CONFIG['SOS Général']).suggestion}
                  </p>
                </div>
              </div>

              {/* Right side: Emergency details */}
              <div className="space-y-4">
                {/* Route status badge */}
                <div className={`flex items-center gap-3 rounded-2xl p-4 border ${
                  routeStatus === 'ready'
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : routeStatus === 'calculating'
                    ? 'bg-amber-950/30 border-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    routeStatus === 'ready' ? 'bg-emerald-500/20' : routeStatus === 'calculating' ? 'bg-amber-500/20' : 'bg-zinc-800'
                  }`}>
                    {routeStatus === 'ready'
                      ? <Check className="w-5 h-5 text-emerald-400" />
                      : routeStatus === 'calculating'
                      ? <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                      : <Navigation className="w-5 h-5 text-zinc-500" />}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase tracking-widest font-black block ${
                      routeStatus === 'ready' ? 'text-emerald-400' : routeStatus === 'calculating' ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {routeStatus === 'ready' ? '✅ Trajet Bellman-Ford Calculé' : routeStatus === 'calculating' ? '🔄 Calcul du détour en cours...' : 'Trajet en attente'}
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      {routeStatus === 'ready'
                        ? (INCIDENT_CONFIG[selectedIncidentType || 'SOS Général'] || INCIDENT_CONFIG['SOS Général']).routeNote
                        : routeStatus === 'calculating'
                        ? 'OSRM recalcule l\'itinéraire d\'urgence...'
                        : 'En attente de données de trajet'}
                    </span>
                  </div>
                </div>

                {/* Position telemetry widget */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3">📍 Position GPS Télémetrique</span>
                  <div className="font-mono text-sm space-y-1.5 bg-zinc-950 p-3 rounded-xl border border-zinc-850 shadow-inner">
                    <p className="text-zinc-300">LAT: <span className="font-black text-red-400">{lat}</span></p>
                    <p className="text-zinc-300">LON: <span className="font-black text-red-400">{lon}</span></p>
                    <p className="text-[10px] text-zinc-500 mt-1.5">Précision: ±3.0m • Satellite actif</p>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(`${lat}, ${lon}`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
                    className="mt-3 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 border border-zinc-750"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? "Coordonnées copiées !" : "Copier la position GPS"}
                  </button>
                </div>

                {/* Contextual action + emergency call buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${(INCIDENT_CONFIG[selectedIncidentType || 'SOS Général'] || INCIDENT_CONFIG['SOS Général']).phone}`}
                    className="py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 font-bold text-[10px] uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-center"
                  >
                    <Phone className="w-4 h-4" />
                    {(INCIDENT_CONFIG[selectedIncidentType || 'SOS Général'] || INCIDENT_CONFIG['SOS Général']).actionLabel}
                  </a>
                  <a 
                    href="tel:15" 
                    className="py-3 px-4 rounded-xl bg-red-700 hover:bg-red-600 font-bold text-[10px] uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] text-center"
                  >
                    <Phone className="w-4 h-4" />
                    SAMU (15)
                  </a>
                </div>

                {/* Protocol checklist */}
                <div className="bg-red-950/20 border border-red-500/10 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-2">Protocole Actif</span>
                  <div className="space-y-1.5 text-xs text-zinc-400 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Alerte transmise en temps réel au Dispatcher</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {routeStatus === 'ready'
                        ? <span className="text-emerald-400 font-bold">✓</span>
                        : <span className="animate-spin inline-block w-3 h-3 border border-amber-400 border-t-transparent rounded-full" />}
                      <span className={routeStatus === 'ready' ? 'text-emerald-300' : 'text-amber-300'}>
                        Bellman-Ford {routeStatus === 'ready' ? 'actif — détour calculé' : 'en cours de calcul...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse text-red-500">●</span>
                      <span className="text-zinc-200">En attente de résolution par le dispatcher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Disable Actions */}
            <div className="w-full max-w-4xl z-10 border-t border-red-500/20 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-zinc-500 text-center md:text-left">
                Ne désactivez le protocole que si le danger est écarté et la sécurité rétablie.
              </p>
              <button
                onClick={handleResumeNavigation}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-red-400" />
                DÉSACTIVER LE PROTOCOLE SOS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Second SOS Countdown Overlay */}
      <AnimatePresence>
        {isCountingDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center z-[9999] text-white"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),transparent)] animate-pulse" />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-red-500 bg-red-950/80 shadow-[0_0_80px_rgba(239,68,68,0.8)] mb-8"
            >
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500/50 animate-ping" />
              
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdown}
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-8xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                >
                  {countdown}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <h3 className="text-2xl font-black uppercase tracking-widest text-center px-6 mb-2">
              Activation du SOS...
            </h3>
            <p className="text-sm font-medium text-zinc-400 text-center px-6 mb-12 max-w-xs leading-relaxed">
              Le centre de contrôle va être alerté automatiquement. Cliquez ci-dessous pour annuler.
            </p>

            <button
              onClick={cancelSosCountdown}
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 hover:border-zinc-700"
            >
              <X className="w-5 h-5 text-red-500" />
              ANNULER LE SIGNALEMENT
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incident Type Selection Modal */}
      <AnimatePresence>
        {showIncidentTypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl relative"
            >
              {/* Decorative light */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Nature de l'Urgence
                  </h3>
                  <p className="text-xs text-zinc-555 mt-0.5 font-medium">
                    Sélectionnez le type d'incident pour adapter l'assistance.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowIncidentTypeModal(false);
                    submitSosIncident("SOS Général");
                  }}
                  className="text-zinc-500 hover:text-zinc-350 p-1.5 rounded-full hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { name: "Accident / Collision", val: "Accident", icon: AlertOctagon, color: "text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10" },
                  { name: "Panne Mécanique", val: "Panne Mécanique", icon: Wrench, color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" },
                  { name: "Urgence Médicale", val: "Urgence Médicale", icon: HeartPulse, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" },
                  { name: "Menace Sécurité", val: "Menace Sécurité", icon: ShieldAlert, color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10" },
                  { name: "Route Bloquée / Météo", val: "Route Bloquée", icon: MapPin, color: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" },
                  { name: "Autre / Général", val: "Autre", icon: AlertTriangle, color: "text-zinc-400 border-zinc-500/20 bg-zinc-500/5 hover:bg-zinc-500/10" }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => submitSosIncident(item.val)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all group hover:scale-[1.02] active:scale-[0.98] ${item.color}`}
                  >
                    <item.icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowIncidentTypeModal(false)}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
              >
                Annuler l'alerte
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Break Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center z-[9999] text-white"
          >
            {/* Animated coffee cup with breathing effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-36 h-36 flex items-center justify-center rounded-full border-4 border-[#c084fc]/30 bg-zinc-900 shadow-[0_0_60px_rgba(192,132,252,0.3)] mb-8"
            >
              <div className="absolute inset-0 rounded-full border-2 border-[#c084fc]/10 animate-ping" />
              <Coffee className="w-16 h-16 text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
            </motion.div>

            <h3 className="text-2xl font-black uppercase tracking-widest text-center px-6 mb-2">
              Pause Réglementaire Active
            </h3>
            <p className="text-sm font-medium text-zinc-400 text-center px-6 mb-8 max-w-xs">
              Temps de repos comptabilisé pour le dispatcher.
            </p>

            {/* Timer count up */}
            <div className="font-mono text-5xl font-black text-white bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-3xl mb-12 shadow-2xl tracking-widest">
              {formatRestTime(restSeconds)}
            </div>

            {/* Resume button */}
            <button
              onClick={stopRestBreak}
              className="px-8 py-4 bg-white text-black font-extrabold rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-zinc-200 active:scale-95 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              REPRENDRE LE TRAJET
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Completion Congratulations Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4 text-white"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl relative"
            >
              {/* Green pulsing checkmark */}
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 relative animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>

              <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-2">
                Félicitations !
              </h3>
              <p className="text-sm text-zinc-400 font-medium mb-1">
                Destination atteinte avec succès.
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Le trajet de <span className="text-zinc-300 font-extrabold">{activeTrip.origin}</span> à <span className="text-zinc-300 font-extrabold">{activeTrip.destination}</span> est maintenant terminé. Les rapports de mission et de télémétrie ont été transmis aux dispatchers.
              </p>

              <button
                onClick={completeTrip}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-98 text-xs tracking-widest uppercase border border-emerald-400/20"
              >
                Terminer la Mission & Se Libérer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
