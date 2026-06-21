import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Map as MapIcon, 
  Search, 
  Navigation, 
  User, 
  Truck, 
  Clock, 
  Crosshair, 
  CheckCircle, 
  Activity, 
  X, 
  Play, 
  ChevronDown,
  Route,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';

// --- MOCK DATA ---
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

const PREDEFINED_REST_STOPS = [
  { name: "Aire de repos Bouznika", lat: 33.7892, lon: -7.1594 },
  { name: "Aire de repos Skhirat", lat: 33.8456, lon: -7.0212 },
  { name: "Aire de repos Settat", lat: 32.9912, lon: -7.6324 },
  { name: "Aire de repos Benguerir", lat: 32.2215, lon: -7.9542 },
  { name: "Aire de repos Chichaoua", lat: 31.5452, lon: -8.7612 },
  { name: "Aire de repos Imintanout", lat: 31.2056, lon: -8.8456 },
  { name: "Aire de repos Larache", lat: 35.1512, lon: -6.1245 },
  { name: "Aire de repos Moulay Bousselham", lat: 34.8612, lon: -6.2412 },
  { name: "Aire de repos Khemisset", lat: 33.8245, lon: -6.0712 },
  { name: "Aire de repos Taza", lat: 34.2212, lon: -4.0123 },
];

const getSuggestedRestStops = (origName: string, destName: string, zonesList: any[], citiesList: any[]) => {
  if (!origName || !destName) return [];
  const cities = [origName, ...zonesList.map((z: any) => z.city), destName];
  const coords = cities.map(cName => {
    const city = citiesList.find((c: any) => c.name.toLowerCase() === cName.toLowerCase());
    return city ? { lat: city.lat, lon: city.lon } : null;
  }).filter((c): c is { lat: number; lon: number } => !!c);
  
  if (coords.length < 2) return [];
  
  return PREDEFINED_REST_STOPS.filter(stop => {
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i];
      const p2 = coords[i+1];
      
      const minLat = Math.min(p1.lat, p2.lat) - 0.25;
      const maxLat = Math.max(p1.lat, p2.lat) + 0.25;
      const minLon = Math.min(p1.lon, p2.lon) - 0.25;
      const maxLon = Math.max(p1.lon, p2.lon) + 0.25;
      
      if (stop.lat >= minLat && stop.lat <= maxLat && stop.lon >= minLon && stop.lon <= maxLon) {
        const dist1 = haversineDistance(stop.lat, stop.lon, p1.lat, p1.lon);
        const dist2 = haversineDistance(stop.lat, stop.lon, p2.lat, p2.lon);
        const segmentDist = haversineDistance(p1.lat, p1.lon, p2.lat, p2.lon);
        
        if (dist1 + dist2 < segmentDist * 1.35) {
          return true;
        }
      }
    }
    return false;
  });
};

// --- ALGORITHMS ---
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1.3; // * 1.3 for realistic road distance
}

// Build a fully connected graph of cities
function buildGraph(cities: any[]) {
  const graph: Record<string, Record<string, number>> = {};
  cities.forEach(c1 => {
    graph[c1.name] = {};
    cities.forEach(c2 => {
      if (c1.name !== c2.name) {
        graph[c1.name][c2.name] = haversineDistance(c1.lat, c1.lon, c2.lat, c2.lon);
      }
    });
  });
  return graph;
}

function getCityCoords(cityName: string, cities: any[]) {
  const city = cities.find((c: any) => c.name.toLowerCase() === cityName.toLowerCase());
  return city ? { lat: city.lat, lon: city.lon } : null;
}

// Ensure city is in graph, if not, add it using haversine from all others
function ensureCityInGraph(cityName: string, lat: number, lon: number, graph: Record<string, Record<string, number>>, citiesList: any[]) {
  if (graph[cityName]) return graph;
  const newGraph = { ...graph };
  newGraph[cityName] = {};
  Object.keys(newGraph).forEach(existingCity => {
    if (existingCity !== cityName) {
      const coords = getCityCoords(existingCity, citiesList) || { lat: 0, lon: 0 }; // Fallback
      if (coords.lat && coords.lon) {
        const dist = haversineDistance(lat, lon, coords.lat, coords.lon);
        newGraph[existingCity][cityName] = dist;
        newGraph[cityName][existingCity] = dist;
      }
    }
  });
  return newGraph;
}

