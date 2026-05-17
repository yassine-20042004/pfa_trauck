import { Button } from "@/components/ui/button";
import { Navigation, MapPin, AlertTriangle, ShieldAlert } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

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

export function TripPage() {
  const [isEmergency, setIsEmergency] = useState(false);
  
  // Swipe to SOS logic
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [0, 200],
    ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 1)"]
  );

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x > 150) {
      setIsEmergency(true);
      // Trigger Bellman-Ford recalculation logic here
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Map Area */}
      <div className="relative flex-1 bg-zinc-900 overflow-hidden z-0 mask-image-bottom">
         <MapContainer 
            center={[33.5831, -7.6098]} 
            zoom={14} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#09090b' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={[33.5831, -7.6098]} icon={currentLocIcon}>
              <Popup className="dark-popup">You are here</Popup>
            </Marker>

            <Marker position={[33.5950, -7.6200]} icon={destinationIcon}>
              <Popup className="dark-popup">Warehouse B</Popup>
            </Marker>

            <Polyline 
              positions={[
                [33.5831, -7.6098],
                [33.5850, -7.6150],
                [33.5900, -7.6180],
                [33.5950, -7.6200]
              ]} 
              color={isEmergency ? "#ef4444" : "#3b82f6"} 
              weight={6} 
              dashArray={isEmergency ? "15, 15" : ""}
              className={isEmergency ? "animate-pulse" : ""}
            />
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
                 <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase">Next Stop</p>
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 flex items-center gap-2">
                Warehouse B
              </h2>
              <p className="text-zinc-500 mt-1 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Casablanca Industrial Zone
              </p>
            </div>
            <div className="text-right bg-gradient-to-br from-blue-500/20 to-blue-600/5 px-5 py-3 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <p className="text-3xl font-black text-blue-400 tracking-tight">14<span className="text-base text-blue-400/70 ml-1 font-medium">min</span></p>
              <p className="text-sm font-bold text-zinc-400 mt-0.5 tracking-wider">12.5 km</p>
            </div>
          </div>
          
          <Button className="w-full h-16 text-lg font-bold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]">
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
