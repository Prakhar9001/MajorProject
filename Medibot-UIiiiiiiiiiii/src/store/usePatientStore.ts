import { create } from 'zustand';

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  activeMedications: string[];
  recentVitals: {
    heartRate?: number;
    spo2?: number;
    steps?: number;
    timestamp?: string;
  };
  doctorUid?: string | null;
}

interface PatientStore {
  uid: string | null;
  profile: PatientProfile | null;
  setUid: (uid: string | null) => void;
  setProfile: (profile: PatientProfile) => void;
  updateProfile: (partial: Partial<PatientProfile>) => void;
  clearStore: () => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  uid: null,
  profile: null,

  setUid: (uid) => set({ uid }),

  setProfile: (profile) => set({ profile }),

  updateProfile: (partial) => {
    const current = get().profile;
    if (current) set({ profile: { ...current, ...partial } });
  },

  clearStore: () => set({ uid: null, profile: null }),
}));
