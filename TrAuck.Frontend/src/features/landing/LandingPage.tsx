import { motion, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Truck, PackageSearch, ShieldAlert, MapPin, ChevronRight, Globe, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";

// Animated counter hook
function useAnimatedCounter(target: number, duration = 2) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return controls.stop;
  }, [target, duration]);
  return value;
}

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

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden dark">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px]" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">TrAuck<span className="text-blue-500">.</span></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#technology" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block">Technology</a>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-32">
        {/* Hero Section */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
          >


            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-white leading-[1.05] mb-8">
              Logistics, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
                Mathematically Perfected.
              </span>
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black text-base font-bold hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group">
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/driver" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 border border-white/10 text-white text-base font-semibold hover:bg-zinc-800 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md">
                Driver App Demo <ChevronRight className="w-5 h-5 text-zinc-400" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Animated Dashboard Preview */}
        <section className="px-6 md:px-26 max-w-6xl mx-auto mt-20" style={{ perspective: "1600px" }}>
          <DashboardPreview />
        </section>

        {/* Core Algorithms Visualizer */}
        <section id="features" className="px-6 md:px-12 max-w-7xl mx-auto mt-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 mb-6">
              Core Algorithms
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Built on Advanced Mathematics</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">We replaced expensive hardware sensors with pure computational logic. Interactive diagrams below demonstrate our engine at work.</p>
          </motion.div>

          <AlgorithmVisualizer />
        </section>

        {/* How it Works Workflow */}
        <section id="technology" className="px-6 md:px-12 max-w-7xl mx-auto mt-40 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-6">
              Simple Workflow
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">How TrAuck Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Three steps to transform your fleet operations.</p>
          </motion.div>

          <WorkflowDiagram />
        </section>

        {/* CTA Section */}
        <section className="px-6 md:px-12 max-w-5xl mx-auto mt-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] bg-gradient-to-br from-blue-900/40 to-emerald-900/20 border border-white/10 p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full" />

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to transform your fleet?</h2>
            <p className="text-blue-100/70 mb-10 text-lg max-w-xl mx-auto relative z-10">Stop relying on legacy hardware. Move to the next generation of algorithmic logistics today.</p>

            <Link to="/login" className="inline-flex px-8 py-4 rounded-2xl bg-white text-black text-base font-bold hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] items-center justify-center gap-2 relative z-10 group">
              Get Started for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-12 px-6 md:px-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Truck className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">TrAuck<span className="text-blue-500">.</span></span>
        </div>
        <p className="text-zinc-500 text-sm">© 2026 TrAuck Logistics Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full animated dashboard preview panel with real Leaflet map
