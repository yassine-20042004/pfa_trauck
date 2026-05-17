import { Outlet, Link, useLocation } from "react-router-dom";
import { ListTodo, AlertTriangle, User, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function DriverLayout() {
  const location = useLocation();

  const navItems = [
    { name: "Live Route", href: "/driver", icon: Navigation2 },
    { name: "My Tasks", href: "/driver/tasks", icon: ListTodo },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-20 bg-zinc-950/40 backdrop-blur-3xl flex items-center justify-between px-6 shrink-0 border-b border-white/10 z-20 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center border border-white/10">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-white leading-tight tracking-wide">Yassine J.</h1>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wider">TRK-924 • VOLVO</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 relative z-10">
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
             <span className="flex h-1.5 w-1.5 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online</span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-4 left-4 right-4 h-20 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-around z-50 px-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 group"
            >
              {isActive && (
                <motion.div 
                  layoutId="driver-nav-active"
                  className="absolute inset-2 bg-white/5 rounded-2xl -z-10"
                />
              )}
              <item.icon className={cn("h-6 w-6 transition-all duration-300", isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span className={cn("text-[10px] font-bold transition-colors uppercase tracking-widest", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400")}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* SOS Action Button */}
        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 group relative">
          <div className="absolute inset-2 bg-red-500/10 rounded-2xl border border-red-500/20 group-active:bg-red-500/30 transition-all -z-10" />
          <div className="relative">
             <div className="absolute inset-0 bg-red-500 rounded-full blur-[10px] opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
             <AlertTriangle className="h-6 w-6 text-red-500 relative z-10" />
          </div>
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">SOS</span>
        </button>
      </nav>
    </div>
  );
}
