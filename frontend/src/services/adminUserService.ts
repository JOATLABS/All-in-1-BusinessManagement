import { apiFetch } from './apiClient';

export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface ListAdminUsersResponse {
  users: AdminUser[];
}

export interface GetAdminUserResponse {
  user: AdminUser;
}

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'staff';
  firstName?: string;
  lastName?: string;
}

export interface UpdateAdminUserPayload {
  firstName?: string;
  lastName?: string;
  role?: 'superadmin' | 'admin' | 'staff';
  isActive?: boolean;
}

export interface ListAdminUsersFilters {
  role?: 'superadmin' | 'admin' | 'staff';
  isActive?: boolean;
}

export const listAdminUsers = async (token: string, filters?: ListAdminUsersFilters): Promise<AdminUser[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.role) {
    queryParams.append('role', filters.role);
  }
  if (typeof filters?.isActive === 'boolean') {
    queryParams.append('isActive', filters.isActive ? 'true' : 'false');
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/v1/admin/users?${queryString}` : '/api/v1/admin/users';

  const response = await apiFetch<ListAdminUsersResponse>(url, {
    method: 'GET',
    token
  });

  return response.users;
};

export const getAdminUser = async (token: string, id: string): Promise<AdminUser> => {
  const response = await apiFetch<GetAdminUserResponse>(`/api/v1/admin/users/${id}`, {
    method: 'GET',
    token
  });

  return response.user;
};

export const createAdminUser = async (token: string, data: CreateAdminUserPayload): Promise<AdminUser> => {
  const response = await apiFetch<GetAdminUserResponse, CreateAdminUserPayload>('/api/v1/admin/users', {
    method: 'POST',
    token,
    body: data
  });

  return response.user;
};

export const updateAdminUser = async (
  token: string,
  id: string,
  data: UpdateAdminUserPayload
): Promise<AdminUser> => {
  const response = await apiFetch<GetAdminUserResponse, UpdateAdminUserPayload>(`/api/v1/admin/users/${id}`, {
    method: 'PATCH',
    token,
    body: data
  });

  return response.user;
};

export const deactivateAdminUser = async (token: string, id: string): Promise<AdminUser> => {
  const response = await apiFetch<GetAdminUserResponse>(`/api/v1/admin/users/${id}`, {
    method: 'DELETE',
    token
  });

  return response.user;
};
