/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LoginGateway from './components/LoginGateway';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';

type Role = 'patient' | 'doctor';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>('patient');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (selectedRole: Role, email: string) => {
    setRole(selectedRole);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole('patient');
    setUserEmail('');
  };

  if (!isLoggedIn) {
    return <LoginGateway onLogin={handleLogin} />;
  }

  return role === 'patient' ? (
    <PatientDashboard onLogout={handleLogout} />
  ) : (
    <DoctorDashboard onLogout={handleLogout} />
  );
}