// ─────────────────────────────────────────────────────────────────────────────
function DashboardPreview() {
  const fleet = useAnimatedCounter(12, 1.5);
  const deliveries = useAnimatedCounter(142, 2);

  // Mouse-based 3D tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(5);
  const rotateY = useMotionValue(-3);
  // shadowOpacity reserved for future glare effect

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(5 - dy * 8);
    rotateY.set(-3 + dx * 8);
  };
  const handleMouseLeave = () => {
    rotateX.set(5);
    rotateY.set(-3);
  };

  // Animated truck positions – interpolate along routes
  const [truckPos, setTruckPos] = useState({ d: 0, b: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setTruckPos((p) => ({
        d: (p.d + 0.003) % 1,
        b: (p.b + 0.005) % 1,
      }));
    }, 50);
    return () => clearInterval(id);
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        boxShadow: "0 40px 120px rgba(59,130,246,0.2), 0 0 0 1px rgba(255,255,255,0.07)",
      }}
      className="relative rounded-[2rem] bg-zinc-950/80 backdrop-blur-2xl overflow-hidden aspect-video flex border border-white/8"
    >
      {/* ── SIDEBAR ─────────────────────────────────── */}
      <div className="w-44 border-r border-white/5 p-4 hidden md:flex flex-col gap-2 bg-black/30 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Truck className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">TrAuck<span className="text-blue-500">.</span></span>
        </div>
        {/* Nav items */}
        {[
          { label: "Dashboard", active: true },
          { label: "Fleet", active: false },
          { label: "Loads", active: false },
          { label: "Reports", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`h-8 w-full rounded-lg flex items-center px-3 text-xs font-medium transition-all ${item.active
              ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
              : "bg-white/3 text-zinc-500"
              }`}
          >
            {item.label}
          </div>
        ))}
        {/* Algorithm status badges */}
        <div className="mt-auto space-y-2">
          <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Engines</p>
          <motion.div
            className="flex items-center gap-1.5 text-[9px] text-emerald-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle2 className="w-3 h-3" /> Dijkstra
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[9px] text-red-400"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <AlertTriangle className="w-3 h-3" /> Bellman-Ford SOS
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 text-[9px] text-indigo-400"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-3 h-3" /> 3D Bin Packing
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Live Fleet Tracking</span>
            <motion.span
              className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[9px] text-emerald-400 font-medium">LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[9px] text-zinc-500 font-mono">21:33 UTC+1</div>
            <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-3 gap-3 px-5 pt-4 flex-shrink-0">
          {/* Fleet */}
          <motion.div
            className="bg-white/4 rounded-xl border border-white/6 p-3 relative overflow-hidden group"
            whileHover={{ borderColor: "rgba(59,130,246,0.4)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Active Fleet</p>
            <p className="text-xl font-bold text-white font-mono">{fleet}<span className="text-sm text-zinc-500">/15</span></p>
            <div className="flex items-center gap-1 mt-1">
              <Truck className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] text-blue-400">Real-time tracking</span>
            </div>
          </motion.div>
          {/* Deliveries */}
          <motion.div
            className="bg-white/4 rounded-xl border border-white/6 p-3 relative overflow-hidden group"
            whileHover={{ borderColor: "rgba(16,185,129,0.4)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Deliveries Today</p>
            <p className="text-xl font-bold text-white font-mono">{deliveries}</p>
            <span className="text-[9px] text-emerald-400">↑ +12% vs yesterday</span>
          </motion.div>
          {/* SOS */}
          <motion.div
            className="bg-red-500/5 rounded-xl border border-red-500/30 p-3 relative overflow-hidden"
            animate={{ borderColor: ["rgba(239,68,68,0.3)", "rgba(239,68,68,0.7)", "rgba(239,68,68,0.3)"] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
            <p className="text-[9px] text-red-400 uppercase tracking-wider mb-1">Active Alerts</p>
            <p className="text-xl font-bold text-red-400 font-mono">2</p>
            <span className="text-[9px] text-red-400/80">Dispatcher attention req.</span>
          </motion.div>
        </div>

        {/* Real Leaflet Map */}
        <div className="flex-1 mx-5 mb-4 mt-3 rounded-xl border border-white/6 overflow-hidden relative z-0">
          <MapContainer
            center={[33.575, -7.600]}
            zoom={13}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
            doubleClickZoom={false}
            touchZoom={false}
            style={{ height: '100%', width: '100%', background: '#09090b' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {/* Dijkstra route – blue solid */}
            <Polyline positions={DIJKSTRA_ROUTE} color="#3b82f6" weight={3} opacity={0.8} />
            {/* Bellman-Ford SOS – red dashed */}
            <Polyline positions={BELLMAN_ROUTE} color="#ef4444" weight={3} opacity={0.8} dashArray="10 6" />
            {/* Animated truck on Dijkstra route */}
            <CircleMarker center={dijkstraTruck} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#3b82f6', fillOpacity: 1 }}>
              <Popup><span className="text-xs"><strong>TRK-001</strong><br />On Route · Dijkstra</span></Popup>
            </CircleMarker>
            {/* Animated truck on Bellman-Ford route */}
            <CircleMarker center={bellmanTruck} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#ef4444', fillOpacity: 1 }}>
              <Popup><span className="text-xs text-red-500"><strong>TRK-005 (SOS)</strong><br />Emergency Reroute</span></Popup>
            </CircleMarker>
            {/* Destination pins */}
            {DESTINATION_PINS.map((pin) => (
              <CircleMarker key={pin.label} center={pin.pos} radius={5} pathOptions={{ color: '#fff', weight: 2, fillColor: '#10b981', fillOpacity: 1 }}>
                <Popup><span className="text-xs">{pin.label}</span></Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          {/* Legend overlay */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 flex items-center gap-4 border border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-blue-500 rounded" />
              <span className="text-[10px] text-zinc-300">Dijkstra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 4px, transparent 4px, transparent 7px)' }} />
              <span className="text-[10px] text-zinc-300">SOS Reroute</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Algorithm Visualizer Component
// ─────────────────────────────────────────────────────────────────────────────
function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: "dijkstra", title: "Dijkstra Routing", desc: "Calculates the absolute shortest path factoring in distance and historical speed data.", icon: <MapPin className="w-5 h-5 text-blue-400" />, color: "blue" },
    { id: "bellman", title: "Bellman-Ford SOS", desc: "Forcefully routes around unexpected hazards by introducing negative-weight edges.", icon: <ShieldAlert className="w-5 h-5 text-red-400" />, color: "red" },
    { id: "binpacking", title: "3D Bin Packing", desc: "Calculates optimal spatial arrangement inside the trailer to maximize cubic utilization.", icon: <PackageSearch className="w-5 h-5 text-emerald-400" />, color: "emerald" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-zinc-900/40 p-6 md:p-10 rounded-[2.5rem] border border-white/5">
      {/* Left: Tabs */}
      <div className="flex flex-col gap-4 lg:w-1/3">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className={`text-left p-6 rounded-2xl transition-all border ${activeTab === i ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${tab.color}-500/10`}>
                {tab.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{tab.title}</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{tab.desc}</p>
          </button>
        ))}
      </div>
      
      {/* Right: Diagram */}
      <div className="lg:w-2/3 bg-black/50 rounded-3xl border border-white/5 p-8 flex items-center justify-center relative overflow-hidden min-h-[350px]">
         {activeTab === 0 && <DijkstraDiagram />}
         {activeTab === 1 && <BellmanDiagram />}
         {activeTab === 2 && <BinPackingDiagram />}
      </div>
    </div>
  )
}

function DijkstraDiagram() {
  return (
    <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 1 }} viewBox="0 0 400 200" className="w-full h-full max-w-md">
      {/* Nodes and edges */}
      <line x1="50" y1="100" x2="150" y2="50" stroke="#333" strokeWidth="2" />
      <line x1="50" y1="100" x2="150" y2="150" stroke="#1e3a8a" strokeWidth="4" />
      <line x1="150" y1="150" x2="250" y2="100" stroke="#1e3a8a" strokeWidth="4" />
      <line x1="150" y1="50" x2="250" y2="100" stroke="#333" strokeWidth="2" />
      <line x1="250" y1="100" x2="350" y2="100" stroke="#1e3a8a" strokeWidth="4" />
      
      {/* Animated Path */}
      <motion.path 
        d="M 50 100 L 150 150 L 250 100 L 350 100"
        fill="none" stroke="#3b82f6" strokeWidth="4"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
      />
      
      {/* Nodes */}
      <circle cx="50" cy="100" r="10" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="150" cy="50" r="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="150" cy="150" r="10" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="250" cy="100" r="10" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="350" cy="100" r="12" fill="#3b82f6" />
      <text x="350" y="80" fill="#60a5fa" fontSize="12" textAnchor="middle" fontFamily="monospace">Optimal</text>
    </motion.svg>
  );
}

function BellmanDiagram() {
  return (
    <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 1 }} viewBox="0 0 400 200" className="w-full h-full max-w-md">
      <line x1="50" y1="100" x2="150" y2="50" stroke="#7f1d1d" strokeWidth="4" strokeDasharray="5 5" />
      <line x1="50" y1="100" x2="150" y2="150" stroke="#333" strokeWidth="2" />
      <line x1="150" y1="150" x2="250" y2="100" stroke="#7f1d1d" strokeWidth="4" strokeDasharray="5 5" />
      <line x1="150" y1="50" x2="250" y2="100" stroke="#333" strokeWidth="2" />
      
      {/* Roadblock */}
      <path d="M 140 140 L 160 160 M 160 140 L 140 160" stroke="#ef4444" strokeWidth="4" />
      
      {/* Animated Path */}
      <motion.path 
        d="M 50 100 L 150 50 L 250 100"
        fill="none" stroke="#ef4444" strokeWidth="4"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
      />
      
      <circle cx="50" cy="100" r="10" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />
      <circle cx="150" cy="50" r="10" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />
      <circle cx="150" cy="150" r="10" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="250" cy="100" r="12" fill="#ef4444" />
      <text x="250" y="80" fill="#f87171" fontSize="12" textAnchor="middle" fontFamily="monospace">Reroute</text>
    </motion.svg>
  );
}

function BinPackingDiagram() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative w-64 h-40 bg-zinc-800/30 border-2 border-zinc-700 rounded-lg overflow-hidden perspective-1000 p-2 flex flex-wrap gap-1 items-end justify-start">
      <div className="absolute top-2 left-2 text-[10px] text-emerald-400 font-mono">Vol: 88% / 100%</div>
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="w-12 h-12 bg-emerald-500 rounded border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900">PKG</motion.div>
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="w-16 h-12 bg-emerald-600 rounded border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900">PKG</motion.div>
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="w-24 h-16 bg-emerald-400 rounded border border-emerald-300 flex items-center justify-center text-[10px] font-bold text-emerald-900">HEAVY</motion.div>
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1, repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="w-14 h-16 bg-emerald-500 rounded border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900">PKG</motion.div>
      <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.4, repeat: Infinity, repeatDelay: 4, duration: 0.5 }} className="w-20 h-10 bg-emerald-600 rounded border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-900">PKG</motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Diagram Component
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowDiagram() {
  const steps = [
    { step: "01", title: "Plan Routes", desc: "Dijkstra computes optimal paths instantly.", icon: <MapPin className="w-6 h-6 text-blue-400"/> },
    { step: "02", title: "Live Tracking", desc: "SignalR streams live GPS data.", icon: <Globe className="w-6 h-6 text-emerald-400"/> },
    { step: "03", title: "SOS Alerts", desc: "Bellman-Ford handles emergencies.", icon: <ShieldAlert className="w-6 h-6 text-red-400"/> },
  ];

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start w-full max-w-4xl mx-auto py-10 gap-12 md:gap-0">
      {/* Connecting Line */}
      <div className="hidden md:block absolute top-[40px] left-20 right-20 h-0.5 bg-white/10 z-0" />
      
      {/* Animated progress line */}
      <motion.div 
        className="hidden md:block absolute top-[40px] left-20 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 z-0"
        initial={{ width: "0%" }}
        whileInView={{ width: "calc(100% - 160px)" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.8 }}
      />

      {steps.map((item, i) => (
        <div key={item.step} className="relative z-10 flex flex-col items-center text-center w-full md:w-64">
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: i * 0.4, type: 'spring' }}
            viewport={{ once: true }}
            className="w-20 h-20 rounded-full bg-zinc-950 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center mb-6 relative overflow-hidden group hover:border-white/40 transition-colors"
          >
             <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
             {item.icon}
          </motion.div>
          <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-2">PHASE {item.step}</div>
          <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
