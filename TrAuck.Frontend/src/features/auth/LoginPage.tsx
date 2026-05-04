import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const [role, setRole] = useState<'dispatcher' | 'driver'>('dispatcher');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'dispatcher') {
      navigate('/admin');
    } else {
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-hidden dark">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <Link to="/" className="absolute top-8 left-8 z-50 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <Truck className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome to TrAuck</h2>
          <p className="text-sm text-center text-zinc-400 mb-8">Sign in to access your dashboard</p>

          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8 relative">
            <div className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm transition-transform duration-300 ease-in-out" 
                 style={{ transform: `translateX(${role === 'dispatcher' ? '4px' : 'calc(100% + 4px)'})` }} />
            <button 
              onClick={() => setRole('dispatcher')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${role === 'dispatcher' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <UserCircle2 className="w-4 h-4" /> Dispatcher
            </button>
            <button 
              onClick={() => setRole('driver')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${role === 'driver' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Truck className="w-4 h-4" /> Driver
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email address</label>
              <input 
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300">Forgot password?</a>
              </div>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Button type="submit" className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                  Sign In as {role === 'dispatcher' ? 'Admin' : 'Driver'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
          
          <p className="text-center text-sm text-zinc-500 mt-8">
            Don't have an account? <a href="#" className="text-blue-400 hover:text-blue-300">Request access</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
