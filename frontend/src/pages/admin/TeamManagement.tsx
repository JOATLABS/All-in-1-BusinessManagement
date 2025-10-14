import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getRoleLabel } from '../../auth/permissions';
import {
  listAdminUsers,
  deactivateAdminUser,
  type AdminUser,
  type ListAdminUsersFilters
} from '../../services/adminUserService';
import { UserFormModal } from './UserFormModal';

export const TeamManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListAdminUsersFilters>({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await listAdminUsers(token, filters);
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreatingUser(true);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsCreatingUser(false);
    setIsModalOpen(true);
  };

  const handleDeactivateUser = async (user: AdminUser) => {
    if (!token) return;

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.firstName || user.email}? They will no longer be able to log in.`
    );

    if (!confirmed) return;

    try {
      await deactivateAdminUser(token, user.id);
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate user';
      alert(message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsCreatingUser(false);
  };

  const handleUserSaved = async () => {
    await loadUsers();
    handleModalClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section>
      <header className="admin-config__header">
        <div>
          <p className="admin-config__eyebrow">Team</p>
          <h1>Admin User Management</h1>
          <p className="admin-config__intro">
            Manage admin accounts, assign roles, and control access to the operations dashboard.
          </p>
        </div>
      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by role:</span>
          <select
            value={filters.role || ''}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as any || undefined })}
            style={{
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All roles</option>
            <option value="superadmin">Owner</option>
            <option value="admin">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Filter by status:</span>
          <select
            value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
            onChange={(e) =>
              setFilters({
                ...filters,
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              })
            }
            style={{
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleCreateUser}
          style={{
            marginLeft: 'auto',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Add User
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.25rem'
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found matching the selected filters.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#1f2937',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              color: '#e5e7eb'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#374151', borderBottom: '1px solid #4b5563' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Name
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Email
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Role
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Last Login
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Status
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #4b5563' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#e5e7eb' }}>
                    {user.firstName || user.lastName
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#e5e7eb' }}>{user.email}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#e5e7eb' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: user.role === 'superadmin' ? '#ddd6fe' : user.role === 'admin' ? '#dbeafe' : '#d1fae5',
                        color: user.role === 'superadmin' ? '#6b21a8' : user.role === 'admin' ? '#1e40af' : '#065f46'
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#e5e7eb' }}>
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#e5e7eb' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: user.isActive ? '#d1fae5' : '#fee2e2',
                        color: user.isActive ? '#065f46' : '#991b1b'
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleEditUser(user)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        marginRight: '0.5rem',
                        backgroundColor: 'transparent',
                        color: '#60a5fa',
                        border: '1px solid #60a5fa',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    {user.isActive && (
                      <button
                        type="button"
                        onClick={() => handleDeactivateUser(user)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'transparent',
                          color: '#f87171',
                          border: '1px solid #f87171',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <UserFormModal
          user={selectedUser}
          isCreating={isCreatingUser}
          onClose={handleModalClose}
          onSaved={handleUserSaved}
        />
      )}
    </section>
  );
};
