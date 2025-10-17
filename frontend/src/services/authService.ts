import { apiFetch } from './apiClient';

export interface AuthResponse {
  token: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: 'superadmin' | 'admin' | 'staff';
    firstName: string | null;
    lastName: string | null;
  };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const result = await apiFetch<LoginResponse, LoginPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  // Store refresh token in sessionStorage for token refresh flow
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('ojaplus-refresh-token', result.refreshToken);
  }

  return { token: result.accessToken, email: result.user.email, role: result.user.role };
};

export const logout = async (token: string | null) => {
  if (!token) {
    return;
  }

  await apiFetch<void, undefined>('/api/v1/auth/logout', {
    method: 'POST',
    token
  });
};
