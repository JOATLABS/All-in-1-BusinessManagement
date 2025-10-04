import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as authenticate, logout as signOut } from '../services/authService';

interface AuthUser {
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const storageKey = 'ojaplus-admin-auth';

const readStoredAuth = (): AuthState => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const stored = sessionStorage.getItem(storageKey);
  if (!stored) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(stored) as AuthState;
  } catch (error) {
    console.warn('Failed to parse stored auth state', error);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => readStoredAuth());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistState = useCallback((next: AuthState) => {
    setState(next);
    if (typeof window !== 'undefined') {
      if (next.token) {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authenticate(email, password);
      persistState({ token: result.token, user: { email: result.email } });
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to authenticate';
      setError(message);
      persistState({ token: null, user: null });
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [persistState]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut();
    } finally {
      setIsLoading(false);
      persistState({ token: null, user: null });
    }
  }, [persistState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(state.token),
      isLoading,
      error,
      user: state.user,
      login,
      logout
    }),
    [error, isLoading, login, logout, state.token, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
