/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { saveChatMessage, getChatHistory } from '../lib/db';
import {
  Stethoscope,
  User,
  Activity,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  LayoutDashboard,
  History,
  Microscope,
  Pill,
  MessageSquare,
  LogOut,
  Heart,
  Footprints,
  Watch,
  Upload,
  AlertTriangle,
  QrCode,
  Send,
  AlertCircle,
  Paperclip,
  Mic,
  PhoneCall,
  Search,
  Plus,
  ChevronRight,
  Bot,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'overview' | 'timeline' | 'lab' | 'prescriptions' | 'chat';

// --- Sub-components ---

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }: {
  activeTab: Tab,
  setActiveTab: (t: Tab) => void,
  onLogout: () => void,
  isOpen: boolean,
  setIsOpen: (b: boolean) => void
}) => {
  const menuItems = [
    { id: 'overview', label: 'Health Overview', icon: LayoutDashboard },
    { id: 'timeline', label: 'Medical Timeline', icon: History },
    { id: 'lab', label: 'AI Diagnostic Lab', icon: Microscope },
    { id: 'prescriptions', label: 'Prescription Manager', icon: Pill },
    { id: 'chat', label: 'MediBOT AI Chat', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed md:sticky top-0 left-0 z-50
        w-64 glass-card border-r border-white/5 flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Medi<span className="text-sky-500">BOT</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id
                ? 'bg-sky-500/10 ring-1 ring-sky-500/20 text-sky-400 shadow-2xl shadow-black/20 ring-1 ring-sky-100'
                : 'text-slate-400 hover:bg-[#0F1015] hover:text-slate-300'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 ring-1 ring-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

const Header = ({ patientName, onMenuClick }: { patientName: string, onMenuClick: () => void }) => (
  <header className="h-20 glass-card border-b backdrop-blur-md sticky top-0 z-20 border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
    <div className="flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-400 hover:bg-[#0F1015] rounded-lg"
      >
        <Menu size={24} />
      </button>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-none">
          Hi, <span className="text-sky-400">{patientName.split(' ')[0]}</span>
        </h2>
        <p className="hidden md:block text-xs text-slate-400 font-medium mt-0.5">Patient ID: #MB-99281-X</p>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-full border border-emerald-500/20">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[8px] md:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Secured</span>
      </div>
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#121318] border border-white/5 flex items-center justify-center overflow-hidden">
        <User size={18} className="text-slate-400" />
      </div>
    </div>
  </header>
);

const HealthOverview = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-white">Live Vitals</h3>
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-full border border-emerald-500/20">
        <Watch size={14} className="text-emerald-500" />
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Watch Syncing</span>
      </div>
    </div>

    {/* Top Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Circular Health Score Widget */}
      <div className="bg-[#1A1C23] p-6 rounded-3xl border border-white/5 shadow-2xl shadow-black/20 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#0F1015]" />
            <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="389" strokeDashoffset={389 - (389 * 84) / 100} className="text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-out" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white tracking-tighter">84<span className="text-lg text-slate-400">%</span></span>
          </div>
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h4 className="text-lg font-bold text-white">Health Index</h4>
            <p className="text-xs text-slate-400 mt-1">Based on sleep, activity, and vitals over the last 7 days.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#0F1015] p-3 rounded-2xl flex-1 border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sleep Score</span>
              <div className="text-base font-bold text-indigo-400 mt-0.5">92/100</div>
            </div>
            <div className="bg-[#0F1015] p-3 rounded-2xl flex-1 border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Recovery</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">Optimal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Widget */}
      <div className="bg-[#1A1C23] p-6 rounded-3xl border border-white/5 shadow-2xl shadow-black/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-base font-bold text-white">Activity Timeline</h4>
            <p className="text-xs text-slate-400">Weekly step progression</p>
          </div>
          <div className="p-2 bg-[#0F1015] rounded-xl border border-white/5">
            <Footprints size={16} className="text-emerald-500" />
          </div>
        </div>
        <div className="flex items-end justify-between h-32 gap-2 md:gap-4 mt-4">
          {[
            { day: 'M', val: 40 }, { day: 'T', val: 65 }, { day: 'W', val: 90 },
            { day: 'T', val: 50 }, { day: 'F', val: 85 }, { day: 'S', val: 100 }, { day: 'S', val: 75 }
          ].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full bg-[#0F1015] rounded-t-md relative flex-1 flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all duration-1000 ${i === 5 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#2A2E39] group-hover:bg-[#3A3F4E]'}`}
                  style={{ height: `${d.val}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${i === 5 ? 'text-emerald-500' : 'text-slate-500'}`}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom Metrics Row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[#1A1C23] p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
            <Heart className="text-red-500 w-5 h-5 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Heart Rate</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">72</span>
          <span className="text-slate-400 text-xs">bpm</span>
        </div>
      </div>

      <div className="bg-[#1A1C23] p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
            <Activity className="text-sky-500 w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Blood Oxygen</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">98</span>
          <span className="text-slate-400 text-xs">%</span>
        </div>
      </div>

      <div className="bg-[#1A1C23] p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
            <Footprints className="text-orange-500 w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Daily Steps</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">4,500</span>
          <span className="text-slate-400 text-xs">steps</span>
        </div>
      </div>

      <div className="bg-[#1A1C23] p-5 rounded-2xl border border-white/5 hover:border-sky-500/30 transition-colors group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
            <Activity className="text-indigo-500 w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Stress Lvl</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">Low</span>
        </div>
      </div>
    </div>
  </div>
);

const MedicalTimeline = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploading(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const events = [
    { date: '2024.10.24', time: '10:00 AM', title: 'Major Surgery', desc: 'Appendectomy', doctor: 'Dr. Smith', type: 'surgery' },
    { date: '2023.08.15', time: '02:30 PM', title: 'Immunization', desc: 'COVID-19 Booster', doctor: 'City Clinic', type: 'med' },
    { date: '2022.11.05', time: '09:15 AM', title: 'Annual Checkup', desc: 'General Vitals', doctor: 'Dr. Jane', type: 'checkup' },
    { date: '1995.05.12', time: '11:45 AM', title: 'Birth Records', desc: 'St. Mary\'s Ward', doctor: 'Dr. Adams', type: 'birth' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white">Record History</h3>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-[#1A1C23] border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:bg-[#2A2E39] transition-colors shadow-2xl shadow-black/20 flex items-center gap-2">
            <LayoutDashboard size={14} /> Export Records
          </button>
          <button onClick={handleUpload} className="px-4 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100 flex items-center gap-2">
            <Upload size={14} /> Sync New Data
          </button>
        </div>
      </div>

      <AnimatePresence>
        {uploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-[#1A1C23] p-5 rounded-2xl border border-sky-500/20 shadow-lg mb-2 flex items-center gap-4">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-white mb-2">
                  <span>Syncing External Provider Network...</span>
                  <span className="text-sky-400">{progress}%</span>
                </div>
                <div className="h-1.5 bg-[#0F1015] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1A1C23] border border-white/5 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 md:px-6 border-b border-white/5 bg-[#121318]/50 flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/3 md:w-1/4">Date</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1">Description</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block w-1/4">Provider</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {events.map((event, idx) => (
            <div key={idx} className="p-4 md:px-6 flex items-center gap-4 hover:bg-[#2A2E39]/30 transition-colors group cursor-pointer">
              <div className="w-1/3 md:w-1/4">
                <div className="text-sm font-bold text-white tracking-widest">{event.date}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{event.time}</div>
              </div>

              <div className="flex-1 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${event.type === 'surgery' ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' : event.type === 'med' ? 'bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20' : 'bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20'}`}>
                  {event.type === 'surgery' ? <Activity size={18} /> : event.type === 'med' ? <Pill size={18} /> : <History size={18} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">{event.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{event.desc}</div>
                </div>
              </div>

              <div className="hidden md:block w-1/4">
                <span className="px-3 py-1.5 bg-[#0F1015] rounded-xl text-xs font-semibold text-slate-300 border border-white/5 shadow-inner">
                  {event.doctor}
                </span>
              </div>

              <div className="w-16 flex justify-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheck size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AIDiagnosticLab = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'imaging' | 'reports'>('imaging');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (file: File) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const imageBase64 = await base64Promise;

      const endpoint = mode === 'imaging' ? '/api/vision/analyze_xray' : '/api/vision/extract_report';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          patient_id: 'MB-99281-X'
        })
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        result: 'Error: Could not connect to the AI engine.',
        type: 'error',
        text: 'Connection failed.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleScan(file);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-sky-500 w-6 h-6" /> AI Diagnostic Lab
          </h3>
          <p className="text-sm text-slate-400 mt-1">Upload imaging or clinical reports for instant AI analysis.</p>
        </div>
        <div className="flex bg-[#121318] p-1.5 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => { setMode('imaging'); setResult(null); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'imaging' ? 'bg-[#1A1C23] text-sky-400 shadow-xl border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Microscope size={16} /> Imaging
          </button>
          <button
            onClick={() => { setMode('reports'); setResult(null); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'reports' ? 'bg-[#1A1C23] text-sky-400 shadow-xl border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Paperclip size={16} /> Reports
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div
          className={`relative overflow-hidden border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-[#1A1C23]/50 hover:bg-[#1A1C23] hover:border-sky-500/50 transition-all cursor-pointer group min-h-[360px] shadow-2xl shadow-black/20 ${analyzing ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={!analyzing ? handleDropZoneClick : undefined}
        >
          {analyzing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1A1C23]/80 backdrop-blur-md rounded-3xl">
              <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
              <h4 className="font-bold text-white text-lg">{mode === 'imaging' ? 'AI Analyzing Scan...' : 'AI Scanning Report...'}</h4>
              <p className="text-sm text-sky-400 mt-1">{mode === 'imaging' ? 'Running Vision Models' : 'Extracting Text via OCR'}</p>
            </div>
          )}

          <div className="w-24 h-24 bg-[#0F1015] rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-sky-500/10 transition-all border border-white/5 shadow-inner duration-500">
            {mode === 'imaging' ? (
              <Microscope className="text-slate-500 w-10 h-10 group-hover:text-sky-400 transition-colors duration-500" />
            ) : (
              <Paperclip className="text-slate-500 w-10 h-10 group-hover:text-sky-400 transition-colors duration-500" />
            )}
          </div>
          <h4 className="text-xl font-bold text-white mb-2 tracking-wide">
            {mode === 'imaging' ? 'Upload Medical Scan' : 'Upload Clinical Report'}
          </h4>
          <p className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Drag & drop or click to browse. Supports JPG, PNG up to 50MB.
          </p>
          <button className="mt-8 px-8 py-3 bg-[#0F1015] text-white rounded-xl text-sm font-bold border border-white/10 group-hover:border-sky-500/50 transition-colors shadow-lg">
            {mode === 'imaging' ? 'Select Scan' : 'Select Report'}
          </button>
        </div>

        {/* Results Area */}
        <div className="bg-[#1A1C23] rounded-3xl border border-white/5 shadow-2xl shadow-black/20 flex flex-col min-h-[360px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>

          <div className="p-6 border-b border-white/5 bg-[#121318]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
                <Activity className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Analysis Results</h4>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">{result ? 'Completed' : 'Awaiting Input'}</p>
              </div>
            </div>
            {result && (
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold border border-emerald-500/20">Success</div>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center overflow-y-auto">
            {!result ? (
              <div className="flex flex-col items-center text-center opacity-40">
                <BrainCircuit className="w-16 h-16 text-slate-500 mb-6 drop-shadow-lg" />
                <p className="text-base font-semibold text-white">AI Engine Ready</p>
                <p className="text-sm text-slate-500 mt-2 max-w-[250px]">Upload a document to begin instant automated analysis.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 w-full">
                  {result.type === 'image_analysis' ? (
                    <div className="space-y-4">
                      <div className="p-5 bg-[#0F1015] rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2"><Microscope size={12} /> Finding Overview</span>
                        <div className="text-sm font-medium text-white leading-relaxed">{result.result}</div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold leading-relaxed">Note: AI diagnostics are preliminary screening tools. Always consult a licensed physician for medical advice.</span>
                      </div>
                    </div>
                  ) : result.type === 'report_scan' ? (
                    <div className="space-y-4 w-full">
                      {/* Condensed Report View */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-[#0F1015] rounded-2xl border border-white/5 shadow-inner">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2"><Pill size={12} /> Medications</span>
                          <ul className="space-y-2">
                            {result.structured_data?.active_medications?.length > 0 ? (
                              result.structured_data.active_medications.map((m: string, i: number) => (
                                <li key={i} className="text-sm font-bold text-sky-400">{m}</li>
                              ))
                            ) : <li className="text-xs text-slate-500 italic">None Detected</li>}
                          </ul>
                        </div>
                        <div className="p-5 bg-[#0F1015] rounded-2xl border border-white/5 shadow-inner">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2"><AlertTriangle size={12} /> Allergies</span>
                          <ul className="space-y-2">
                            {result.structured_data?.allergies?.length > 0 ? (
                              result.structured_data.allergies.map((a: string, i: number) => (
                                <li key={i} className="text-sm font-bold text-red-500">{a}</li>
                              ))
                            ) : <li className="text-xs text-slate-500 italic">None Detected</li>}
                          </ul>
                        </div>
                      </div>
                      {result.structured_data?.vitals && Object.keys(result.structured_data.vitals).length > 0 && (
                        <div className="p-5 bg-[#0F1015] rounded-2xl border border-white/5 shadow-inner flex flex-wrap gap-6">
                          {Object.entries(result.structured_data.vitals).map(([k, v], i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">{k.replace('_', ' ')}</span>
                              <span className="text-base font-bold text-emerald-400 tracking-wide">{v as string}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm font-bold p-5 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center gap-4">
                      <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                      {result.result || 'An error occurred during analysis.'}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 border-t border-white/5 bg-[#121318]/50 flex gap-4 mt-auto">
                <button className="flex-1 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2">
                  Save to Profile
                </button>
                <button onClick={() => setResult(null)} className="px-6 py-3 bg-[#0F1015] text-slate-400 border border-white/5 rounded-xl text-sm font-bold hover:text-white hover:bg-slate-800 transition-all shadow-inner">
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PrescriptionManager = () => {
  const [meds, setMeds] = useState([
    { name: 'Warfarin', dosage: '5mg', freq: 'Once daily', type: 'Anticoagulant', status: 'Active', remaining: 14, doctor: 'Dr. Smith' },
    { name: 'Lisinopril', dosage: '10mg', freq: 'Morning', type: 'Blood Pressure', status: 'Active', remaining: 30, doctor: 'City Clinic' },
    { name: 'Amoxicillin', dosage: '500mg', freq: 'Twice daily', type: 'Antibiotic', status: 'Completed', remaining: 0, doctor: 'Dr. Adams' },
  ]);
  const [warning, setWarning] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addMedicine = (name: string) => {
    if (name === 'Aspirin') {
      setWarning('Overlap detected with your current Warfarin prescription. Risk of bleeding is High. Consult your doctor.');
      return;
    }
    setWarning(null);
    setMeds([...meds, { name, dosage: '325mg', freq: 'As needed', type: 'Pain Relief', status: 'Active', remaining: 30, doctor: 'Self' }]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Active Prescriptions</h3>
          <p className="text-sm text-slate-400 mt-1">Manage your medications and view pharmacy QR codes.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search medications..." className="w-full bg-[#1A1C23] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-500 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1C23] border border-white/5 rounded-xl text-sm font-bold text-slate-300 hover:bg-[#2A2E39] transition-colors shadow-2xl shadow-black/20 whitespace-nowrap"
          >
            <QrCode size={16} className="text-indigo-400" />
            Pharmacy QR
          </button>
          <button
            onClick={() => addMedicine('Aspirin')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 ring-1 ring-amber-500/20 border border-amber-500/20 rounded-2xl p-4 flex gap-4 overflow-hidden shadow-lg"
          >
            <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-tight">Interaction Warning</h4>
              <p className="text-sm text-amber-100/70 mt-1">{warning}</p>
            </div>
            <button onClick={() => setWarning(null)} className="p-2 h-fit text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors bg-amber-500/10"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#1A1C23] border border-white/5 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 md:px-6 border-b border-white/5 bg-[#121318]/50 flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/3 sm:w-1/4 max-w-[250px]">Medication</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1 hidden sm:block">Dosage & Type</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block w-32">Provider</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block w-24">Status</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12 text-center">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {meds.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((med, idx) => (
            <div key={idx} className="p-4 md:px-6 flex items-center gap-4 hover:bg-[#2A2E39]/30 transition-colors group cursor-pointer">
              <div className="w-1/3 sm:w-1/4 max-w-[250px] flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${med.status === 'Active' ? 'bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20' : 'bg-[#0F1015] text-slate-500 border border-white/5'}`}>
                  <Pill size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${med.status === 'Active' ? 'text-white group-hover:text-sky-400 text-base' : 'text-slate-400'} transition-colors`}>{med.name}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">{med.freq}</p>
                </div>
              </div>

              <div className="flex-1 hidden sm:flex flex-col">
                <div className="text-sm font-bold text-white">{med.dosage}</div>
                <div className="text-xs text-slate-500 mt-0.5">{med.type}</div>
              </div>

              <div className="hidden md:block w-32">
                <span className="px-3 py-1.5 bg-[#0F1015] rounded-xl text-xs font-semibold text-slate-300 border border-white/5 shadow-inner whitespace-nowrap">
                  {med.doctor}
                </span>
              </div>

              <div className="hidden sm:flex w-24 items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${med.status === 'Active' ? 'bg-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}></div>
                <span className={`text-xs font-bold ${med.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'}`}>{med.status}</span>
              </div>

              <div className="w-12 flex justify-center">
                <button className="w-8 h-8 rounded-xl bg-[#0F1015] flex items-center justify-center border border-white/5 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 group-hover:text-sky-500 transition-colors text-slate-500 shadow-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
          {meds.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <div className="p-12 text-center text-slate-500 text-sm font-bold">
              No medications matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1A1C23] p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
              <div className="w-56 h-56 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center p-4 shadow-xl">
                <QrCode size={180} className="text-slate-900" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Pharmacy QR</h4>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed">Present this code at any partnered pharmacy to automatically securely transfer your prescriptions.</p>
              <button
                onClick={() => setShowQR(false)}
                className="w-full bg-[#0F1015] text-white font-bold py-3.5 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors shadow-lg shadow-black/20"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hello! I’m your MediBOT AI Assistant. I’ve reviewed your latest vitals and medications. How can I assist you today?',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const history = await getChatHistory('patient-alex-johnson');
      if (history.length > 0) {
        setMessages(history.map(m => ({ role: m.role, text: m.text, type: m.type })));
      }
    })();
  }, []);

  const quickReplies = [
    'Analyze my recent X-ray',
    'Check my meds for side effects',
    'Explain my last blood report',
    'Schedule a follow-up'
  ];

  const handleSend = async (text: string = input) => {
    const messageText = text.trim();
    if (!messageText) return;

    setMessages(prev => [...prev, { role: 'user', text: messageText, type: 'text' }]);
    setInput('');
    setIsTyping(true);

    // Persist user message to IndexedDB
    saveChatMessage('patient-alex-johnson', 'user', messageText, 'text');

    // Check for emergency keywords locally for instant UI response
    const lowerText = messageText.toLowerCase();
    if (lowerText.includes('chest pain') || lowerText.includes('emergency') || lowerText.includes('breath')) {
      setIsEmergency(true);
    }

    try {
      // Call the real Python AI backend with patient context
      const response = await fetch('/api/chat/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageText,
          patient_context: {
            age: 31,
            gender: 'Non-binary',
            blood_type: 'B+',
            allergies: ['NSAIDs', 'Penicillin'],
            active_medications: ['Warfarin (5mg)', 'Lisinopril (10mg)'],
            recent_vitals: { hr: 72, spo2: 98, steps: 4500 }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.type === 'emergency') {
        setIsEmergency(true);
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.text,
        type: data.type || 'text'
      }]);

      // Persist AI response to IndexedDB
      saveChatMessage('patient-alex-johnson', 'ai', data.text, data.type || 'text');
    } catch (error) {
      // Fallback: if backend is down, show a graceful error
      const offlineMsg = 'I apologize, but I am unable to connect to the AI engine right now. Please ensure the backend server is running on port 8000.';
      setMessages(prev => [...prev, {
        role: 'ai',
        text: offlineMsg,
        type: 'text'
      }]);
      saveChatMessage('patient-alex-johnson', 'ai', offlineMsg, 'text');
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className={`w-full max-w-4xl mx-auto h-[75vh] min-h-[600px] flex flex-col bg-[#121318] rounded-[2rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 relative ${isEmergency ? 'ring-2 ring-red-500/50' : ''}`}>
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-[#1A1C23]/80 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#1A1C23] rounded-full z-10 ${isEmergency ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">MediBOT Intelligence</h4>
            <p className="text-xs text-slate-400 font-medium">Personalized AI Health Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEmergency && (
            <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-red-500/20">
              <PhoneCall size={14} />
              <span className="hidden sm:inline">Emergency Help</span>
            </button>
          )}
          <button className="p-2.5 bg-[#0F1015] border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-sky-500/30 hover:bg-sky-500/5 transition-all shadow-inner">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10 scroll-smooth">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
              {msg.type === 'vision' ? (
                <div className="bg-[#1A1C23] border border-sky-500/20 rounded-3xl rounded-tl-sm p-5 shadow-xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-sky-500/10 ring-1 ring-sky-500/20 rounded-xl">
                      <Microscope className="text-sky-400 w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Visual Analysis Complete</h5>
                      <p className="text-xs text-slate-400">ResNet50 Medical Imaging Model</p>
                    </div>
                  </div>
                  <div className="bg-[#0F1015] p-3 rounded-xl border border-white/5 mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidence Score</span>
                      <span className="text-xs font-bold text-emerald-400">{msg.confidence}</span>
                    </div>
                    <div className="w-full bg-[#1A1C23] rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: msg.confidence || '90%' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">{msg.result}</p>
                </div>
              ) : msg.type === 'status' ? (
                <div className="flex items-center gap-2 text-sky-400 italic text-xs font-bold bg-sky-500/5 px-4 py-2 rounded-full border border-sky-500/10 shadow-sm w-fit">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {msg.text}
                </div>
              ) : (
                <div className={`p-4 sm:p-5 rounded-3xl text-[15px] leading-relaxed shadow-xl ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-tr-sm shadow-sky-500/20'
                  : 'bg-[#1A1C23] border border-white/5 text-slate-300 rounded-tl-sm shadow-black/20'
                  }`}>
                  {msg.text}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[#1A1C23] border border-white/5 p-4 rounded-3xl rounded-tl-sm flex gap-1.5 shadow-lg w-fit">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(56,189,248,0.5)]" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-sky-400/70 rounded-full animate-bounce shadow-[0_0_5px_rgba(56,189,248,0.3)]" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-sky-400/40 rounded-full animate-bounce shadow-[0_0_5px_rgba(56,189,248,0.1)]" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 pt-2 bg-gradient-to-t from-[#121318] to-transparent z-10">
        <div className="flex flex-wrap gap-2 mb-4 px-1">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="px-4 py-2 bg-[#1A1C23] border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400 transition-all shadow-md shadow-black/20"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="relative group flex items-end gap-2 bg-[#1A1C23] p-2 rounded-3xl border border-white/10 shadow-2xl shadow-black/40 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all">
          <button className="p-3 bg-[#0F1015] text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-2xl transition-colors flex-shrink-0">
            <Paperclip size={20} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask MediBOT anything about your health..."
            className="w-full bg-transparent text-white px-2 py-3.5 text-sm focus:outline-none resize-none placeholder-slate-500 min-h-[52px] max-h-[150px]"
            rows={1}
          />
          <button className="p-3 bg-[#0F1015] text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-2xl transition-colors flex-shrink-0 sm:hidden">
            <Mic size={20} />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-gradient-to-br from-sky-400 to-indigo-500 text-white rounded-2xl hover:shadow-lg hover:shadow-sky-500/25 disabled:opacity-50 disabled:hover:shadow-none transition-all flex-shrink-0 border border-white/10"
          >
            <Send size={20} className="translate-x-0.5 -translate-y-0.5" />
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-500 font-medium">MediBOT can make mistakes. Consider verifying critical medical information with a doctor.</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export default function PatientDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0F1015] text-slate-200 font-sans selection:bg-sky-500/30 font-sans selection:bg-sky-100 overflow-x-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          patientName="Alex Johnson"
          onMenuClick={() => setIsMenuOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <HealthOverview />}
              {activeTab === 'timeline' && <MedicalTimeline />}
              {activeTab === 'lab' && <AIDiagnosticLab />}
              {activeTab === 'prescriptions' && <PrescriptionManager />}
              {activeTab === 'chat' && <AIChat />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
