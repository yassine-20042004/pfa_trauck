import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Truck, PackageSearch, Bell, Settings, Clock, Users, Route as RouteIcon, AlertTriangle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function AdminLayout() {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Fleet", href: "/admin/fleet", icon: Truck },
    { name: "Drivers", href: "/admin/drivers", icon: Users },
    { name: "Vehicles", href: "/admin/vehicles", icon: Truck },
    { name: "Trips", href: "/admin/trips", icon: RouteIcon },
    { name: "Load Planning", href: "/admin/loads", icon: PackageSearch },
    { name: "Incidents", href: "/admin/incidents", icon: AlertTriangle },
  ];

  const mockNotifications = [
    { id: 1, title: "TRK-005 Rerouted", time: "2 min ago", type: "alert" },
    { id: 2, title: "Delivery Complete", time: "15 min ago", type: "success" },
    { id: 3, title: "System Update", time: "1 hour ago", type: "info" },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center px-8 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">TrAuck<span className="text-blue-500">.</span></h1>
        </div>
      </div>
      
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className="relative block"
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors z-10",
                isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}>
                <item.icon className={cn("h-4 w-4", isActive && "text-blue-400")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 shrink-0">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] bg-black text-white selection:bg-primary selection:text-primary-foreground font-sans dark overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 border-r border-white/10 bg-zinc-950/50 backdrop-blur-xl hidden md:flex flex-col z-20 relative shrink-0"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 border-r border-white/10 bg-zinc-950/90 backdrop-blur-xl flex flex-col z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-white/10 bg-zinc-950/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8 relative z-30 shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white hover:bg-white/10 -ml-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg md:text-2xl font-semibold tracking-tight text-white truncate"
            >
              {navItems.find((i) => i.href === location.pathname)?.name || "Dashboard"}
            </motion.h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-zinc-400 font-mono px-4 py-1.5 bg-black/50 border border-white/10 rounded-full">
              <Clock className="w-4 h-4 text-blue-400" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative hover:bg-white/10 text-zinc-400 hover:text-white rounded-full h-9 w-9 md:h-10 md:w-10"
              >
                <Bell className="h-5 w-5 md:h-5 md:w-5" />
                <span className="absolute top-2 right-2 md:right-2.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 md:w-80 bg-zinc-950 border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
                        <span className="font-semibold text-white">Notifications</span>
                        <span className="text-xs text-blue-400 cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-[300px] overflow-auto">
                        {mockNotifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'alert' ? 'bg-red-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className="text-sm text-zinc-200">{notif.title}</p>
                              <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center bg-black/40 text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors">
                        View all Activity
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-white/20 bg-gradient-to-tr from-zinc-800 to-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              <span className="text-xs md:text-sm font-bold text-zinc-300">AD</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
