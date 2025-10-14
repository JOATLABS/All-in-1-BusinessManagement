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
  token: string;
  user: { email: string; role: 'superadmin' | 'admin' | 'staff' };
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const result = await apiFetch<LoginResponse, LoginPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password }
  });

  return { token: result.token, email: result.user.email, role: result.user.role };
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
