import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle, Plus, Search, Clock, MapPin,
  RefreshCw, Activity, AlertOctagon, ShieldCheck, Siren,
  Coffee, Play, X, Navigation, Truck, ChevronDown, ChevronUp,
  Check, Lightbulb, Route
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/api";

interface Incident {
  id: string;
  tripId: string;
  description: string;
  reportedAt: string;
  severity: string;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  driverId: string;
  vehicleId: string;
  distance?: number;
  duration?: number;
  winner?: string;
  status?: string;
  zonesJson?: string;
  customCoordsJson?: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Extract SOS sub-type from description like "[SOS - Route Bloquée]..."
function extractSosSubType(desc: string): string | null {
  const match = desc.match(/\[SOS\s*-\s*([^\]]+)\]/);
  return match ? match[1].trim() : null;
}

// Classify incident type from description tag
function getIncidentType(desc: string): { label: string; color: string; icon: any } {
  if (desc.includes("[SOS")) return { label: "SOS", color: "red", icon: Siren };
  if (desc.includes("[PAUSE AUTOMATIQUE]")) return { label: "Repos Auto", color: "purple", icon: Coffee };
  if (desc.includes("[PAUSE]")) return { label: "Repos Manuel", color: "purple", icon: Coffee };
  if (desc.includes("[REPRISE]")) return { label: "Reprise", color: "emerald", icon: Play };
  return { label: "Anomalie", color: "orange", icon: AlertTriangle };
}

// Admin-side recommendations per SOS sub-type
const ADMIN_INCIDENT_CONFIG: Record<string, { icon: string; recommendation: string; action: string; routeRecommendation: string }> = {
  "Accident": {
    icon: "💥",
    recommendation: "Contacter les assurances et les autorités (gendarmerie 177). Prévenir le service médical d'urgence si nécessaire. Bloquer ce tronçon dans le système pour les autres véhicules.",
    action: "Bloquer tronçon + Alerter assurance",
    routeRecommendation: "Bellman-Ford actif — contournement via Beni Mellal calculé pour le chauffeur"
  },
  "Panne Mécanique": {
    icon: "🔧",
    recommendation: "Dispatcher immédiatement un véhicule de dépannage vers la position GPS du chauffeur. Reprogrammer la livraison avec un autre conducteur disponible.",
    action: "Dispatcher dépannage + Reprogrammer",
    routeRecommendation: "Chauffeur immobilisé — attente dépanneur"
  },
  "Urgence Médicale": {
    icon: "🏥",
    recommendation: "Les secours (SAMU 15) ont été alertés. Vérifier l'état du conducteur via le téléphone. Suspendre immédiatement le trajet et prévenir le responsable RH.",
    action: "Vérifier état + Contacter RH",
    routeRecommendation: "Bellman-Ford actif — accès secours facilité"
  },
  "Menace Sécurité": {
    icon: "🛡️",
    recommendation: "Prévenir immédiatement la gendarmerie (177). Monitorer la position GPS en continu. Ne pas contacter le chauffeur par téléphone (risque sécuritaire).",
    action: "Alerter gendarmerie (177)",
    routeRecommendation: "Route alternative calculée — zone à risque contournée"
  },
  "Route Bloquée": {
    icon: "🚧",
    recommendation: "Route confirmée impraticable. Le système Bellman-Ford a recalculé un itinéraire via Beni Mellal. Notifier tous les autres véhicules sur ce tronçon.",
    action: "Notifier la flotte + Mettre à jour carte",
    routeRecommendation: "Contournement via Beni Mellal — détour calculé et transmis"
  },
  "Autre": {
    icon: "⚠️",
    recommendation: "Contacter le chauffeur pour obtenir plus de détails. Évaluer la situation avant de prendre une décision. Documenter l'incident dans le rapport de flotte.",
    action: "Contacter chauffeur + Documenter",
    routeRecommendation: "Bellman-Ford en standby selon évaluation"
  },
  "SOS Général": {
    icon: "🚨",
    recommendation: "Alerte SOS générale reçue. Contacter immédiatement le chauffeur et évaluer la nature du danger. Bellman-Ford actif pour tout besoin de déviation.",
    action: "Contacter chauffeur + Évaluer",
    routeRecommendation: "Bellman-Ford actif — contournement d'urgence disponible"
  }
};

