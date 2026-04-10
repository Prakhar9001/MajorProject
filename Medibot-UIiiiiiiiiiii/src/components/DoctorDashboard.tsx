/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Activity,
  ShieldCheck,
  BrainCircuit,
  Loader2,
  LayoutDashboard,
  History,
  Microscope,
  Pill,
  LogOut,
  Heart,
  AlertTriangle,
  Bell,
  MoreVertical,
  Layers,
  FileText,
  User,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { PatientProfile } from '../store/usePatientStore';

// Extend PatientProfile with display-only fields derived at load time
interface FirestorePatient extends PatientProfile {
  id: string;
  priority: 'red' | 'yellow' | 'green';
  status: string;
  vitals: { hr: number; spo2: number; temp: number };
  history: { date: string; event: string; type: string }[];
  hrData: { value: number }[];
  spo2Data: { value: number }[];
}

function deriveDisplayFields(uid: string, p: PatientProfile): FirestorePatient {
  const hr = p.recentVitals?.heartRate ?? 72;
  const spo2 = p.recentVitals?.spo2 ?? 98;
  const priority: 'red' | 'yellow' | 'green' =
    hr > 100 || spo2 < 94 ? 'red' : hr > 90 || spo2 < 97 ? 'yellow' : 'green';
  const status =
    priority === 'red' ? 'High Vitals' : priority === 'yellow' ? 'Monitor' : 'Stable';
  return {
    ...p,
    id: uid,
    priority,
    status,
    vitals: { hr, spo2, temp: 98.6 },
    history: [],
    hrData: Array.from({ length: 20 }, () => ({ value: hr + Math.random() * 10 - 5 })),
    spo2Data: Array.from({ length: 20 }, () => ({ value: spo2 + Math.random() * 2 - 1 })),
  };
}

// --- Components ---

const Sparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-12 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false} 
          isAnimationActive={false}
        />
        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const Sidebar = ({ onLogout }: { onLogout: () => void }) => (
  <div className="w-20 lg:w-64 bg-[#0F172A] flex flex-col h-screen sticky top-0 z-30">
    <div className="p-6 flex items-center gap-3 border-b border-slate-800">
      <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
        <Stethoscope className="text-white w-6 h-6" />
      </div>
      <span className="hidden lg:block text-xl font-bold text-white tracking-tight">Medi<span className="text-sky-500">BOT</span></span>
    </div>
    
    <nav className="flex-1 p-4 space-y-2 mt-4">
      {[
        { icon: LayoutDashboard, label: 'Command Center', active: true },
        { icon: User, label: 'Patient Registry' },
        { icon: Microscope, label: 'Imaging Lab' },
        { icon: Pill, label: 'Pharmacy Hub' },
        { icon: BrainCircuit, label: 'AI Insights' },
      ].map((item, idx) => (
        <button
          key={idx}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            item.active 
            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <item.icon size={20} />
          <span className="hidden lg:block">{item.label}</span>
        </button>
      ))}
    </nav>

    <div className="p-4 border-t border-slate-800">
      <button 
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        <LogOut size={20} />
        <span className="hidden lg:block">Sign Out</span>
      </button>
    </div>
  </div>
);

