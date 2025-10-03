import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'ojaplus-admin-session';
const DEMO_EMAIL = 'admin@ojaplusclub.com';
const DEMO_PASSWORD = 'admin123!';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'active');

  const login = useCallback(({ email, password }: { email: string; password: string }) => {
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'active');
      setIsAuthenticated(true);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

