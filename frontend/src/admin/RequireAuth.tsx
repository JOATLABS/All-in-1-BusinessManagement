import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

