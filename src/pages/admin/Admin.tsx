import { useState } from 'react';
import { adminAuth } from '../../data/adminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export function Admin() {
  const [authenticated, setAuthenticated] = useState(() => adminAuth.isAuthenticated());

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}

