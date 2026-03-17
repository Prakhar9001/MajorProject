import React, { useState } from 'react';
import {
  Stethoscope,
  User,
  Lock,
  Mail,
  Activity,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type Role = 'patient' | 'doctor';

interface LoginGatewayProps {
  onLogin: (role: Role, email: string) => void;
}

export default function LoginGateway({ onLogin }: LoginGatewayProps) {
  const [role, setRole] = useState<Role>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
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

    try {
      if (isSignUp) {
        // Handle Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store role in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });

        onLogin(role, email);
      } else {
        // Handle Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          onLogin(userData.role as Role, email);
        } else {
          // Fallback to selected role if doc doesn't exist
          onLogin(role, email);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already has a role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        onLogin(userData.role as Role, user.email || '');
      } else {
        // New Google user, save selected role
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
        onLogin(role, user.email || '');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-sky-500/30">

      {/* Left Column - Form */}
      <div className="w-full md:w-2/5 flex flex-col p-8 md:p-12 lg:p-16 relative z-10 border-r border-white/5 bg-[#121318]">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-sky-500/10 ring-1 ring-sky-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Stethoscope className="text-sky-400 w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Medi<span className="text-sky-400">BOT</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col justify-center max-w-[320px] w-full mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isSignUp ? 'Create Your Account.' : 'Intelligent Healthcare Ecosystem.'}
          </h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            {isSignUp 
              ? 'Join the future of AI-driven medical assistance today.' 
              : 'Build competence, career, and network in the future of medical AI.'}
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border-b border-white/10 bg-transparent pb-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                placeholder="your.email@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full border-b border-white/10 bg-transparent pb-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all text-sm"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <span>{isSignUp ? 'Create Account' : 'Login'}</span>}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <span className="bg-[#121318] px-4">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl border border-white/10 transition-all text-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
            </div>
          </form>

          <div className="mt-8 text-xs text-slate-400 flex items-center gap-1">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sky-400 font-bold hover:text-sky-300 ml-1"
            >
              {isSignUp ? 'Login' : 'Sign up'}
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-bold">Select Dashboard Role</p>
            <div className="flex p-1 bg-[#1A1C23] rounded-xl border border-white/5">
              <button
                onClick={() => setRole('patient')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${role === 'patient' ? 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
              >
                <User size={16} /> Patient
              </button>
              <button
                onClick={() => setRole('doctor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${role === 'doctor' ? 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
              >
                <Stethoscope size={16} /> Doctor
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Visual/Graphic */}
      <div className="hidden md:flex flex-col flex-1 bg-[#0F1015] relative overflow-hidden">
        {/* Top Nav matching the design */}
        <div className="absolute top-0 right-0 left-0 px-12 py-8 flex justify-end gap-10 items-center z-20 text-sm font-semibold text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Forsiden</a>
          <a href="#" className="hover:text-white transition-colors">Om NHP</a>
          <a href="#" className="hover:text-white transition-colors">Ny bruker</a>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Abstract Dark Medical Illustration Area */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          {/* Abstract background blobs for dark mode vibe */}
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-2xl relative"
          >
            {/* Soft curved background shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1C23] to-[#121318] rounded-[60px] transform -rotate-2 scale-105 border border-white/5 shadow-2xl shadow-black/50" />

            <div className="relative glass-card border-white/10 rounded-[40px] p-12 overflow-hidden flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-48 h-48 rounded-full border border-sky-500/30 flex items-center justify-center relative mb-8 backdrop-blur-3xl">
                <div className="absolute inset-0 bg-sky-500/5 rounded-full animate-pulse" />
                <BrainCircuit className="w-20 h-20 text-sky-400" />
                <div className="absolute -top-4 -right-4 w-14 h-14 glass-card rounded-full flex items-center justify-center border-white/10 shadow-xl">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="absolute -bottom-2 -left-4 w-12 h-12 glass-card rounded-full flex items-center justify-center border-white/10 shadow-xl">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">AI Clinical Intelligence</h3>
              <p className="text-center text-slate-400 max-w-sm text-sm leading-relaxed">
                Experience seamless integration between clinical context, real-time vitals, and predictive diagnostics.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Banner as seen in the image - adapted for dark mode */}
        <div className="absolute bottom-10 left-0 right-0 px-12 flex justify-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-full px-8 py-3 flex items-center gap-6 border-white/10 max-w-2xl w-full shadow-2xl"
          >
            <span className="text-slate-400 text-sm font-semibold whitespace-nowrap">Want to Get Started.</span>
            <div className="flex-1 flex items-center gap-2 bg-[#121318]/50 rounded-full pl-4 pr-1 py-1 border border-white/5 focus-within:border-sky-500/30 transition-colors">
              <input type="email" placeholder="Your email" className="bg-transparent border-none outline-none text-sm text-white w-full py-1.5" />
              <button className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold py-2 px-6 rounded-full transition-colors whitespace-nowrap">
                Send
              </button>
            </div>
            <a href="#" className="hidden sm:block text-sky-400 text-xs font-bold hover:text-sky-300">Join us.</a>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
