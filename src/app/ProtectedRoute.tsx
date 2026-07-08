import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/features/auth';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Mientras resolvemos la sesión no decidimos nada; el skeleton/Suspense se añade en el paso siguiente.
  if (loading) {
    return null;
  }

  // No existe página de login todavía: los no autenticados vuelven a la home.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
