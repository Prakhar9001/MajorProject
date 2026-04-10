import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { PatientProfile } from '../store/usePatientStore';

export const defaultPatientProfile: PatientProfile = {
  name: '',
  age: 0,
  gender: '',
  bloodType: '',
  allergies: [],
  activeMedications: [],
  recentVitals: {},
  doctorUid: null,
};

export async function getPatient(uid: string): Promise<PatientProfile | null> {
  const snap = await getDoc(doc(db, 'patients', uid));
  return snap.exists() ? (snap.data() as PatientProfile) : null;
}

export async function savePatient(uid: string, data: Partial<PatientProfile>): Promise<void> {
  await setDoc(
    doc(db, 'patients', uid),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function createPatientDoc(uid: string, name: string): Promise<void> {
  await setDoc(doc(db, 'patients', uid), {
    ...defaultPatientProfile,
    name,
    updatedAt: new Date().toISOString(),
  });
}