// Dijkstra Algorithm
function dijkstra(graph: Record<string, Record<string, number>>, start: string, end: string) {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const queue = new Set(Object.keys(graph));
  
  for (const node of queue) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  while (queue.size > 0) {
    let minNode: string | null = null;
    for (const node of queue) {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    }
    
    if (minNode === null || distances[minNode] === Infinity) break;
    if (minNode === end) break;
    
    queue.delete(minNode);
    
    for (const neighbor in graph[minNode]) {
      const alt = distances[minNode] + graph[minNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = minNode;
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = end;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }
  return { path, distance: distances[end] };
}

// Bellman-Ford Algorithm
function bellmanFord(graph: Record<string, Record<string, number>>, start: string, end: string) {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const nodes = Object.keys(graph);
  
  for (const node of nodes) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    for (const u of nodes) {
      for (const v in graph[u]) {
        if (distances[u] + graph[u][v] < distances[v]) {
          distances[v] = distances[u] + graph[u][v];
          previous[v] = u;
        }
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = end;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }
  return { path, distance: distances[end] };
}

// --- COMPONENTS ---

// 1. Autocomplete Input Component
const AutocompleteInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  colorClass,
  allCities,
  onPickLocation
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: any;
  colorClass: string;
  allCities: any[];
  onPickLocation?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return allCities
      .map((c: any) => c.name)
      .filter((c: string) => c.toLowerCase().includes(value.toLowerCase()));
  }, [value, allCities]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < filtered.length) {
        onChange(filtered[activeIdx]);
        setIsOpen(false);
      } else {
        setIsOpen(false); // Accept free text
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full mb-4" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-[#8b949e] uppercase mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-2 focus:ring-[#22d3ee] focus:border-transparent block pl-10 pr-10 p-2.5 transition-all"
          placeholder={placeholder}
        />
        {onPickLocation && (
          <button 
            type="button"
            onClick={onPickLocation}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8b949e] hover:text-[#22d3ee] transition-colors"
          >
            <MapIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && value && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-10 w-full mt-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl max-h-48 overflow-y-auto"
          >
            {filtered.map((city: string, idx: number) => (
              <li
                key={city}
                onClick={() => {
                  onChange(city);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-sm transition-colors ${
                  idx === activeIdx ? 'bg-[#22d3ee]/20 text-[#22d3ee]' : 'text-[#e6edf3] hover:bg-[#30363d]'
                }`}
              >
                {city}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. Leaflet Modal Component
const MapModal = ({ trip, onClose, onUpdateTrip, citiesList }: {
  trip: any;
  onClose: () => void;
  onUpdateTrip: (tripId: string, type: string, zoneId: string | undefined, cityName: string, coords: any) => void;
  citiesList: any[];
}) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletLoaded = useRef<boolean>(false);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [waypointNames, setWaypointNames] = useState<any[]>([]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { leafletLoaded.current = true; initMap(); };
      document.body.appendChild(script);
    } else {
      if (window.L) initMap();
      else {
        const leafletScript = document.getElementById('leaflet-js');
        if (leafletScript) leafletScript.addEventListener('load', initMap);
      }
    }
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const drawRoute = async (L: any, map: any, markers: any[]) => {
    const coords = markers.map((m: any) => m.getLatLng());
    if (coords.length < 2) return;
    try {
      const coordString = coords.map((c: any) => `${c.lng},${c.lat}`).join(';');
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        if (polylineRef.current) map.removeLayer(polylineRef.current);
        polylineRef.current = L.geoJSON(data.routes[0].geometry, {
          style: { color: '#22d3ee', weight: 5, opacity: 0.8, dashArray: '10, 15', className: 'animate-route-flow' }
        }).addTo(map);
        setLiveStats({ distance: data.routes[0].distance / 1000, duration: data.routes[0].duration / 60 });
      }
    } catch (err) { console.error('OSRM Route error:', err); }
  };

  const centerOnMarker = (idx: number) => {
    if (!mapRef.current || !markersRef.current[idx]) return;
    const latlng = markersRef.current[idx].getLatLng();
    mapRef.current.flyTo(latlng, 12, { animate: true, duration: 0.8 });
    markersRef.current[idx].openPopup();
  };

  const initMap = async () => {
    if (!window.L || !trip || !containerRef.current) return;
    const L = window.L;
    if (mapRef.current) mapRef.current.remove();
    try {
      if (containerRef.current && (containerRef.current as any)._leaflet_id) (containerRef.current as any)._leaflet_id = null;
      const map = L.map(containerRef.current).setView([31.7917, -7.0926], 6);
      mapRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO' }).addTo(map);

      const waypoints = [
        { name: trip.origin, type: 'origin', color: '#22d3ee', label: 'Origin' },
        ...trip.zones.map((z: any, i: number) => ({ name: z.city, type: 'zone', id: z.id, color: '#f59e0b', label: `Zone ${i + 1}` })),
        { name: trip.destination, type: 'destination', color: '#22c55e', label: 'Destination' }
      ];

      markersRef.current = [];
      const coords: any[] = [];
      const initialNames: any[] = [];

      const customIcon = (color: string) => L.divIcon({
        className: 'custom-icon',
        html: `<div style="background-color:${color};width:16px;height:16px;border-radius:50%;border:3px solid #161b22;box-shadow:0 0 15px ${color};"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8]
      });

      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        let lat, lon;
        if (wp.type === 'origin' && trip.customCoords?.origin) { lat = trip.customCoords.origin.lat; lon = trip.customCoords.origin.lon; }
        else if (wp.type === 'destination' && trip.customCoords?.destination) { lat = trip.customCoords.destination.lat; lon = trip.customCoords.destination.lon; }
        else if (wp.type === 'zone' && trip.customCoords?.zones?.[wp.id]) { lat = trip.customCoords.zones[wp.id].lat; lon = trip.customCoords.zones[wp.id].lon; }
        else {
          const city = citiesList.find((c: any) => c.name.toLowerCase() === wp.name.toLowerCase());
          lat = city ? city.lat : 33.5731;
          lon = city ? city.lon : -7.5898;
        }
        coords.push({ lat, lon });
        initialNames.push({ label: wp.label, name: wp.name, color: wp.color, idx: i });

        const marker = L.marker([lat, lon], { icon: customIcon(wp.color), draggable: true }).addTo(map);
        marker.bindPopup(`<b style="color:${wp.color}">${wp.label}</b><br/>${wp.name}`);

        marker.on('dragend', async (e: any) => {
          drawRoute(L, map, markersRef.current);
          const newPos = e.target.getLatLng();
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newPos.lat}&lon=${newPos.lng}&format=json`);
            const data = await res.json();
            let newCityName = 'Unknown';
            if (data?.address) newCityName = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || 'Unknown';
            e.target.bindPopup(`<b style="color:${wp.color}">${wp.label}</b><br/>${newCityName}`).openPopup();
            setWaypointNames(prev => prev.map((w: any, k: number) => k === i ? { ...w, name: newCityName } : w));
            onUpdateTrip(trip.id, wp.type, wp.id, newCityName, { lat: newPos.lat, lon: newPos.lng });
          } catch (err) { console.error('Geocoding error:', err); }
        });
        markersRef.current.push(marker);
      }

      // Render suggested rest stops
      const restStops = trip.customCoords?.restStops || [];
      const restIcon = L.divIcon({
        className: 'custom-icon-rest',
        html: `<div style="background-color:#c084fc;width:14px;height:14px;border-radius:50%;border:2px solid #161b22;box-shadow:0 0 10px #c084fc;"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
      });
      restStops.forEach((stop: any) => {
        L.marker([stop.lat, stop.lon], { icon: restIcon })
          .addTo(map)
          .bindPopup(`<b>☕ Aire de Repos</b><br/>${stop.name}`);
      });

      setWaypointNames(initialNames);
      if (coords.length > 0) map.fitBounds(L.latLngBounds(coords.map(c => [c.lat, c.lon])), { padding: [50, 50] });
      drawRoute(L, map, markersRef.current);
      setTimeout(() => map.invalidateSize(), 250);
    } catch (err) { console.error('Map initialization error:', err); }
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <style>{`
        @keyframes routeFlow { from { stroke-dashoffset: 50; } to { stroke-dashoffset: 0; } }
        .animate-route-flow { animation: routeFlow 1s linear infinite; }
      `}</style>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        style={{ width: '95vw', height: '88vh', maxWidth: '1400px' }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-row"
      >
        {/* SIDE PANEL: Waypoint Guide */}
        <div className="w-64 shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-base font-bold text-[#e6edf3] flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#22d3ee]" /> {trip?.id}
            </h2>
            <p className="text-[10px] text-[#8b949e] mt-1">Click a point to center the map</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {waypointNames.map((wp, i) => (
              <button key={i} onClick={() => centerOnMarker(wp.idx)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-[#161b22] border border-[#30363d] hover:bg-white/5 transition-all"
              >
                <div className="mt-1 shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wp.color, boxShadow: `0 0 8px ${wp.color}` }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: wp.color }}>{wp.label}</div>
                  <div className="text-sm text-[#e6edf3] truncate font-medium">{wp.name || '—'}</div>
                </div>
              </button>
            ))}
          </div>
          {liveStats && (
            <div className="p-4 border-t border-[#30363d] bg-[#161b22] space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Distance</div>
                <div className="text-[#22d3ee] font-extrabold text-lg">{liveStats.distance.toFixed(1)} <span className="text-xs font-normal">km</span></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-[10px] text-[#8b949e] uppercase font-bold">Duration</div>
                <div className="text-[#22c55e] font-extrabold text-lg">{Math.floor(liveStats.duration / 60)}h {Math.round(liveStats.duration % 60)}m</div>
              </div>
              <div className="text-[10px] text-[#8b949e] text-center pt-1 border-t border-[#30363d]">Drag markers to recalculate live</div>
            </div>
          )}
        </div>
        {/* MAP AREA */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 z-[1000]">
            <button onClick={onClose}
              className="p-2 bg-[#0d1117]/80 backdrop-blur text-[#e6edf3] rounded-full hover:bg-[#30363d] transition-colors border border-[#30363d] shadow-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full h-full" ref={containerRef} />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// 3. Location Picker Modal Component
const LocationPickerModal = ({ currentVal, currentCoords, field, onClose, onConfirm, citiesList }: {
  currentVal: string;
  currentCoords: any;
  field: string;
  onClose: () => void;
  onConfirm: (field: string, newName: string, coords: any) => void;
  citiesList: any[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Defer init so React has fully committed the DOM
    const timer = setTimeout(() => {
      if (window.L) {
        doInitMap();
      } else if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = doInitMap;
        document.body.appendChild(script);
      } else {
        const leafletScript = document.getElementById('leaflet-js');
        if (leafletScript) leafletScript.addEventListener('load', doInitMap);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const doInitMap = () => {
    if (!window.L || !containerRef.current) return;
    const L = window.L;

    // Hard-reset the container so Leaflet doesn't complain
    if (containerRef.current && (containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Priority: 1) saved custom coords, 2) citiesList lookup, 3) center of Morocco
    let lat = 31.7917, lon = -7.0926;
    let zoom = 6;
    if (currentCoords) {
      lat = currentCoords.lat;
      lon = currentCoords.lon;
      zoom = 13;
    } else if (currentVal) {
      const city = citiesList.find((c: any) => c.name.toLowerCase() === currentVal.toLowerCase());
      if (city) { lat = city.lat; lon = city.lon; zoom = 10; }
    }

    const map = L.map(containerRef.current).setView([lat, lon], zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color:#22d3ee;width:16px;height:16px;border-radius:50%;border:3px solid #161b22;box-shadow:0 0 15px #22d3ee;"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8]
    });

    const marker = L.marker([lat, lon], { draggable: true, icon: customIcon }).addTo(map);
    marker.bindPopup('Drag to set exact location').openPopup();
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 300);
  };

  const handleConfirm = async () => {
    if (!markerRef.current) return;
    const pos = markerRef.current.getLatLng();
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`);
      const data = await res.json();
      let newName = 'Custom Location';
      if (data?.address) {
        newName = data.address.city || data.address.town || data.address.village ||
                  data.address.county || data.address.state || 'Custom Location';
      }
      onConfirm(field, newName, { lat: pos.lat, lon: pos.lng });
    } catch {
      onConfirm(field, 'Custom Location', { lat: pos.lat, lon: pos.lng });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div style={{ width: '90vw', maxWidth: '900px', height: '75vh' }}
        className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#30363d] bg-[#0d1117] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#e6edf3] flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-[#22d3ee]" />
            Pick Exact Location — <span className="text-[#22d3ee] capitalize">{field.replace('zone-', 'Zone ')}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 bg-[#30363d] rounded-full hover:bg-[#8b949e]/20 transition-colors">
            <X className="w-4 h-4 text-[#e6edf3]"/>
          </button>
        </div>
        <div className="flex-1 w-full" ref={containerRef}></div>
        <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between">
          <p className="text-xs text-[#8b949e]">Drag the pin to set the exact position, then confirm.</p>
          <button type="button" onClick={handleConfirm}
            className="bg-[#22d3ee] text-[#0d1117] font-bold px-6 py-2 rounded-lg hover:bg-[#22d3ee]/90 transition-colors flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> CONFIRM LOCATION
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// --- MAIN COMPONENT ---
export default function TripsRouting() {
  const [citiesList, setCitiesList] = useState([...MOROCCAN_CITIES]);
  const [graph, setGraph] = useState(buildGraph(MOROCCAN_CITIES));
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [numZones, setNumZones] = useState(0);
  const [zones, setZones] = useState<any[]>([]);
  const [formCustomCoords, setFormCustomCoords] = useState<any>({});
  
  const [apiVehicles, setApiVehicles] = useState<any[]>([]);
  const [apiDrivers, setApiDrivers] = useState<any[]>([]);
  const [mainVehicle, setMainVehicle] = useState('');
  const [mainDriver, setMainDriver] = useState('');
  const currentSuggestedStops = useMemo(() => {
    return getSuggestedRestStops(origin, destination, zones, citiesList);
  }, [origin, destination, zones, citiesList]);
  
  const [trips, setTrips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeMapTrip, setActiveMapTrip] = useState<any>(null);
  const [activePicker, setActivePicker] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        apiRequest<any[]>("/trips"),
        apiRequest<any[]>("/vehicles").catch(() => []),
        apiRequest<any[]>("/drivers").catch(() => [])
      ]);
      
      const hydratedTrips = tripsData.map(t => {
        try {
          return {
            ...t,
            zones: JSON.parse(t.zonesJson || "[]"),
            customCoords: JSON.parse(t.customCoordsJson || "{}")
          };
        } catch {
          return { ...t, zones: [], customCoords: {} };
        }
      });
      
      setTrips(hydratedTrips.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setApiVehicles(vehiclesData);
      setApiDrivers(driversData);
      const firstAvailableVeh = vehiclesData.find((v: any) => v.status === "Available");
      if (firstAvailableVeh) {
        setMainVehicle(firstAvailableVeh.id);
      } else if (vehiclesData.length > 0) {
        setMainVehicle(vehiclesData[0].id);
      }
      const firstAvailable = driversData.find((d: any) => d.isAvailable);
      if (firstAvailable) {
        setMainDriver(firstAvailable.id);
      } else if (driversData.length > 0) {
        setMainDriver(driversData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwap = () => {
    // Snapshot values before any state update
    const prevOrigin = origin;
    const prevDest = destination;
    setOrigin(prevDest);
    setDestination(prevOrigin);
    // Swap exact GPS coords too
    setFormCustomCoords((prev: Record<string, any>) => {
      const next: Record<string, any> = { ...prev };
      const oc = prev['origin'];
      const dc = prev['destination'];
      if (dc) next['origin'] = dc; else delete next['origin'];
      if (oc) next['destination'] = oc; else delete next['destination'];
      return next;
    });
  };

  const handlePickLocationConfirm = (field: any, newName: any, coords: any) => {
    let updatedCitiesList = [...citiesList];
    if (!updatedCitiesList.find((c: any) => c.name.toLowerCase() === newName.toLowerCase())) {
       updatedCitiesList.push({ name: newName, lat: coords.lat, lon: coords.lon });
       setCitiesList(updatedCitiesList);
    }
    
    // Save the exact coordinates for this field
    setFormCustomCoords((prev: Record<string, any>) => ({ ...prev, [field]: coords }));

    if (field === 'origin') setOrigin(newName);
    else if (field === 'destination') setDestination(newName);
    else if (field.startsWith('zone-')) {
       const idx = parseInt(field.split('-')[1]);
       updateZone(idx, 'city', newName);
    }
    setActivePicker(null);
  };

  // Handlers for Zones
  useEffect(() => {
    const currentZones = [...zones];
    if (numZones > currentZones.length) {
      for (let i = currentZones.length; i < numZones; i++) {
        currentZones.push({ id: `z${Date.now()}${i}`, city: '', vehicle: 'TRK-001', driver: 'Driver 1' });
      }
    } else if (numZones < currentZones.length) {
      currentZones.splice(numZones);
    }
    setZones(currentZones);
  }, [numZones]);

  const updateZone = (idx: number, field: string, value: any) => {
    const newZones = [...zones];
    newZones[idx][field] = value;
    setZones(newZones);
  };

  // Run routing algorithms
  const calculateAlgorithms = (orig: any, dest: any, zns: any, currentGraph: any, cList: any) => {
    let tDijkstra = 0;
    let tBellman = 0;
    let totalDist = 0;
    
    // Path includes: origin -> zone1 -> zone2 -> ... -> destination
    const waypoints = [orig, ...zns.map((z: any) => z.city), dest];
    let pathIsValid = true;
    let computedPath: any[] = [];

    let tempGraph = { ...currentGraph };

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i+1];
      
      if (!start || !end) {
        pathIsValid = false;
        break;
      }

      // Ensure nodes exist in graph
      if (!tempGraph[start]) {
        const coords = getCityCoords(start, cList) || { lat: 33.5, lon: -7.5 }; // mock if unknown
        tempGraph = ensureCityInGraph(start, coords.lat, coords.lon, tempGraph, cList);
      }
      if (!tempGraph[end]) {
        const coords = getCityCoords(end, cList) || { lat: 33.5, lon: -7.5 };
        tempGraph = ensureCityInGraph(end, coords.lat, coords.lon, tempGraph, cList);
      }

      const t0 = performance.now();
      const resDijkstra = dijkstra(tempGraph, start, end);
      const t1 = performance.now();
      tDijkstra += (t1 - t0);

      const t2 = performance.now();
      bellmanFord(tempGraph, start, end);
      const t3 = performance.now();
      tBellman += (t3 - t2);

      totalDist += resDijkstra.distance; // Assuming both are equal for positive weights
      if (i === 0) computedPath = [...resDijkstra.path];
      else computedPath = [...computedPath, ...resDijkstra.path.slice(1)];
    }

    const winner = tDijkstra <= tBellman ? 'Dijkstra' : 'Bellman-Ford';
    const estimatedDuration = (totalDist / 78) * 60; // in minutes

    return {
      success: pathIsValid && totalDist < Infinity,
      distance: totalDist,
      duration: estimatedDuration,
      winner,
      timeDijkstra: tDijkstra,
      timeBellman: tBellman,
      graph: tempGraph
    };
  };

  // Form Submission
  const handleDispatch = async (e: any) => {
    e.preventDefault();
    if (!origin || !destination) return alert("Origin and Destination are required!");
    if (origin.toLowerCase() === destination.toLowerCase()) return alert("Origin and Destination must be different!");
    if (!mainDriver || !mainVehicle) return alert("Driver and Vehicle are required!");
    
    const selectedVeh = apiVehicles.find(v => v.id === mainVehicle);
    const selectedDriver = apiDrivers.find(d => d.id === mainDriver);

    if (selectedVeh && selectedVeh.status !== "Available") {
      return alert(`Le véhicule ${selectedVeh.make} ${selectedVeh.model} n'est pas disponible (Statut actuel: ${selectedVeh.status}).`);
    }
    if (selectedDriver && !selectedDriver.isAvailable) {
      return alert(`Le chauffeur ${selectedDriver.firstName} ${selectedDriver.lastName} n'est pas disponible.`);
    }
    
    // Calculate Paths
    const algoRes = calculateAlgorithms(origin, destination, zones, graph, citiesList);
    setGraph(algoRes.graph); // Update graph with new dynamic nodes if any
    
    const suggestedStops = getSuggestedRestStops(origin, destination, zones, citiesList);
    const customCoords = {
      origin: formCustomCoords['origin'] || null,
      destination: formCustomCoords['destination'] || null,
      zones: zones.reduce((acc, z, idx) => {
        if (formCustomCoords[`zone-${idx}`]) acc[z.id] = formCustomCoords[`zone-${idx}`];
        return acc;
      }, {}),
      restStops: suggestedStops
    };

    try {
      const newTripData = {
        origin,
        destination,
        driverId: mainDriver,
        vehicleId: mainVehicle,
        distance: algoRes.distance,
        duration: algoRes.duration,
        winner: algoRes.winner,
        zonesJson: JSON.stringify(zones),
        customCoordsJson: JSON.stringify(customCoords)
      };

      await apiRequest("/trips", "POST", newTripData);

      // Update driver availability to false
      const selectedDriver = apiDrivers.find(d => d.id === mainDriver);
      if (selectedDriver) {
        await apiRequest(`/drivers/${mainDriver}`, "PUT", {
          id: selectedDriver.id,
          firstName: selectedDriver.firstName,
          lastName: selectedDriver.lastName,
          licenseNumber: selectedDriver.licenseNumber,
          phone: selectedDriver.phone || "+212 600 000000",
          isAvailable: false,
          rating: selectedDriver.rating || 5.0
        });
      }

      // Update vehicle status to OnMission
      const selectedVehicle = apiVehicles.find(v => v.id === mainVehicle);
      if (selectedVehicle) {
        await apiRequest(`/vehicles/${mainVehicle}`, "PUT", {
          id: selectedVehicle.id,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          plateNumber: selectedVehicle.plateNumber || selectedVehicle.licensePlate || "TRK-001",
          capacityTons: selectedVehicle.capacityTons || selectedVehicle.capacity || 10.0,
          type: selectedVehicle.type || "CargoVan",
          year: selectedVehicle.year || 2020,
          status: "OnMission"
        });
      }

      await fetchData();
      
      // Reset Form
      setOrigin('');
      setDestination('');
      setNumZones(0);
      setFormCustomCoords({});
    } catch (error) {
      console.error("Failed to dispatch trip", error);
      alert("Failed to dispatch trip. Backend might be offline.");
    }
  };

  // Map Drag Update Callback
  const handleUpdateTrip = (tripId: any, pointType: any, zoneId: any, newCityName: any, newCoords: any) => {
    // 1. Add new city to citiesList if not exists
    let updatedCitiesList = [...citiesList];
    if (!updatedCitiesList.find(c => c.name.toLowerCase() === newCityName.toLowerCase())) {
      updatedCitiesList.push({ name: newCityName, lat: newCoords.lat, lon: newCoords.lon });
      setCitiesList(updatedCitiesList);
    }

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        const updatedTrip = { ...t };
        if (!updatedTrip.customCoords) updatedTrip.customCoords = {};

        if (pointType === 'origin') {
          updatedTrip.origin = newCityName;
          updatedTrip.customCoords.origin = newCoords;
        } else if (pointType === 'destination') {
          updatedTrip.destination = newCityName;
          updatedTrip.customCoords.destination = newCoords;
        } else if (pointType === 'zone') {
          const zIdx = updatedTrip.zones.findIndex((z: any) => z.id === zoneId);
          if (zIdx !== -1) {
            updatedTrip.zones[zIdx].city = newCityName;
            if (!updatedTrip.customCoords.zones) updatedTrip.customCoords.zones = {};
            updatedTrip.customCoords.zones[zoneId] = newCoords;
          }
        }

        // Recalculate
        const algoRes = calculateAlgorithms(updatedTrip.origin, updatedTrip.destination, updatedTrip.zones, graph, updatedCitiesList);
        setGraph(algoRes.graph);
        
        updatedTrip.distance = algoRes.distance;
        updatedTrip.duration = algoRes.duration;
        updatedTrip.winner = algoRes.winner;

        // Sync with API in background
        apiRequest(`/trips/${tripId}`, "PUT", {
          id: updatedTrip.id,
          origin: updatedTrip.origin,
          destination: updatedTrip.destination,
          driverId: updatedTrip.driverId,
          vehicleId: updatedTrip.vehicleId,
          status: updatedTrip.status,
          distance: updatedTrip.distance,
          duration: updatedTrip.duration,
          winner: updatedTrip.winner,
          zonesJson: JSON.stringify(updatedTrip.zones),
          customCoordsJson: JSON.stringify(updatedTrip.customCoords)
        }).catch(err => console.error("Failed to sync drag update", err));

        // Also update activeMapTrip so modal re-renders stats if needed
        if (activeMapTrip?.id === tripId) setActiveMapTrip(updatedTrip);
        
        return updatedTrip;
      }
      return t;
    }));
  };

  const activeTrips = trips.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');

  const filteredTrips = activeTrips.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [mobileTab, setMobileTab] = React.useState<'trips'|'dispatch'>('dispatch');

  const sc = (status: string) =>
    status === 'IN TRANSIT' ? { bar: 'from-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/30' } :
    status === 'COMPLETED'  ? { bar: 'from-green-400', badge: 'bg-green-500/10 text-green-400 ring-green-500/30' } :
                               { bar: 'from-amber-400', badge: 'bg-amber-500/10 text-amber-400 ring-amber-500/30' };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px] bg-[#0d1117] text-[#e6edf3] w-full rounded-2xl border border-white/5 shadow-2xl overflow-hidden">

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex shrink-0 border-b border-[#30363d] bg-[#161b22]">
        {(['trips','dispatch'] as const).map(tab => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all border-b-2 ${mobileTab === tab ? 'text-[#22d3ee] border-[#22d3ee]' : 'text-[#8b949e] border-transparent'}`}
          >
            {tab === 'trips' ? <Route className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {tab === 'trips' ? `Trips (${activeTrips.length})` : 'New Dispatch'}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ══ LEFT — Trip List ══ */}
        <div className={`${mobileTab === 'trips' ? 'flex' : 'hidden'} md:flex w-full md:w-[380px] lg:w-[430px] shrink-0 flex-col border-r border-[#30363d]`}>

          {/* Header */}
          <div className="p-4 border-b border-[#30363d] bg-[#161b22] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-[#e6edf3] flex items-center gap-2">
                <div className="p-1.5 bg-[#22d3ee]/10 rounded-lg"><Route className="text-[#22d3ee] w-4 h-4" /></div>
                Trips &amp; Routing
              </h1>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b949e]" />
              <input type="text" placeholder="Search trips…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-9 pr-4 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:ring-2 focus:ring-[#22d3ee]/40 focus:border-[#22d3ee]/40 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Actifs', val: activeTrips.length, cls: 'text-[#e6edf3]' },
                { label: 'En Transit', val: activeTrips.filter(t => t.status === 'Ongoing' || t.status === 'IN TRANSIT').length, cls: 'text-[#22d3ee]' },
                { label: 'En attente', val: activeTrips.filter(t => t.status === 'Planned' || t.status === 'PLANNED').length, cls: 'text-[#f59e0b]' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d1117] border border-[#30363d] rounded-xl p-2.5 text-center">
                  <div className={`text-xl font-black ${s.cls}`}>{s.val}</div>
                  <div className="text-[9px] uppercase text-[#8b949e] font-semibold tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {filteredTrips.map((trip, idx) => {
                const s = sc(trip.status);
                return (
                  <motion.div key={trip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                    exit={{ opacity: 0, x: -16 }}
                    whileHover={{ scale: 1.01 }}
                    className="relative bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden cursor-pointer group hover:border-[#22d3ee]/30 hover:shadow-[0_4px_20px_rgba(34,211,238,0.07)] transition-all"
                    onClick={() => setActiveMapTrip(trip)}
                  >
                    <div className={`h-[3px] w-full bg-gradient-to-r ${s.bar} to-transparent`} />
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-mono text-sm font-bold text-[#e6edf3] group-hover:text-[#22d3ee] transition-colors">{trip.id}</span>
                          <div className="text-[9px] text-[#8b949e] mt-0.5">{trip.createdAt ? new Date(trip.createdAt).toLocaleString([],{hour:'2-digit',minute:'2-digit',month:'short',day:'numeric'}) : ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ring-1 ${s.badge}`}>{trip.status}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Voulez-vous vraiment supprimer ce trajet et libérer ses ressources ?")) {
                                try {
                                  // 1. Delete trip
                                  await apiRequest(`/trips/${trip.id}`, "DELETE");

                                  // 2. Release driver
                                  const driverObj = apiDrivers.find(d => d.id === trip.driverId);
                                  if (driverObj) {
                                    await apiRequest(`/drivers/${trip.driverId}`, "PUT", {
                                      id: driverObj.id,
                                      firstName: driverObj.firstName,
                                      lastName: driverObj.lastName,
                                      licenseNumber: driverObj.licenseNumber,
                                      phone: driverObj.phone || "+212 600 000000",
                                      isAvailable: true,
                                      rating: driverObj.rating || 5.0
                                    });
                                  }

                                  // 3. Release vehicle
                                  const vehicleObj = apiVehicles.find(v => v.id === trip.vehicleId);
                                  if (vehicleObj) {
                                    await apiRequest(`/vehicles/${trip.vehicleId}`, "PUT", {
                                      id: vehicleObj.id,
                                      make: vehicleObj.make,
                                      model: vehicleObj.model,
                                      plateNumber: vehicleObj.plateNumber || vehicleObj.licensePlate || "TRK-001",
                                      capacityTons: vehicleObj.capacityTons || vehicleObj.capacity || 10.0,
                                      type: vehicleObj.type || "CargoVan",
                                      year: vehicleObj.year || 2020,
                                      status: "Available"
                                    });
                                  }

                                  fetchData();
                                } catch (err) {
                                  console.error("Failed to delete trip", err);
                                  alert("Erreur lors de la suppression du trajet");
                                }
                              }
                            }}
                            className="p-1 hover:bg-red-500/20 text-zinc-550 hover:text-red-400 rounded transition-colors"
                            title="Supprimer ce trajet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <div className="flex flex-col items-center pt-0.5 shrink-0 gap-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                          {trip.zones.length > 0 ? trip.zones.map((_: any, i: number) => (
                            <React.Fragment key={i}><div className="w-px h-3 bg-[#30363d]" /><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /></React.Fragment>
                          )) : <div className="w-px h-5 bg-gradient-to-b from-[#30363d] to-[#22c55e]/20" />}
                          <div className="w-px h-2 bg-[#30363d]" />
                          <div className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#e6edf3] truncate">{trip.origin}</div>
                          {trip.zones.map((z: any, i: number) => <div key={i} className="text-[11px] text-[#f59e0b]/70 truncate">↳ {z.city || '—'}</div>)}
                          <div className="flex items-center gap-1">
                            {trip.status === 'IN TRANSIT' && <motion.div animate={{ x: [0,5,0] }} transition={{ repeat: Infinity, duration: 1.2 }}><Truck className="w-3 h-3 text-[#22d3ee]" /></motion.div>}
                            <div className="text-sm font-semibold text-[#e6edf3] truncate">{trip.destination}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#30363d]/50 text-[11px] text-[#8b949e]">
                        <div className="flex items-center gap-1"><Activity className="w-3 h-3 text-[#22d3ee]" /><span className="font-semibold text-[#e6edf3]">{(trip.distance||0).toFixed(0)}</span>km</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#22c55e]" /><span className="font-semibold text-[#e6edf3]">{Math.round((trip.duration||0)/60)}h{Math.round((trip.duration||0)%60)}m</span></div>
                        <div className="flex items-center gap-1 justify-end"><User className="w-3 h-3 text-[#f59e0b]" /><span className="font-semibold text-[#e6edf3] truncate">{apiDrivers.find(d => d.id === trip.driverId)?.firstName || 'Unknown'}</span></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredTrips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-[#8b949e]">
                <div className="p-4 bg-[#161b22] rounded-2xl border border-[#30363d] mb-3"><MapIcon className="w-10 h-10 opacity-20" /></div>
                <p className="font-semibold text-sm">No trips found</p>
                <p className="text-xs opacity-50 mt-1">Create a dispatch to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT — Dispatch Form ══ */}
        <div className={`${mobileTab === 'dispatch' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#0d1117] overflow-y-auto`}>
          <div className="p-5 md:p-7 max-w-3xl mx-auto w-full">

            <div className="mb-6 pb-5 border-b border-[#30363d]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#22d3ee]/10 rounded-xl"><Navigation className="w-5 h-5 text-[#22d3ee]" /></div>
                <div>
                  <h2 className="text-xl font-black text-[#e6edf3]">Create Dispatch</h2>
                  <p className="text-xs text-[#8b949e] mt-0.5">Plan routes with real-time optimization</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">

              {/* Route Details */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="text-[#22d3ee] w-3.5 h-3.5" /> Route Details
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                  <div className="flex-1">
                    <AutocompleteInput label="Origin" value={origin} onChange={setOrigin} placeholder="Starting city…"
                      icon={Crosshair} colorClass="text-[#22d3ee]" allCities={citiesList}
                      onPickLocation={() => setActivePicker({ field:'origin', currentVal:origin, currentCoords:formCustomCoords['origin']||null })} />
                  </div>
                  <div className="flex sm:flex-col items-center justify-center">
                    <button type="button" onClick={handleSwap} title="Swap"
                      className="p-2.5 mt-4 bg-[#0d1117] border border-[#30363d] rounded-xl text-[#8b949e] hover:text-[#22d3ee] hover:border-[#22d3ee]/50 hover:bg-[#22d3ee]/5 transition-all">
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <AutocompleteInput label="Destination" value={destination} onChange={setDestination} placeholder="Destination city…"
                      icon={MapPin} colorClass="text-[#22c55e]" allCities={citiesList}
                      onPickLocation={() => setActivePicker({ field:'destination', currentVal:destination, currentCoords:formCustomCoords['destination']||null })} />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Intermediate Zones</label>
                    <div className="relative">
                      <select value={numZones} onChange={e => setNumZones(Number(e.target.value))}
                        className="bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-xs rounded-lg py-1.5 pl-3 pr-6 appearance-none focus:ring-2 focus:ring-[#22d3ee]/40 cursor-pointer">
                        {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} zone{n!==1?'s':''}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8b949e] pointer-events-none" />
                    </div>
                  </div>
                  {zones.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <AnimatePresence>
                        {zones.map((zone: any, idx: number) => (
                          <motion.div key={zone.id} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}>
                            <AutocompleteInput label={`Zone ${idx+1}`} value={zone.city} onChange={(v: any) => updateZone(idx,'city',v)}
                              placeholder={`Zone ${idx+1} city…`} icon={MapPin} colorClass="text-[#f59e0b]" allCities={citiesList}
                              onPickLocation={() => setActivePicker({ field:`zone-${idx}`, currentVal:zone.city, currentCoords:formCustomCoords[`zone-${idx}`]||null })} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {currentSuggestedStops.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#30363d] space-y-2">
                      <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider block">
                        Aires de Repos Recommandées (Maroc)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentSuggestedStops.map((stop) => (
                          <div
                            key={stop.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c084fc]/10 border border-[#c084fc]/20 rounded-xl text-xs text-[#c084fc] font-semibold"
                          >
                            <span>☕</span>
                            <span>{stop.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Assignment */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="text-[#22d3ee] w-3.5 h-3.5" /> Assignment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <select 
                          className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-2 focus:ring-[#22d3ee] p-2.5 pl-10 appearance-none"
                          value={mainVehicle}
                          onChange={e => setMainVehicle(e.target.value)}
                        >
                          {apiVehicles.map(v => (
                            <option key={v.id} value={v.id} disabled={v.status !== 'Available'}>
                              {v.make} {v.model} ({v.plateNumber || v.licensePlate || v.id.substring(0,4)}) ({v.status === 'Available' ? 'Disponible' : 'En Mission'})
                            </option>
                          ))}
                          {apiVehicles.length === 0 && <option value="">No vehicles found</option>}
                        </select>
                        <Truck className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="flex-1 relative">
                        <select 
                          className="w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-2 focus:ring-[#22d3ee] p-2.5 pl-10 appearance-none"
                          value={mainDriver}
                          onChange={e => setMainDriver(e.target.value)}
                        >
                          {apiDrivers.map(d => (
                            <option key={d.id} value={d.id} disabled={!d.isAvailable}>
                              {d.firstName} {d.lastName} ({d.isAvailable ? 'Disponible' : 'En Mission'})
                            </option>
                          ))}
                          {apiDrivers.length === 0 && <option value="">No drivers found</option>}
                        </select>
                        <User className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                </div>
              </div>

              <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#22d3ee] to-[#0ea5e9] text-[#0d1117] font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all text-sm tracking-widest">
                <Play className="w-4 h-4 fill-current" /> CREATE DISPATCH
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL MAP */}
      <AnimatePresence>
        {activeMapTrip && (
          <MapModal trip={activeMapTrip} onClose={() => setActiveMapTrip(null)} onUpdateTrip={handleUpdateTrip} citiesList={citiesList} />
        )}
      </AnimatePresence>

      {/* LOCATION PICKER */}
      {activePicker && (
        <LocationPickerModal
          key={activePicker.field+'-'+(activePicker.currentCoords ? `${activePicker.currentCoords.lat},${activePicker.currentCoords.lon}` : activePicker.currentVal)}
          currentVal={activePicker.currentVal}
          currentCoords={activePicker.currentCoords||null}
          field={activePicker.field}
          onClose={() => setActivePicker(null)}
          onConfirm={handlePickLocationConfirm}
          citiesList={citiesList}
        />
      )}
    </div>
  );
}
