import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import { Truck, CheckCircle2, AlertTriangle, Zap, MapPin, ShieldAlert, PackageSearch, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
    _threeLoaded?: boolean;
  }
}

// ── Cinematic 3D Scroll-Based Landing Page for TrAuck ──────────────────────
// Uses Three.js for WebGL background, GSAP + ScrollTrigger for scroll cinema,
// and layered parallax for depth illusion.

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cleanup = () => { };

    const load = async () => {
      // Dynamically load Three.js and GSAP from CDN
      await Promise.all([
        // @ts-ignore
        import("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js").catch(() => null),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js").then(() => ({ gsap: window.gsap })),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js").then(() => ({ ScrollTrigger: window.ScrollTrigger })),
      ]);

      if (!window.gsap || !window.ScrollTrigger) return;
      window.gsap.registerPlugin(window.ScrollTrigger);
      const ST = window.ScrollTrigger;

      // ── Three.js WebGL Scene ──────────────────────────────────────────────
      if (canvasRef.current && window.THREE) {
        const T = window.THREE;
        const renderer = new T.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 30);

        // Ambient + directional lighting
        scene.add(new T.AmbientLight(0x0a0a2e, 2));
        const dirLight = new T.DirectionalLight(0x3b82f6, 3);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);
        const blueLight = new T.PointLight(0x6366f1, 4, 60);
        blueLight.position.set(-10, 10, 10);
        scene.add(blueLight);
        const emeraldLight = new T.PointLight(0x10b981, 3, 60);
        emeraldLight.position.set(10, -10, 5);
        scene.add(emeraldLight);

        // Floating particles
        const pCount = 1800;
        const pGeo = new T.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const colors = new Float32Array(pCount * 3);
        const palette = [[0.23, 0.51, 0.96], [0.38, 0.4, 0.98], [0.06, 0.72, 0.51]];
        for (let i = 0; i < pCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 120;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
          const c = palette[Math.floor(Math.random() * 3)];
          colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
        }
        pGeo.setAttribute("position", new T.BufferAttribute(positions, 3));
        pGeo.setAttribute("color", new T.BufferAttribute(colors, 3));
        const pMat = new T.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
        const particles = new T.Points(pGeo, pMat);
        scene.add(particles);

        // Grid plane - receding into depth
        const gridHelper = new T.GridHelper(200, 40, 0x1e293b, 0x0f172a);
        gridHelper.position.y = -15;
        gridHelper.rotation.x = Math.PI * 0.02;
        scene.add(gridHelper);

        // Glowing route lines (Dijkstra path)
        const routePoints = [
          new T.Vector3(-20, -5, 0), new T.Vector3(-10, 0, -5),
          new T.Vector3(0, 3, -10), new T.Vector3(10, 0, -5), new T.Vector3(20, -2, 0)
        ];
        const routeCurve = new T.CatmullRomCurve3(routePoints);
        const routeGeo = new T.TubeGeometry(routeCurve, 100, 0.08, 8, false);
        const routeMat = new T.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6 });
        const routeMesh = new T.Mesh(routeGeo, routeMat);
        scene.add(routeMesh);

        // SOS route
        const sosPoints = [
          new T.Vector3(-20, -8, -5), new T.Vector3(-8, -5, -8),
          new T.Vector3(0, -3, -12), new T.Vector3(8, -5, -8), new T.Vector3(20, -6, -5)
        ];
        const sosCurve = new T.CatmullRomCurve3(sosPoints);
        const sosGeo = new T.TubeGeometry(sosCurve, 100, 0.06, 8, false);
        const sosMat = new T.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 });
        scene.add(new T.Mesh(sosGeo, sosMat));

        // Node spheres along route
        [-20, -10, 0, 10, 20].forEach((x, i) => {
          const geo = new T.SphereGeometry(0.4, 16, 16);
          const mat = new T.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 1.5, metalness: 0.8, roughness: 0.2 });
          const sphere = new T.Mesh(geo, mat);
          sphere.position.set(x, routePoints[i]?.y || 0, routePoints[i]?.z || 0);
          scene.add(sphere);
        });

        // Scroll-driven camera animation
        const cameraTarget = { x: 0, y: 0, z: 30, fov: 60 };
        ST.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          onUpdate: (self: any) => {
            const p = self.progress;
            cameraTarget.z = 30 - p * 20;
            cameraTarget.y = -p * 8;
            cameraTarget.x = Math.sin(p * Math.PI) * 5;
            camera.fov = 60 - p * 15;
            camera.updateProjectionMatrix();
          }
        });

        // Particle rotation on scroll
        ST.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
          onUpdate: (self: any) => {
            particles.rotation.y = self.progress * Math.PI * 0.5;
            particles.rotation.x = self.progress * 0.2;
          }
        });

        let raf: number;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          camera.position.x += (cameraTarget.x - camera.position.x) * 0.05;
          camera.position.y += (cameraTarget.y - camera.position.y) * 0.05;
          camera.position.z += (cameraTarget.z - camera.position.z) * 0.05;
          particles.rotation.z += 0.0002;
          renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      }

      // ── GSAP Scroll Animations ────────────────────────────────────────────
      const g2 = window.gsap;

      // Hero entrance
      g2.fromTo(".hero-title", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.15, delay: 0.5 });
      g2.fromTo(".hero-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.9 });
      g2.fromTo(".hero-ctas", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 1.1 });

      // Feature cards parallax
      const featureCards = g2.utils.toArray(".feature-card");
      if (featureCards.length > 0) {
        featureCards.forEach((el: any, i: number) => {
          g2.fromTo(el, { opacity: 0, y: 100, rotateX: 20 }, {
            opacity: 1, y: 0, rotateX: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true, delay: i * 0.1 }
          });
        });
      }
    };

    load();
    return () => cleanup();
  }, []);

  return (
    <div style={styles.root}>
      {/* WebGL Canvas Background */}
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Noise grain overlay */}
      <div style={styles.grain} />

      {/* Vignette */}
      <div style={styles.vignette} />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <TruckIcon size={18} />
            </div>
            <span style={styles.logoText}>TrAuck<span style={{ color: "#3b82f6" }}>.</span></span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#algorithms" style={styles.navLink}>Technology</a>
            <a href="#cta" style={styles.navLinkActive}>Get Started →</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-16 pt-32 pb-20 max-w-[1300px] mx-auto z-10 gap-10 lg:gap-10">
        {/* Parallax depth layers */}
        <div style={{ ...styles.depthLayer, zIndex: 1, transform: "translateZ(-40px) scale(1.4)" }}>
          <div style={styles.blurOrb1} />
          <div style={styles.blurOrb2} />
          <div style={styles.blurOrb3} />
        </div>
        <div style={{ ...styles.depthLayer, zIndex: 2, transform: "translateZ(-20px) scale(1.2)" }}>
          <GridLines />
        </div>

        <div className="flex-1 w-full max-w-[620px] relative z-10 text-center lg:text-left mt-10 lg:mt-0">
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-tighter leading-[1.05] mb-6">
            <span className="hero-title block leading-none text-white">Intelligent</span>
            <span className="hero-title block text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-500">Fleet Routing</span>
            <span className="hero-title block leading-[1.1] text-[clamp(1.8rem,6vw,5.5rem)] text-white">
              Without Hardware.
            </span>
          </h1>

          <p className="hero-sub text-[clamp(1rem,4vw,1.15rem)] text-zinc-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
            Dijkstra. Bellman-Ford. 3D Bin Packing. Pure algorithmic intelligence
            <br className="hidden md:block" />replacing expensive IoT sensors — one route at a time.
          </p>

          <div className="hero-ctas flex flex-wrap gap-4 justify-center lg:justify-start">
            <button className="px-7 py-3.5 rounded-2xl bg-white text-black text-sm font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 transition-transform">
              Access Dashboard →
            </button>
            <button className="px-7 py-3.5 rounded-2xl bg-transparent text-white text-sm font-semibold border border-white/10 hover:border-white/30 backdrop-blur-md transition-colors">
              Driver App Demo ↗
            </button>
          </div>
        </div>

        {/* Animated Dashboard Preview */}
        <section className="mt-8 lg:mt-0 relative z-10 w-full lg:w-[55%] transform scale-100 lg:scale-105 origin-center lg:origin-right" style={{ perspective: "2000px" }}>
          <DashboardPreview />
        </section>
      </section>



      {/* ── ALGORITHMS ─────────────────────────────────────────────────────── */}
      <section id="algorithms" className="px-6 md:px-12 max-w-7xl mx-auto mt-40 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Built on Advanced Mathematics</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">We replaced expensive hardware sensors with pure computational logic. Interactive diagrams below demonstrate our engine at work.</p>
        </motion.div>

        <AlgorithmVisualizer />
      </section>

      {/* How it Works Workflow */}
      <section id="technology" className="px-6 md:px-12 max-w-7xl mx-auto mt-40 overflow-hidden relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">How TrAuck Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Three steps to transform your fleet operations.</p>
        </motion.div>

        <WorkflowDiagram />
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 lg:px-16 py-20 lg:py-32 max-w-[1300px] mx-auto">
        <div>
          <h2 className="text-[clamp(2.5rem,6vw,3.5rem)] font-black tracking-tighter leading-[1.1] mb-12 lg:mb-20 text-center md:text-left">
            <span className="text-white block">Built for modern</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-500 block">logistics operations</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🗺️", title: "Smart Route Planning", desc: "Dijkstra computes the absolute shortest path with real-time traffic weights. Every millisecond counts.", accent: "#3b82f6" },
              { icon: "🚨", title: "Emergency Rerouting", desc: "Bellman-Ford activates instantly on SOS signal, applying heavy penalties to blocked roads to find escape routes.", accent: "#ef4444" },
              { icon: "📦", title: "3D Bin Packing", desc: "Optimal spatial arrangement inside trailers calculated algorithmically — 88%+ cubic utilization guaranteed.", accent: "#10b981" },
              { icon: "📡", title: "Real-time GPS Tracking", desc: "SignalR streams live telemetry from driver smartphones. No hardware dongles. No black boxes.", accent: "#6366f1" },
              { icon: "🔔", title: "Geofencing Alerts", desc: "Automatic delivery status triggers when GPS coordinates enter a predefined delivery radius.", accent: "#f59e0b" },
              { icon: "✍️", title: "Digital Proof of Delivery", desc: "Electronic signature capture directly on the driver's PWA. Instant confirmation sync to dispatch.", accent: "#ec4899" },
            ].map((f) => (
              <div key={f.title} className="feature-card bg-white/5 border border-white/10 rounded-[18px] p-7 transition-all duration-300 hover:-translate-y-2 cursor-default"
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = f.accent + "60"; }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <div className="text-[32px] mb-4">{f.icon}</div>
                <div className="w-8 h-0.5 rounded-full mb-3.5" style={{ background: f.accent }} />
                <h3 className="text-[17px] font-bold text-white mb-2">{f.title}</h3>
                <p className="text-[14px] text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto mt-40 relative z-10">
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

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/50 py-12 px-6 md:px-12 text-center relative z-10 mt-40">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Truck className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">TrAuck<span className="text-blue-500">.</span></span>
        </div>
        <p className="text-zinc-500 text-sm">© 2026 TrAuck Logistics Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ── Helper: load script ──────────────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// ── Three.js import via module (alternative) ─────────────────────────────────
// We fall back to window.THREE if module import fails (r128 doesn't export ES modules from CDN)
// so we also inject it as a classic script:
if (typeof window !== "undefined" && !window._threeLoaded) {
  window._threeLoaded = true;
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  document.head.appendChild(s);
}

// ── Small Components ─────────────────────────────────────────────────────────
function TruckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}



