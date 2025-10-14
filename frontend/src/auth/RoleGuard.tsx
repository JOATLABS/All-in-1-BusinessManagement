import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { hasRole } from './permissions';

type UserRole = 'superadmin' | 'admin' | 'staff';

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on user's role
 *
 * @param roles - Array of roles that can see the children
 * @param children - Content to render if user has required role
 * @param fallback - Optional content to render if user doesn't have required role
 *
 * @example
 * <RoleGuard roles={['superadmin']}>
 *   <button>Delete User</button>
 * </RoleGuard>
 */
export const RoleGuard = ({ roles, children, fallback = null }: RoleGuardProps) => {
  const { user } = useAuth();

  if (!hasRole(user, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