const COLOR_MAP: Record<string, { badge: string; bar: string; glow: string }> = {
  red:     { badge: "bg-red-500/10 text-red-400 border-red-500/20",     bar: "bg-red-500",    glow: "bg-red-500" },
  orange:  { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", bar: "bg-orange-500", glow: "bg-orange-500" },
  yellow:  { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", bar: "bg-yellow-500", glow: "bg-yellow-500" },
  blue:    { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",   bar: "bg-blue-500",   glow: "bg-blue-500" },
  purple:  { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", bar: "bg-purple-500", glow: "bg-purple-500" },
  emerald: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", bar: "bg-emerald-500", glow: "bg-emerald-500" },
};

function severityColor(sev: string) {
  if (sev === "Critical") return COLOR_MAP.red;
  if (sev === "High")     return COLOR_MAP.orange;
  if (sev === "Medium")   return COLOR_MAP.yellow;
  return COLOR_MAP.blue;
}

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ tripId: "", description: "", severity: "Low" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [incidentsData, tripsData, driversData] = await Promise.all([
        apiRequest<Incident[]>("/incidents"),
        apiRequest<Trip[]>("/trips").catch(() => []),
        apiRequest<Driver[]>("/drivers").catch(() => []),
      ]);
      setIncidents(incidentsData.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()));
      setTrips(tripsData);
      setDrivers(driversData);
      setIsBackendOffline(false);
    } catch {
      setIsBackendOffline(true);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  }, []);

  // Live polling every 6s
  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 6000);
    return () => clearInterval(poll);
  }, [fetchData]);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("/incidents", "POST", formData);
      await fetchData();
      setFormData({ tripId: "", description: "", severity: "Low" });
    } catch (err) {
      console.error("Failed to report incident", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SOS trips: active trips with Bellman-Ford winner
  const sosTrips = trips.filter(t => t.winner === "Bellman-Ford" && t.status !== "Completed" && t.status !== "Cancelled");

  const handleResolveSos = async (trip: Trip) => {
    setResolvingId(trip.id);
    try {
      await apiRequest(`/trips/${trip.id}`, "PUT", {
        id: trip.id,
        origin: trip.origin,
        destination: trip.destination,
        driverId: trip.driverId,
        vehicleId: trip.vehicleId,
        distance: trip.distance || 0,
        duration: trip.duration || 0,
        winner: "Dijkstra",
        status: trip.status || "Ongoing",
        zonesJson: trip.zonesJson || "[]",
        customCoordsJson: trip.customCoordsJson || "{}",
      });
      await fetchData();
    } catch (err) {
      console.error("Failed to resolve SOS", err);
    } finally {
      setResolvingId(null);
    }
  };

  // Filter tabs
  const FILTERS = ["All", "SOS", "Repos", "Reprise", "Critical", "High", "Medium", "Low"];

  const filteredIncidents = incidents.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (i.description?.toLowerCase() || "").includes(q) ||
      (i.tripId?.toLowerCase() || "").includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === "All") return true;
    if (activeFilter === "SOS") return i.description?.includes("[SOS");
    if (activeFilter === "Repos") return i.description?.includes("[PAUSE");
    if (activeFilter === "Reprise") return i.description?.includes("[REPRISE]");
    return i.severity === activeFilter;
  });

  const criticalCount = incidents.filter(i => i.severity === "Critical" || i.severity === "High").length;
  const restCount = incidents.filter(i => i.description?.includes("[PAUSE")).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed -top-20 -left-20 w-72 h-72 bg-red-500/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none fixed top-40 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Incidents Watch
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Surveillance en temps réel des alertes, SOS et anomalies de flotte.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-all flex items-center gap-2 group"
          >
            <RefreshCw className={`w-4 h-4 text-red-400 ${isSyncing ? "animate-spin" : ""}`} />
            Sync
          </button>
          {isBackendOffline ? (
            <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Hors ligne
            </span>
          ) : (
            <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" /> Live · 6s
            </span>
          )}
        </div>
      </div>

      {/* ══ SOS ACTIVE ALERT PANEL ══ */}
      <AnimatePresence>
        {sosTrips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative overflow-hidden rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-950/80 to-zinc-950/90 shadow-2xl shadow-red-500/20 p-6"
          >
            {/* pulsing ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-red-500/30 animate-ping pointer-events-none" style={{ animationDuration: "2s" }} />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                <Siren className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-red-300 font-black text-lg tracking-tight">🚨 SOS ACTIF — {sosTrips.length} urgence{sosTrips.length > 1 ? "s" : ""} en cours</h2>
                <p className="text-red-400/70 text-xs">Routage d'urgence Bellman-Ford activé — intervention requise</p>
              </div>
            </div>
            <div className="space-y-4">
              {sosTrips.map(trip => {
                const driver = drivers.find(d => d.id === trip.driverId);
                const isResolving = resolvingId === trip.id;
                // Find the most recent SOS incident for this trip to get the sub-type
                const sosIncident = incidents
                  .filter(i => i.tripId === trip.id && i.description?.includes("[SOS"))
                  .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())[0];
                const subType = sosIncident ? extractSosSubType(sosIncident.description) : null;
                const config = ADMIN_INCIDENT_CONFIG[subType || "SOS Général"] || ADMIN_INCIDENT_CONFIG["SOS Général"];

                return (
                  <div key={trip.id} className="flex flex-col gap-4 bg-red-950/50 border border-red-500/20 rounded-2xl px-5 py-4">
                    {/* Top row: driver info + badges + resolve */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500/15 rounded-xl shrink-0">
                          <span className="text-2xl">{config.icon}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {driver ? `${driver.firstName} ${driver.lastName}` : "Chauffeur inconnu"}
                          </p>
                          <div className="flex items-center gap-1.5 text-red-400/70 text-xs mt-0.5">
                            <Navigation className="w-3 h-3" />
                            <span>{trip.origin} → {trip.destination}</span>
                          </div>
                          {driver?.phone && (
                            <p className="text-zinc-500 text-xs mt-0.5">{driver.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {subType && (
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            {subType}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Bellman-Ford actif
                        </span>
                        <span className="px-2 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg text-[10px] font-mono font-bold">
                          TRP-{trip.id.substring(0, 6)}
                        </span>
                        <button
                          onClick={() => handleResolveSos(trip)}
                          disabled={isResolving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isResolving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                          {isResolving ? "Résolution..." : "Résoudre SOS"}
                        </button>
                      </div>
                    </div>
                    {/* Recommendation row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 bg-amber-950/30 border border-amber-500/15 rounded-xl p-3">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                          <Lightbulb className="w-3 h-3" /> Recommandation Admin
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{config.recommendation}</p>
                      </div>
                      <div className="sm:w-56 bg-emerald-950/20 border border-emerald-500/15 rounded-xl p-3">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                          <Route className="w-3 h-3" /> Statut Trajet
                        </span>
                        <p className="text-xs text-emerald-300 leading-relaxed">{config.routeRecommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", val: incidents.length, icon: AlertTriangle, cls: "text-zinc-300", bg: "bg-zinc-800/50 border-white/10" },
          { label: "SOS Actifs", val: sosTrips.length, icon: Siren, cls: "text-red-400", bg: "bg-red-500/10 border-red-500/20", pulse: sosTrips.length > 0 },
          { label: "Critiques / Hauts", val: criticalCount, icon: AlertOctagon, cls: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "Arrêts Repos", val: restCount, icon: Coffee, cls: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
        ].map(card => (
          <Card key={card.label} className="bg-zinc-950/40 border-white/5 backdrop-blur-xl hover:bg-zinc-900/50 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${card.bg} border flex items-center justify-center shrink-0`}>
                <card.icon className={`w-5 h-5 ${card.cls} ${(card as any).pulse ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500">{card.label}</p>
                <h3 className="text-2xl font-black text-white">{card.val}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ══ FORM ══ */}
        <div className="xl:col-span-1">
          <Card className="bg-zinc-950/60 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden sticky top-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
            <div className="p-5 border-b border-white/5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-400" /> Signaler Anomalie
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">Créer manuellement un incident pour un trajet actif.</p>
            </div>
            <CardContent className="p-5">
              <form onSubmit={handleReportIncident} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Trajet cible</label>
                  <select
                    value={formData.tripId}
                    onChange={e => setFormData({ ...formData, tripId: e.target.value })}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">Sélectionner un trajet actif</option>
                    {trips.filter(t => t.status !== "Completed" && t.status !== "Cancelled").map(t => {
                      const d = drivers.find(dr => dr.id === t.driverId);
                      return (
                        <option key={t.id} value={t.id} className="bg-zinc-900">
                          {t.origin} → {t.destination}{d ? ` (${d.firstName})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Décrivez l'incident en détail..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all min-h-[100px] placeholder:text-zinc-600 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Niveau de menace</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Low", "Medium", "High", "Critical"] as const).map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: sev })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          formData.severity === sev
                            ? sev === "Critical" ? "bg-red-500/20 text-red-300 border-red-500/40"
                            : sev === "High"     ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                            : sev === "Medium"   ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-zinc-900/60 text-zinc-500 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {sev === "Low" ? "🟦 Low" : sev === "Medium" ? "🟨 Medium" : sev === "High" ? "🟧 High" : "🔴 Critical"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSubmitting ? "Envoi..." : "Soumettre Alerte"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ══ INCIDENTS LIST ══ */}
        <div className="xl:col-span-2 space-y-5">
          {/* Search + Filter bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher par description ou ID trajet..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 backdrop-blur-xl transition-all placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTERS.map(f => {
                const count =
                  f === "All"     ? incidents.length
                : f === "SOS"     ? incidents.filter(i => i.description?.includes("[SOS")).length
                : f === "Repos"   ? incidents.filter(i => i.description?.includes("[PAUSE")).length
                : f === "Reprise" ? incidents.filter(i => i.description?.includes("[REPRISE]")).length
                : incidents.filter(i => i.severity === f).length;

                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                      activeFilter === f
                        ? f === "SOS"      ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : f === "Repos"    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : f === "Reprise"  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : f === "Critical" ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : f === "High"     ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                        : f === "Medium"   ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                        : f === "Low"      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : "bg-white/10 text-white border-white/20"
                        : "bg-zinc-950/60 text-zinc-500 border-white/5 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {f}
                    <span className="opacity-60 font-mono text-[10px]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incidents */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredIncidents.map(incident => {
                const type = getIncidentType(incident.description || "");
                const sevColors = severityColor(incident.severity);
                const typeColors = COLOR_MAP[type.color] || COLOR_MAP.orange;
                const trip = trips.find(t => t.id === incident.tripId);
                const driver = trip ? drivers.find(d => d.id === trip.driverId) : null;
                const isExpanded = expandedId === incident.id;
                const isSos = incident.description?.includes("[SOS");
                const subType = isSos ? extractSosSubType(incident.description || "") : null;
                const adminConfig = subType
                  ? (ADMIN_INCIDENT_CONFIG[subType] || ADMIN_INCIDENT_CONFIG["SOS Général"])
                  : null;
                const isBellmanActive = trip?.winner === "Bellman-Ford";

                return (
                  <motion.div
                    key={incident.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    className={`relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${
                      isSos
                        ? "bg-red-950/30 border-red-500/30 shadow-lg shadow-red-500/10"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60"
                    }`}
                  >
                    {/* Left severity bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${sevColors.bar}`} />
                    {/* Top-right glow */}
                    <div className={`absolute top-0 right-0 w-28 h-28 blur-[50px] opacity-10 pointer-events-none ${sevColors.glow}`} />

                    {/* SOS pulsing border */}
                    {isSos && <div className="absolute inset-0 rounded-2xl border border-red-500/20 animate-pulse pointer-events-none" />}

                    <div
                      className="flex items-start gap-4 px-5 py-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                    >
                      {/* Icon */}
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 border ${typeColors.badge}`}>
                        <type.icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-black border ${typeColors.badge}`}>
                            {type.label}{subType ? ` — ${subType}` : ""}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border ${sevColors.badge}`}>
                            {incident.severity}
                          </span>
                          {isBellmanActive && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> BF Actif
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="w-3 h-3" />
                            {new Date(incident.reportedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                        <p className={`text-sm leading-snug font-medium ${isSos ? "text-red-200" : "text-white"}`}>
                          {incident.description}
                        </p>
                      </div>

                      {/* Right: Trip + expand */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs text-zinc-400 font-mono">TRP-{(incident.tripId || "").substring(0, 6)}</span>
                        </div>
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-zinc-500" />
                          : <ChevronDown className="w-4 h-4 text-zinc-500" />
                        }
                      </div>
                    </div>

                    {/* ══ Expanded details ══ */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 ml-12 border-t border-white/5 space-y-4">
                            {/* Trip + driver info */}
                            {trip && (
                              <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="font-semibold text-white">{trip.origin}</span>
                                  <span className="text-zinc-600">→</span>
                                  <span className="font-semibold text-white">{trip.destination}</span>
                                </div>
                                {driver && (
                                  <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-white font-semibold">{driver.firstName} {driver.lastName}</span>
                                    {driver.phone && <span className="text-zinc-500">{driver.phone}</span>}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                  <span className="font-mono">ID: {incident.id.substring(0, 12)}...</span>
                                </div>
                              </div>
                            )}
                            {!trip && (
                              <p className="text-zinc-600 text-xs">Trajet introuvable (supprimé ou archivé)</p>
                            )}

                            {/* ── Bellman-Ford route status badge (SOS only) ── */}
                            {isSos && trip && (
                              <div className={`flex items-center gap-3 rounded-xl p-3 border ${
                                isBellmanActive
                                  ? "bg-emerald-950/30 border-emerald-500/20"
                                  : "bg-zinc-900/60 border-zinc-700"
                              }`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isBellmanActive ? "bg-emerald-500/20" : "bg-zinc-800"}`}>
                                  {isBellmanActive
                                    ? <Check className="w-4 h-4 text-emerald-400" />
                                    : <Route className="w-4 h-4 text-zinc-500" />}
                                </div>
                                <div>
                                  <span className={`text-[10px] uppercase tracking-widest font-black block ${isBellmanActive ? "text-emerald-400" : "text-zinc-500"}`}>
                                    {isBellmanActive ? "✅ Trajet Bellman-Ford — Détour actif" : "ℹ️ Trajet résolu — Dijkstra standard"}
                                  </span>
                                  <span className="text-xs text-zinc-400 mt-0.5 block">
                                    {isBellmanActive
                                      ? (adminConfig?.routeRecommendation || "Contournement d'urgence calculé et transmis au conducteur")
                                      : "L'incident a été résolu. Le chauffeur suit l'itinéraire standard."}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* ── Admin recommendation (SOS only) ── */}
                            {isSos && adminConfig && (
                              <div className="space-y-2">
                                <div className="bg-amber-950/20 border border-amber-500/15 rounded-xl p-3">
                                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                    <Lightbulb className="w-3 h-3" /> Action Recommandée
                                  </span>
                                  <p className="text-xs text-zinc-300 leading-relaxed mb-2">{adminConfig.recommendation}</p>
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-300">
                                    <AlertOctagon className="w-3 h-3" /> {adminConfig.action}
                                  </div>
                                </div>

                                {/* Resolve SOS button in expanded card if still active */}
                                {isBellmanActive && trip && (
                                  <button
                                    onClick={() => handleResolveSos(trip)}
                                    disabled={resolvingId === trip.id}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                  >
                                    {resolvingId === trip.id
                                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Résolution en cours...</>
                                      : <><ShieldCheck className="w-3.5 h-3.5" /> Marquer comme résolu — Repasser sur Dijkstra</>}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredIncidents.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold">Aucun incident trouvé</h3>
                <p className="text-zinc-500 text-sm mt-1">
                  {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Tous les systèmes sont opérationnels."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