function GridLines() {
  return (
    <svg viewBox="0 0 800 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <line key={`v${i}`} x1={i * 42} y1="0" x2={i * 42} y2="400" stroke="white" strokeWidth="1" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 34} x2="800" y2={i * 34} stroke="white" strokeWidth="1" />
      ))}
    </svg>
  );
}

const DIJKSTRA_ROUTE: [number, number][] = [
  [33.575, -7.600],
  [33.582, -7.605],
  [33.588, -7.612],
  [33.595, -7.608],
  [33.605, -7.615],
];

const BELLMAN_ROUTE: [number, number][] = [
  [33.575, -7.600],
  [33.570, -7.610],
  [33.580, -7.625],
  [33.595, -7.620],
  [33.605, -7.615],
];

const DESTINATION_PINS = [
  { pos: [33.605, -7.615] as [number, number], label: "Port of Casablanca" }
];

function useAnimatedCounter(end: number, duration: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

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
            center={[33.590, -7.612]}
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const tabs = [
    { id: "dijkstra", title: "Dijkstra Routing", desc: "Calculates the absolute shortest path factoring in distance and historical speed data.", icon: <MapPin className="w-5 h-5 text-blue-400" />, color: "blue" },
    { id: "bellman", title: "Bellman-Ford SOS", desc: "Forcefully routes around unexpected hazards by introducing negative-weight edges.", icon: <ShieldAlert className="w-5 h-5 text-red-400" />, color: "red" },
    { id: "binpacking", title: "3D Bin Packing", desc: "Calculates optimal spatial arrangement inside the trailer to maximize cubic utilization.", icon: <PackageSearch className="w-5 h-5 text-emerald-400" />, color: "emerald" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-zinc-900/40 p-6 md:p-10 rounded-[2.5rem] border border-white/5 relative z-10">
      {/* Left: Tabs */}
      <div className="flex flex-col gap-4 lg:w-1/3">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(i)}
            className={`text-left p-6 rounded-2xl transition-all border relative overflow-hidden ${activeTab === i ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
          >
            {activeTab === i && (
              <motion.div
                className={`absolute bottom-0 left-0 h-1 bg-${tab.color}-500 rounded-b-2xl`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
              />
            )}
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className={`p-2 rounded-lg bg-${tab.color}-500/10`}>
                {tab.icon}
              </div>
              <h3 className="text-xl font-bold text-white">{tab.title}</h3>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* Right: Diagram */}
      <div className="lg:w-2/3 bg-black/50 rounded-3xl border border-white/5 p-8 flex items-center justify-center relative overflow-hidden min-h-[350px]">
        <AnimatePresence mode="wait">
          {activeTab === 0 && <DijkstraDiagram key="dijkstra" />}
          {activeTab === 1 && <BellmanDiagram key="bellman" />}
          {activeTab === 2 && <BinPackingDiagram key="binpacking" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DijkstraDiagram() {
  return (
    <motion.svg key="dijkstra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} viewBox="0 0 400 200" className="w-full h-full max-w-md">
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#333" />
      </pattern>
      <rect width="400" height="200" fill="url(#grid)" />

      <line x1="50" y1="100" x2="150" y2="50" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="150" y1="50" x2="250" y2="100" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />

      <line x1="50" y1="100" x2="150" y2="150" stroke="#1e3a8a" strokeWidth="4" />
      <line x1="150" y1="150" x2="250" y2="100" stroke="#1e3a8a" strokeWidth="4" />
      <line x1="250" y1="100" x2="350" y2="100" stroke="#1e3a8a" strokeWidth="4" />

      <motion.path
        d="M 50 100 L 150 50 L 250 100"
        fill="none" stroke="#4b5563" strokeWidth="2"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <motion.path
        d="M 50 100 L 150 150 L 250 100 L 350 100"
        fill="none" stroke="#3b82f6" strokeWidth="4"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
      />

      <motion.path
        d="M 50 100 L 150 150 L 250 100 L 350 100"
        fill="none" stroke="#60a5fa" strokeWidth="8"
        strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: [0, 0.5, 0], pathLength: 1 }}
        transition={{ duration: 2, delay: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
        style={{ filter: "blur(4px)" }}
      />

      <circle cx="50" cy="100" r="8" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="150" cy="50" r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="150" cy="150" r="8" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="250" cy="100" r="8" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="350" cy="100" r="10" fill="#3b82f6" />

      <motion.circle cx="350" cy="100" r="16" fill="none" stroke="#3b82f6" strokeWidth="2"
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 3 }}
      />
      <text x="350" y="70" fill="#60a5fa" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">OPTIMAL</text>
    </motion.svg>
  );
}

function BellmanDiagram() {
  return (
    <motion.svg key="bellman" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} viewBox="0 0 400 200" className="w-full h-full max-w-md">
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#333" />
      </pattern>
      <rect width="400" height="200" fill="url(#grid)" />

      <line x1="50" y1="100" x2="150" y2="150" stroke="#333" strokeWidth="4" />
      <line x1="150" y1="150" x2="250" y2="100" stroke="#7f1d1d" strokeWidth="4" strokeDasharray="5 5" />

      <line x1="50" y1="100" x2="150" y2="50" stroke="#333" strokeWidth="2" />
      <line x1="150" y1="50" x2="250" y2="100" stroke="#333" strokeWidth="2" />

      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
      >
        <circle cx="200" cy="125" r="15" fill="#ef4444" />
        <path d="M 195 120 L 205 130 M 205 120 L 195 130" stroke="#fff" strokeWidth="3" strokeLinecap="round" />

        <motion.circle cx="200" cy="125" r="30" fill="none" stroke="#ef4444" strokeWidth="2"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
      </motion.g>

      <motion.path
        d="M 50 100 L 150 50 L 250 100"
        fill="none" stroke="#f87171" strokeWidth="4"
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
      />

      <motion.path
        d="M 50 100 L 150 50 L 250 100"
        fill="none" stroke="#f87171" strokeWidth="8" strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: [0, 0.5, 0], pathLength: 1 }}
        transition={{ duration: 1.5, delay: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
        style={{ filter: "blur(4px)" }}
      />

      <circle cx="50" cy="100" r="8" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="150" cy="50" r="8" fill="#1f2937" stroke="#f87171" strokeWidth="2" />
      <circle cx="150" cy="150" r="8" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="250" cy="100" r="10" fill="#ef4444" />
      <text x="250" y="70" fill="#fca5a5" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">REROUTE</text>
    </motion.svg>
  );
}

function BinPackingDiagram() {
  const boxes = [
    { id: 1, w: 60, h: 40, c: "#10b981", l: "HEAVY", delay: 0.5 },
    { id: 2, w: 40, h: 40, c: "#059669", l: "PKG", delay: 1.0 },
    { id: 3, w: 50, h: 30, c: "#34d399", l: "FRAG", delay: 1.5 },
    { id: 4, w: 50, h: 30, c: "#10b981", l: "PKG", delay: 2.0 },
    { id: 5, w: 100, h: 30, c: "#059669", l: "WIDE", delay: 2.5 },
  ];

  return (
    <motion.div key="binpacking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-[280px] h-[160px] bg-zinc-900 border-2 border-zinc-700 rounded-lg overflow-hidden perspective-1000 p-2 flex flex-col justify-end">
      <div className="absolute inset-0 border-[4px] border-white/5 pointer-events-none rounded-lg" style={{ transform: "translateZ(-20px)" }} />

      <div className="absolute top-3 left-3 text-xs text-emerald-400 font-mono flex items-center gap-2">
        <PackageSearch size={14} /> <span>Vol: 94% / 100%</span>
      </div>

      <div className="flex flex-wrap items-end gap-1 w-full justify-center pb-2 relative z-10">
        {boxes.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: -200, opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: b.delay }}
            style={{ width: b.w, height: b.h, backgroundColor: b.c }}
            className="rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-white/20 flex items-center justify-center text-[10px] font-bold text-emerald-950"
          >
            {b.l}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow Diagram Component
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowDiagram() {
  const steps = [
    { step: "01", title: "Plan Routes", desc: "Dijkstra computes optimal paths instantly.", icon: <MapPin className="w-8 h-8 text-blue-400" /> },
    { step: "02", title: "Live Tracking", desc: "SignalR streams live GPS data.", icon: <Globe className="w-8 h-8 text-emerald-400" /> },
    { step: "03", title: "SOS Alerts", desc: "Bellman-Ford handles emergencies.", icon: <ShieldAlert className="w-8 h-8 text-red-400" /> },
  ];

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-start w-full max-w-6xl mx-auto py-16 gap-16 md:gap-0 mt-8">
      {/* Connecting Line */}
      <div className="hidden md:block absolute top-[56px] left-40 right-40 h-1 bg-white/10 z-0" />

      {/* Animated progress line */}
      <motion.div
        className="hidden md:block absolute top-[56px] left-40 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 z-0"
        initial={{ width: "0%" }}
        whileInView={{ width: "calc(100% - 320px)" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true, amount: 0.8 }}
      />

      {steps.map((item, i) => (
        <div key={item.step} className="relative z-10 flex flex-col items-center text-center w-full md:w-80">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: i * 0.4, type: 'spring' }}
            viewport={{ once: true }}
            className="w-28 h-28 rounded-full bg-zinc-950 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center mb-8 relative overflow-hidden group hover:border-white/40 transition-colors"
          >
            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
            {item.icon}
          </motion.div>
          <div className="text-xs font-mono tracking-widest text-zinc-500 mb-3">PHASE {item.step}</div>
          <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
          <p className="text-zinc-400 text-base leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  root: { background: "#000008", minHeight: "100vh", fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif", color: "white", overflowX: "hidden", position: "relative" },
  canvas: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none" },
  grain: { position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.5 },
  vignette: { position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,8,0.7) 100%)" },
  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,8,0.6)" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: "white" },
  navLinks: { display: "flex", gap: 28, alignItems: "center" },
  navLink: { fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" },
  navLinkActive: { fontSize: 13, color: "white", textDecoration: "none", fontWeight: 600, background: "linear-gradient(135deg,#3b82f6,#6366f1)", padding: "8px 18px", borderRadius: 99, boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
  hero: { position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "120px 64px 80px", maxWidth: 1300, margin: "0 auto", zIndex: 10, gap: 40 },
  heroContent: { flex: 1, maxWidth: 620, position: "relative", zIndex: 3 },
  depthLayer: { position: "absolute", inset: 0, transformStyle: "preserve-3d" },
  blurOrb1: { position: "absolute", top: "10%", left: "-10%", width: "50%", height: "50%", borderRadius: "50%", background: "rgba(59,130,246,0.12)", filter: "blur(100px)", pointerEvents: "none" },
  blurOrb2: { position: "absolute", top: "30%", right: "-5%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(99,102,241,0.1)", filter: "blur(100px)", pointerEvents: "none" },
  blurOrb3: { position: "absolute", bottom: "10%", left: "20%", width: "35%", height: "35%", borderRadius: "50%", background: "rgba(16,185,129,0.07)", filter: "blur(80px)", pointerEvents: "none" },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", fontSize: 11, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 28 },
  badgeDot: { width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", display: "inline-block" },
  heroH1: { fontSize: "clamp(3rem, 6.5vw, 6rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 },
  heroGradientText: { background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #10b981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: "clamp(1rem, 1.5vw, 1.15rem)", color: "#6b7280", lineHeight: 1.7, marginBottom: 36 },
  heroCtas: { display: "flex", gap: 14, flexWrap: "wrap" },
  btnPrimary: { padding: "14px 28px", borderRadius: 14, background: "white", color: "black", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 0 40px rgba(255,255,255,0.15)" },
  btnSecondary: { padding: "14px 28px", borderRadius: 14, background: "transparent", color: "white", fontSize: 14, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "border-color 0.2s", backdropFilter: "blur(10px)" },
  scrollHint: { marginTop: 48, display: "flex", alignItems: "center", gap: 12, color: "#374151", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" },
  scrollLine: { width: 1, height: 40, background: "linear-gradient(to bottom, transparent, #374151)", display: "inline-block" },
  floatingDash: { flex: "0 0 380px", background: "rgba(9,9,18,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20, boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)", position: "relative", zIndex: 3 },
  fdHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" },
  fdStats: { display: "flex", gap: 0, marginBottom: 14 },
  fdStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0", borderRight: "1px solid rgba(255,255,255,0.05)" },
  fdLegend: { marginTop: 10, display: "flex", justifyContent: "flex-end" },
  statsSection: { position: "relative", zIndex: 10, padding: "80px 32px", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,8,0.5)", backdropFilter: "blur(10px)" },
  sectionInner: { maxWidth: 1200, margin: "0 auto" },
  statCard: { flex: 1, textAlign: "center", padding: "20px 16px" },
  statVal: { fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", fontFamily: "monospace" },
  statLabel: { fontSize: 13, color: "#4b5563", marginTop: 4, fontWeight: 500 },
  featuresSection: { position: "relative", zIndex: 10, padding: "120px 64px" },
  sectionTitle: { fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 60 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 },
  featureCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 28, transition: "transform 0.3s, border-color 0.3s", cursor: "default" },
  featureAccentLine: { width: 32, height: 2, borderRadius: 99, marginBottom: 14 },
  featureTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8, color: "white" },
  featureDesc: { fontSize: 14, color: "#4b5563", lineHeight: 1.7 },
  algoSection: { position: "relative", zIndex: 10, padding: "120px 64px", background: "rgba(0,0,8,0.4)" },
  algoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginTop: 20 },
  algoCard: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" },
  algoBadge: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", border: "1px solid", borderRadius: 4, padding: "3px 8px", display: "inline-block", marginBottom: 8 },
  algoName: { fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em" },
  algoVisualBox: { background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 8, border: "1px solid rgba(255,255,255,0.05)" },
  algoDesc: { fontSize: 13, color: "#4b5563", lineHeight: 1.7, marginBottom: 16 },
  algoTags: { display: "flex", gap: 8, flexWrap: "wrap" },
  algoTag: { fontSize: 11, border: "1px solid", borderRadius: 99, padding: "4px 12px", fontWeight: 600 },
  techSection: { position: "relative", zIndex: 10, padding: "100px 64px" },
  techStack: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 40 },
  techPill: { padding: "10px 20px", borderRadius: 99, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "#9ca3af", fontWeight: 500, cursor: "default", transition: "border-color 0.2s" },
  ctaSection: { position: "relative", zIndex: 10, padding: "100px 64px" },
  ctaBox: { maxWidth: 800, margin: "0 auto", background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08), rgba(16,185,129,0.06))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 32, padding: "72px 64px", textAlign: "center", position: "relative", overflow: "hidden" },
  ctaOrb1: { position: "absolute", top: "-30%", right: "-10%", width: "40%", height: "80%", borderRadius: "50%", background: "rgba(59,130,246,0.15)", filter: "blur(60px)", pointerEvents: "none" },
  ctaOrb2: { position: "absolute", bottom: "-30%", left: "-10%", width: "40%", height: "80%", borderRadius: "50%", background: "rgba(16,185,129,0.1)", filter: "blur(60px)", pointerEvents: "none" },
  ctaTitle: { fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16, position: "relative", zIndex: 1 },
  ctaSub: { fontSize: 16, color: "#4b5563", marginBottom: 36, position: "relative", zIndex: 1 },
  ctaBtn: { padding: "16px 36px", borderRadius: 16, background: "white", color: "black", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(255,255,255,0.2)", position: "relative", zIndex: 1, transition: "transform 0.2s" },
  footer: { borderTop: "1px solid rgba(255,255,255,0.04)", padding: "32px 64px", position: "relative", zIndex: 10 },
  footerInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
};

