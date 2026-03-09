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
        w-64 bg-white border-r border-slate-200 flex flex-col h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-100">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Medi<span className="text-sky-500">BOT</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
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
                ? 'bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
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
  <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
    <div className="flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
      >
        <Menu size={24} />
      </button>
      <div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate max-w-[150px] md:max-w-none">
          Hi, <span className="text-sky-600">{patientName.split(' ')[0]}</span>
        </h2>
        <p className="hidden md:block text-xs text-slate-400 font-medium mt-0.5">Patient ID: #MB-99281-X</p>
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[8px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Secured</span>
      </div>
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
        <User size={18} className="text-slate-400" />
      </div>
    </div>
  </header>
);

const HealthOverview = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-900">Live Vitals</h3>
      <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full border border-sky-100">
        <Watch size={14} className="text-sky-500" />
        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Watch Status: Connected</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <Heart className="text-red-500 w-6 h-6 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heart Rate</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">72</span>
          <span className="text-slate-400 font-semibold text-sm">bpm</span>
        </div>
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 w-[72%]" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-sky-50 rounded-lg">
            <Activity className="text-sky-500 w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SpO2</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">98</span>
          <span className="text-slate-400 font-semibold text-sm">%</span>
        </div>
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 w-[98%]" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Footprints className="text-emerald-500 w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Steps</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">4,500</span>
          <span className="text-slate-400 font-semibold text-sm">/ 10k</span>
        </div>
        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[45%]" />
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
    { date: '2024', title: 'Major Surgery', desc: 'Appendectomy - City General Hospital', type: 'surgery' },
    { date: '2020', title: 'Immunization', desc: 'COVID-19 Booster & Flu Shot', type: 'med' },
    { date: '1995', title: 'Birth Records', desc: 'St. Mary\'s Maternity Ward', type: 'birth' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Life History Timeline</h3>
        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((event, idx) => (
            <div key={idx} className="relative">
              <div className={`absolute -left-[29px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${event.type === 'surgery' ? 'bg-red-500' : event.type === 'med' ? 'bg-sky-500' : 'bg-emerald-500'
                }`} />
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date}</span>
                <h4 className="font-bold text-slate-900 mt-1">{event.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-sky-500 p-6 rounded-2xl text-white shadow-lg shadow-sky-100">
          <h4 className="font-bold mb-2">Sync Records</h4>
          <p className="text-sky-100 text-sm mb-6">Upload external medical records to your MediBOT Life History.</p>

          {uploading ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-sky-400 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="w-full bg-white text-sky-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-sky-50 transition-colors"
            >
              <Upload size={18} />
              Upload Life History File
            </button>
          )}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">AI Diagnostic Lab</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setMode('imaging'); setResult(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'imaging' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Imaging (X-Ray/MRI)
          </button>
          <button
            onClick={() => { setMode('reports'); setResult(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'reports' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Medical Reports (OCR)
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

      <div
        className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-white hover:border-sky-400 hover:bg-sky-50/30 transition-all cursor-pointer group"
        onClick={!analyzing ? handleDropZoneClick : undefined}
      >
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-100 transition-colors">
          {mode === 'imaging' ? (
            <Microscope className="text-slate-400 w-10 h-10 group-hover:text-sky-500 transition-colors" />
          ) : (
            <Paperclip className="text-slate-400 w-10 h-10 group-hover:text-sky-500 transition-colors" />
          )}
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">
          {mode === 'imaging' ? 'Drop X-Ray or MRI images here' : 'Drop clinical reports or prescriptions here'}
        </h4>
        <p className="text-sm text-slate-400">Supports JPG, PNG up to 50MB</p>
        <button className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
          {mode === 'imaging' ? 'Analyze Scan' : 'Scan Report'}
        </button>
      </div>

      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg flex flex-col items-center gap-4"
          >
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
            <div className="text-center">
              <h4 className="font-bold text-slate-900">{mode === 'imaging' ? 'AI Analyzing Scan...' : 'AI Scanning Report...'}</h4>
              <p className="text-sm text-slate-500 mt-1">
                {mode === 'imaging' ? 'Running ResNet101 CNN' : 'Extracting clinical data via EasyOCR'}
              </p>
            </div>
          </motion.div>
        )}

        {result && result.type === 'report_scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-100 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Extracted Clinical Data</h4>
                <p className="text-xs text-slate-500">I've parsed the report. Please confirm the findings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Allergies</span>
                <ul className="space-y-1">
                  {result.structured_data.allergies?.length > 0 ? (
                    result.structured_data.allergies.map((a: string, i: number) => (
                      <li key={i} className="text-sm font-semibold text-red-600 flex items-center gap-2">
                        <AlertTriangle size={14} /> {a}
                      </li>
                    ))
                  ) : <li className="text-sm text-slate-400 italic">None detected</li>}
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Medications</span>
                <ul className="space-y-1">
                  {result.structured_data.active_medications?.length > 0 ? (
                    result.structured_data.active_medications.map((m: string, i: number) => (
                      <li key={i} className="text-sm font-semibold text-sky-600 flex items-center gap-2">
                        <Pill size={14} /> {m}
                      </li>
                    ))
                  ) : <li className="text-sm text-slate-400 italic">None detected</li>}
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Vitals Detected</span>
                <div className="space-y-1">
                  {Object.entries(result.structured_data.vitals || {}).map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                      <span className="font-bold text-slate-900">{v as string}</span>
                    </div>
                  ))}
                  {Object.keys(result.structured_data.vitals || {}).length === 0 && (
                    <span className="text-sm text-slate-400 italic">None detected</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2 p-4 bg-sky-50 rounded-xl border border-sky-100 italic text-sm text-sky-800 leading-relaxed">
              "{result.text}"
            </div>

            <div className="flex gap-3 mt-2">
              <button className="flex-1 py-3 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-100">
                Confirm & Update Profile
              </button>
              <button onClick={() => setResult(null)} className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PrescriptionManager = () => {
  const [meds, setMeds] = useState([
    { name: 'Warfarin', dosage: '5mg', freq: 'Once daily', type: 'Anticoagulant' },
    { name: 'Lisinopril', dosage: '10mg', freq: 'Morning', type: 'Blood Pressure' },
  ]);
  const [warning, setWarning] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const addMedicine = (name: string) => {
    if (name === 'Aspirin') {
      setWarning('Overlap detected with your current Warfarin prescription. Risk of bleeding is High. Consult your doctor.');
      return;
    }
    setWarning(null);
    setMeds([...meds, { name, dosage: '325mg', freq: 'As needed', type: 'Pain Relief' }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Active Prescriptions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <QrCode size={18} />
            Generate Pharmacy QR
          </button>
          <button
            onClick={() => addMedicine('Aspirin')}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100"
          >
            <Pill size={18} />
            Add Medicine
          </button>
        </div>
      </div>

      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 overflow-hidden"
          >
            <AlertTriangle className="text-amber-600 w-5 h-5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">CRITICAL WARNING</h4>
              <p className="text-sm text-amber-700 mt-0.5">{warning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meds.map((med, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-sky-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                <Pill className="text-slate-400 group-hover:text-sky-500 transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{med.name}</h4>
                <p className="text-xs text-slate-500">{med.dosage} • {med.freq}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">{med.type}</span>
          </div>
        ))}
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-xs w-full text-center"
          >
            <div className="w-48 h-48 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-inner">
              <QrCode size={120} className="text-slate-900" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Pharmacy Access Token</h4>
            <p className="text-sm text-slate-500 mt-2">Scan this at any MediBOT partner pharmacy to fulfill your prescriptions.</p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-8 w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hello! I’ve reviewed your vitals from your smartwatch today—your heart rate was a bit high at 10:00 AM. How can I help you feel better?',
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
    'Explain my last blood report'
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
    <div className={`max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-500 ${isEmergency ? 'ring-4 ring-red-500/20 animate-pulse bg-red-50/30' : ''}`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">MediBOT AI Assistant</h4>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isEmergency ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-tight ${isEmergency ? 'text-red-600' : 'text-emerald-600'}`}>
                {isEmergency ? 'Emergency Mode' : 'System Online'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEmergency && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider animate-bounce">
              <PhoneCall size={14} />
              Emergency Contact
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <ShieldCheck size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] space-y-2`}>
              {msg.type === 'vision' ? (
                <div className="bg-white border-2 border-sky-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-sky-50 rounded-lg">
                      <Microscope className="text-sky-500 w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Vision Processing</h5>
                      <p className="text-[10px] text-slate-400 font-medium">ResNet50 Architecture</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500">Confidence</span>
                    <span className="text-[10px] font-bold text-sky-600">{msg.confidence}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-3 font-medium">{msg.result}</p>
                </div>
              ) : msg.type === 'status' ? (
                <div className="flex items-center gap-2 text-sky-600 italic text-xs font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {msg.text}
                </div>
              ) : (
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-slate-700 text-white rounded-tr-none'
                  : 'bg-white border-2 border-sky-50 text-slate-700 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-4 bg-white">
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all"
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms..."
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
            <button
              onClick={() => handleSend()}
              className="absolute right-2 top-2 p-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100"
            >
              <Send size={18} />
            </button>
          </div>
          <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
            <Mic size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <Heart size={20} />
          </button>
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
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-sky-100 overflow-x-hidden">
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
