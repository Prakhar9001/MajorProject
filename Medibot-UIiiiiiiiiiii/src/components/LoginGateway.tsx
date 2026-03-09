/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, 
  User, 
  Lock, 
  Mail, 
  Fingerprint, 
  Activity, 
  ShieldCheck, 
  BrainCircuit, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Role = 'patient' | 'doctor';

interface LoginGatewayProps {
  onLogin: (role: Role, email: string) => void;
}

export default function LoginGateway({ onLogin }: LoginGatewayProps) {
  const [role, setRole] = useState<Role>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(role, email);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-sky-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg shadow-sky-200 mb-4">
            <Stethoscope className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Medi<span className="text-sky-500">BOT</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            AI-Powered Intelligent Healthcare Ecosystem
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="flex p-1 bg-slate-100/50 m-6 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setRole('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'patient' ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={18} /> Patient
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'doctor' ? 'bg-white text-sky-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope size={18} /> Doctor
            </button>
          </div>

          <div className="px-8 pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="mb-6"
              >
                <p className="text-slate-600 text-sm leading-relaxed">
                  {role === 'patient' 
                    ? 'Access your medical history, wearable trends, and AI diagnostics.' 
                    : 'Review clinical cases, analyze X-rays, and manage prescriptions.'}
                </p>
              </motion.div>
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="name@hospital.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin h-5 w-5" /><span>Verifying MediBOT Credentials...</span></>
                ) : (
                  <><span className="mr-1">Sign In to Dashboard</span><ChevronRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-xs font-medium mb-4">Or continue with Biometrics</p>
              <button className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50 transition-all">
                <Fingerprint size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
            <BrainCircuit size={14} className="text-emerald-500" /><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">LLaMA2-7B: Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
            <Activity size={14} className="text-sky-500" /><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">ResNet50: Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
            <ShieldCheck size={14} className="text-indigo-500" /><span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Secure Encryption: Enabled</span>
          </div>
        </div>
      </motion.div>
      <footer className="mt-auto py-6 text-slate-400 text-xs font-medium">&copy; 2026 MediBOT Healthcare Systems. All Rights Reserved.</footer>
    </div>
  );
}
