import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { createAdminUser, updateAdminUser, type AdminUser } from '../../services/adminUserService';

interface UserFormModalProps {
  user: AdminUser | null;
  isCreating: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const UserFormModal = ({ user, isCreating, onClose, onSaved }: UserFormModalProps) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || ('admin' as 'superadmin' | 'admin' | 'staff'),
    isActive: user?.isActive ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isCreating) {
        if (!formData.password) {
          setError('Password is required');
          setIsSubmitting(false);
          return;
        }

        await createAdminUser(token, {
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined
        });
      } else if (user) {
        await updateAdminUser(token, user.id, {
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          role: formData.role,
          isActive: formData.isActive
        });
      }

      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save user';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          maxWidth: '32rem',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: '#e5e7eb'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600', color: '#f3f4f6' }}>
          {isCreating ? 'Add User' : 'Edit User'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isCreating && (
              <>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #4b5563',
                      backgroundColor: '#374151',
                      color: '#e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #4b5563',
                      backgroundColor: '#374151',
                      color: '#e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Minimum 8 characters, must include uppercase, lowercase, and number
                  </span>
                </label>
              </>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>First Name</span>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#e5e7eb',
                  fontSize: '0.875rem'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>Last Name</span>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#e5e7eb',
                  fontSize: '0.875rem'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>
                Role <span style={{ color: '#ef4444' }}>*</span>
              </span>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                required
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #4b5563',
                  backgroundColor: '#374151',
                  color: '#e5e7eb',
                  fontSize: '0.875rem'
                }}
              >
                <option value="superadmin">Owner (Full Access)</option>
                <option value="admin">Manager (Operations Access)</option>
                <option value="staff">Staff (Read-Only)</option>
              </select>
            </label>

            {!isCreating && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#f3f4f6' }}>Active</span>
              </label>
            )}

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#374151',
                  color: '#e5e7eb',
                  border: '1px solid #4b5563',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? 'Saving...' : isCreating ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
