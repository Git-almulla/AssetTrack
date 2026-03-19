// ============================================================
// AuthGuard — Protects routes, redirects to /login if unauthenticated
// PRD 5.1.2: Force logout on 401, redirect to login
// ============================================================

import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  // On mount, try to restore session from stored token
  useEffect(() => {
    restoreSession();
    setChecked(true);
  }, [restoreSession]);

  useEffect(() => {
    if (checked && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [checked, isAuthenticated, navigate]);

  if (!checked || !isAuthenticated) {
    // Show nothing while checking auth — prevents flash
    return null;
  }

  return <>{children}</>;
}