const PatientList = ({ patients, activeId, onSelect }: { patients: any[], activeId: string, onSelect: (id: string) => void }) => {
  const [search, setSearch] = useState('');
  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Patient Queue</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((patient) => (
          <button
            key={patient.id}
            onClick={() => onSelect(patient.id)}
            className={`w-full text-left p-4 rounded-2xl transition-all border ${
              activeId === patient.id 
              ? 'bg-white border-sky-500 shadow-md ring-1 ring-sky-500/10' 
              : 'bg-white/50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  patient.priority === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                  patient.priority === 'yellow' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                }`} />
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {patient.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                patient.priority === 'red' ? 'bg-red-50 text-red-600' :
                patient.priority === 'yellow' ? 'bg-amber-50 text-amber-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {patient.status}
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={12} />
                <span className="text-[10px] font-medium">12m ago</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ActivePatientProfile = ({ patient }: { patient: any }) => (
  <div className="flex-1 flex flex-col bg-white overflow-y-auto">
    <div className="p-8 border-b border-slate-100">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center border-2 border-white shadow-xl overflow-hidden">
            <User size={40} className="text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold text-slate-900">{patient.name}</h2>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">{patient.gender}, {patient.age}y</span>
            </div>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              MediBOT Verified Clinical Profile
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
            <Bell size={20} />
          </button>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Heart Rate</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{patient.vitals.hr} <span className="text-xs text-slate-400">bpm</span></span>
          </div>
          <Sparkline data={patient.hrData} color="#EF4444" />
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-sky-500" size={18} />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SpO2 Level</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{patient.vitals.spo2} <span className="text-xs text-slate-400">%</span></span>
          </div>
          <Sparkline data={patient.spo2Data} color="#0EA5E9" />
        </div>
      </div>
    </div>

    <div className="p-8 space-y-8">
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <History size={20} className="text-sky-500" />
          Clinical Timeline
        </h4>
        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {patient.history.map((event: any, idx: number) => (
            <div key={idx} className="relative">
              <div className={`absolute -left-[29px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                event.type === 'emergency' ? 'bg-red-500' : event.type === 'diagnosis' ? 'bg-amber-500' : 'bg-sky-500'
              }`} />
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.date}</span>
                <h5 className="font-bold text-slate-900 mt-1">{event.event}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AIDiagnosticPanel = () => {
  const [overlay, setOverlay] = useState(false);
  const [prescribing, setPrescribing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const handlePrescribe = (med: string) => {
    if (med === 'Aspirin') {
      setWarning('INTERACTION WARNING: Patient is currently on Warfarin. High risk of gastrointestinal hemorrhage.');
    } else {
      setWarning(null);
    }
  };

  return (
    <div className="w-96 border-l border-slate-200 bg-slate-50 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="text-sky-500" size={20} />
          AI Diagnostic Panel
        </h3>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Radiology Viewer</span>
            <button 
              onClick={() => setOverlay(!overlay)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                overlay ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Layers size={12} />
              AI OVERLAY: {overlay ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden border-4 border-white shadow-xl group">
            <img 
              src="https://picsum.photos/seed/xray/400/400" 
              alt="X-Ray" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            {overlay && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-transparent to-sky-500/40 mix-blend-overlay"
              >
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="bg-red-500/20 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-white uppercase">Anomaly Detected</div>
                </div>
              </motion.div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/60 bg-black/40 backdrop-blur-md px-2 py-1 rounded">Chest PA View</span>
              <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-all">
                <Search size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Smart e-Prescription</h4>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Medication</label>
              <select 
                onChange={(e) => handlePrescribe(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Select...</option>
                <option value="Aspirin">Aspirin (325mg)</option>
                <option value="Amoxicillin">Amoxicillin (500mg)</option>
                <option value="Metformin">Metformin (850mg)</option>
              </select>
            </div>

            <AnimatePresence>
              {warning && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2"
                >
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-red-700 leading-tight">{warning}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Sign & Generate QR
            </button>
          </div>
        </div>

        <div className="p-6 bg-sky-500 rounded-3xl text-white shadow-lg shadow-sky-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <h4 className="font-bold mb-1">AI Second Opinion</h4>
          <p className="text-[10px] text-sky-100 leading-relaxed mb-4">Based on radiology and vitals, there is an 84% probability of early-stage pneumonia. Recommend immediate nebulization.</p>
          <button className="w-full py-2 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-bold hover:bg-white/30 transition-all">
            View Full AI Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export default function DoctorDashboard({ onLogout }: { onLogout: () => void }) {
  const [patients, setPatients] = useState<FirestorePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  useEffect(() => {
    const doctorUid = auth.currentUser?.uid;
    if (!doctorUid) {
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        const q = query(
          collection(db, 'patients'),
          where('doctorUid', '==', doctorUid)
        );
        const snapshot = await getDocs(q);
        const loaded: FirestorePatient[] = snapshot.docs.map(d =>
          deriveDisplayFields(d.id, d.data() as PatientProfile)
        );
        setPatients(loaded);
        if (loaded.length > 0) setActivePatientId(loaded[0].id);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) ?? null;
  const doctorName = auth.currentUser?.displayName ?? 'Doctor';
  const initials = doctorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-100 font-sans selection:bg-sky-100 overflow-hidden">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Clinical Command Center</h1>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">System: Peak Performance</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{doctorName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Attending Physician</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-100">
              {initials || <User size={18} />}
            </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-sky-500" size={36} />
            </div>
          ) : patients.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
              <User size={48} className="text-slate-200" />
              <p className="text-lg font-semibold">No patients assigned yet</p>
              <p className="text-sm">Patients who select you as their doctor will appear here.</p>
            </div>
          ) : (
            <>
              <PatientList
                patients={patients}
                activeId={activePatientId ?? ''}
                onSelect={setActivePatientId}
              />
              {activePatient && <ActivePatientProfile patient={activePatient} />}
              <AIDiagnosticPanel />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
