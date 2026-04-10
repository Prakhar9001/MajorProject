import React, { useState } from 'react';
import { X, Plus, Loader2, User, Droplets, AlertTriangle, Pill, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { usePatientStore } from '../store/usePatientStore';
import { savePatient } from '../lib/patientService';

interface ProfileEditorProps {
  onClose: () => void;
  isFirstTime?: boolean;
}

export default function ProfileEditor({ onClose, isFirstTime = false }: ProfileEditorProps) {
  const { uid, profile, setProfile } = usePatientStore();

  const [form, setForm] = useState({
    name: profile?.name || '',
    age: profile?.age || 0,
    gender: profile?.gender || '',
    bloodType: profile?.bloodType || '',
    allergies: profile?.allergies || [],
    activeMedications: profile?.activeMedications || [],
    recentVitals: {
      heartRate: profile?.recentVitals?.heartRate || 0,
      spo2: profile?.recentVitals?.spo2 || 0,
      steps: profile?.recentVitals?.steps || 0,
    },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addTag = (field: 'allergies' | 'activeMedications', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || form[field].includes(trimmed)) return;
    setForm(f => ({ ...f, [field]: [...f[field], trimmed] }));
    if (field === 'allergies') setAllergyInput('');
    else setMedInput('');
  };

  const removeTag = (field: 'allergies' | 'activeMedications', idx: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const updated = {
        ...form,
        recentVitals: {
          ...form.recentVitals,
          timestamp: new Date().toISOString(),
        },
      };
      await savePatient(uid, updated);
      setProfile({ ...profile!, ...updated });
      setSaved(true);
      toast.success('Profile saved successfully');
      setTimeout(onClose, 800);
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={(e) => !isFirstTime && e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#1A1C23] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 rounded-t-[2rem]" />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1A1C23] z-10 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 ring-1 ring-sky-500/20 rounded-xl flex items-center justify-center">
              <User className="text-sky-400 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isFirstTime ? 'Welcome — Set Up Your Health Profile' : 'Edit Health Profile'}
              </h3>
              <p className="text-xs text-slate-400">
                {isFirstTime
                  ? 'Complete your profile so MediBOT can personalise your care.'
                  : 'This data personalises your AI responses.'}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Age</label>
                <input
                  type="number"
                  value={form.age || ''}
                  onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                  placeholder="Age"
                  min={0}
                  max={120}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2 flex items-center gap-1.5"><Droplets size={12} className="text-red-400" /> Blood Type</label>
                <select
                  value={form.bloodType}
                  onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                >
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-amber-400" /> Known Allergies
            </h4>
            <div className="flex gap-2 mb-3">
              <input
                value={allergyInput}
                onChange={e => setAllergyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag('allergies', allergyInput)}
                className="flex-1 bg-[#0F1015] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                placeholder="e.g. Penicillin, NSAIDs... (press Enter)"
              />
              <button
                onClick={() => addTag('allergies', allergyInput)}
                className="px-4 py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl hover:bg-sky-500/20 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.allergies.map((a, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-bold">
                  {a}
                  <button onClick={() => removeTag('allergies', i)} className="hover:text-red-300"><X size={12} /></button>
                </span>
              ))}
              {form.allergies.length === 0 && <p className="text-xs text-slate-600 italic">No allergies recorded.</p>}
            </div>
          </div>

          {/* Medications */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Pill size={12} className="text-sky-400" /> Active Medications
            </h4>
            <div className="flex gap-2 mb-3">
              <input
                value={medInput}
                onChange={e => setMedInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag('activeMedications', medInput)}
                className="flex-1 bg-[#0F1015] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                placeholder="e.g. Warfarin 5mg, Lisinopril 10mg... (press Enter)"
              />
              <button
                onClick={() => addTag('activeMedications', medInput)}
                className="px-4 py-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl hover:bg-sky-500/20 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.activeMedications.map((m, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-bold">
                  {m}
                  <button onClick={() => removeTag('activeMedications', i)} className="hover:text-sky-300"><X size={12} /></button>
                </span>
              ))}
              {form.activeMedications.length === 0 && <p className="text-xs text-slate-600 italic">No medications recorded.</p>}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" /> Recent Vitals (Manual Entry)
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={form.recentVitals.heartRate || ''}
                  onChange={e => setForm(f => ({ ...f, recentVitals: { ...f.recentVitals, heartRate: parseInt(e.target.value) || 0 } }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                  placeholder="72"
                  min={0}
                  max={300}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">SpO2 (%)</label>
                <input
                  type="number"
                  value={form.recentVitals.spo2 || ''}
                  onChange={e => setForm(f => ({ ...f, recentVitals: { ...f.recentVitals, spo2: parseInt(e.target.value) || 0 } }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                  placeholder="98"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-2">Daily Steps</label>
                <input
                  type="number"
                  value={form.recentVitals.steps || ''}
                  onChange={e => setForm(f => ({ ...f, recentVitals: { ...f.recentVitals, steps: parseInt(e.target.value) || 0 } }))}
                  className="w-full bg-[#0F1015] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder-slate-600"
                  placeholder="4500"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3 sticky bottom-0 bg-[#1A1C23]">
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#0F1015] text-slate-400 border border-white/5 rounded-xl text-sm font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : saved ? '✓ Saved' : isFirstTime ? 'Complete Setup' : 'Save Profile'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
