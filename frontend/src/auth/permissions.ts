type UserRole = 'superadmin' | 'admin' | 'staff';

interface User {
  email: string;
  role: UserRole;
}

/**
 * Check if user has one of the specified roles
 */
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

/**
 * Check if user is a superadmin
 */
export const isSuperadmin = (user: User | null): boolean => {
  return hasRole(user, ['superadmin']);
};

/**
 * Check if user can manage other admin users
 * Only superadmins can create, edit, and delete users
 */
export const canManageUsers = (user: User | null): boolean => {
  return isSuperadmin(user);
};

/**
 * Check if user can edit site configuration
 * Superadmins and admins can edit, staff cannot
 */
export const canEditContent = (user: User | null): boolean => {
  return hasRole(user, ['superadmin', 'admin']);
};

/**
 * Check if user can manage events
 * Superadmins and admins can manage events, staff can only view
 */
export const canManageEvents = (user: User | null): boolean => {
  return hasRole(user, ['superadmin', 'admin']);
};

/**
 * Check if user can edit reservations
 * Superadmins and admins can edit, staff can only view
 */
export const canEditReservations = (user: User | null): boolean => {
  return hasRole(user, ['superadmin', 'admin']);
};

/**
 * Check if user can view reservations
 * All authenticated users can view reservations
 */
export const canViewReservations = (user: User | null): boolean => {
  return hasRole(user, ['superadmin', 'admin', 'staff']);
};

/**
 * Get user's display role label
 */
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    superadmin: 'Owner',
    admin: 'Manager',
    staff: 'Staff'
  };
  return labels[role];
};

/**
 * Get role color for badges
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    superadmin: '#9333ea', // Purple
    admin: '#3b82f6', // Blue
    staff: '#10b981' // Green
  };
  return colors[role];
};
