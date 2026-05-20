import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, UserCircle2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function RegisterPage() {
  const [role, setRole] = useState<'dispatcher' | 'driver'>('dispatcher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyOrReason: '',
    licenseNumber: '',
    yearsOfExperience: '',
    preferredVehicle: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5198/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: role === 'dispatcher' ? 'Admin' : 'Driver'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || "Failed to submit request");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 relative overflow-hidden dark">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-900/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <Link to="/login" className="absolute top-8 left-8 z-50 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
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
              {isSuccess ? <CheckCircle2 className="h-6 w-6 text-white" /> : <Truck className="h-6 w-6 text-white" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {isSuccess ? 'Request Sent' : 'Request Access'}
          </h2>
          <p className="text-sm text-center text-zinc-400 mb-8">
            {isSuccess ? "We'll review your request and get back to you shortly." : 'Fill out the details below to request an account'}
          </p>

          {isSuccess ? (
            <div className="flex justify-center">
               <Link to="/login">
                 <Button className="py-6 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                   Return to Login
                 </Button>
               </Link>
            </div>
          ) : (
            <>
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8 relative">
                <div className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-lg shadow-sm transition-transform duration-300 ease-in-out" 
                     style={{ transform: `translateX(${role === 'dispatcher' ? '4px' : 'calc(100% + 4px)'})` }} />
                <button 
                  type="button"
                  onClick={() => setRole('dispatcher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${role === 'dispatcher' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <UserCircle2 className="w-4 h-4" /> Dispatcher
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${role === 'driver' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Truck className="w-4 h-4" /> Driver
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Company or Reason for Access</label>
                  <input 
                    type="text" 
                    name="companyOrReason"
                    value={formData.companyOrReason}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder={role === 'driver' ? "Reason for joining" : "Company name or reason"}
                    required
                  />
                </div>

                <AnimatePresence>
                  {role === 'driver' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Driver License Number</label>
                        <input 
                          type="text" 
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          placeholder="ABC1234567"
                          required={role === 'driver'}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Years of Experience</label>
                          <input 
                            type="number" 
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            min="0"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            placeholder="5"
                            required={role === 'driver'}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Preferred Vehicle</label>
                          <select 
                            name="preferredVehicle"
                            value={formData.preferredVehicle}
                            onChange={(e: any) => handleChange(e)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                            required={role === 'driver'}
                          >
                            <option value="" disabled>Select vehicle</option>
                            <option value="Van">Cargo Van</option>
                            <option value="SemiTruck">Semi-Truck</option>
                            <option value="Flatbed">Flatbed</option>
                            <option value="Refrigerated">Refrigerated</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait">
                  {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                  
                  <motion.div
                    key="submit-btn"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="pt-2"
                  >
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
