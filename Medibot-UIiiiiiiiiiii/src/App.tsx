/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoginGateway from './components/LoginGateway';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ProfileEditor from './components/ProfileEditor';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Loader2 } from 'lucide-react';
import { usePatientStore } from './store/usePatientStore';
import { getPatient, createPatientDoc } from './lib/patientService';

type Role = 'patient' | 'doctor';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('patient');
  const [userEmail, setUserEmail] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { setUid, setProfile, clearStore } = usePatientStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let detectedRole: Role = 'patient';
        if (userDoc.exists()) {
          const userData = userDoc.data();
          detectedRole = userData.role as Role;
          setRole(detectedRole);
        }
        setUserEmail(user.email || '');
        setUid(user.uid);

        // Load patient profile into global store (patients only)
        if (detectedRole === 'patient') {
          let profile = await getPatient(user.uid);
          if (!profile) {
            // Brand-new patient — create empty doc, prompt setup wizard
            await createPatientDoc(user.uid, user.displayName || '');
            profile = await getPatient(user.uid);
            setShowProfileSetup(true);
          } else if (!profile.name) {
            // Existing doc but profile never completed
            setShowProfileSetup(true);
          }
          if (profile) setProfile(profile);
        }

        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        clearStore();
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (selectedRole: Role, email: string) => {
    setRole(selectedRole);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setRole('patient');
      setUserEmail('');
      setShowProfileSetup(false);
      clearStore();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0F1015] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Initializing MediSync Hub...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginGateway onLogin={handleLogin} />;
  }

  return (
    <>
      {role === 'patient' ? (
        <PatientDashboard onLogout={handleLogout} />
      ) : (
        <DoctorDashboard onLogout={handleLogout} />
      )}
      {showProfileSetup && role === 'patient' && (
        <ProfileEditor
          isFirstTime
          onClose={() => setShowProfileSetup(false)}
        />
      )}
    </>
  );
}
