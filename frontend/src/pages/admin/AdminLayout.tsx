import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { RoleGuard } from '../../auth/RoleGuard';
import { getRoleLabel, getRoleColor } from '../../auth/permissions';

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const handleToggleNav = () => {
    setNavOpen((open) => !open);
  };

  const handleCloseNav = () => {
    setNavOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-shell__nav${navOpen ? ' admin-shell__nav--open' : ''}`}>
        <div className="admin-shell__identity">
          <span className="admin-shell__logo">OjaPlus Console</span>
          <p className="admin-shell__tagline">Operations control for the nightlife experience</p>
        </div>
        <nav className="admin-shell__menu" aria-label="Admin navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }: { isActive: boolean }) =>
              `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
            }
            onClick={handleCloseNav}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/reservations"
            className={({ isActive }: { isActive: boolean }) =>
              `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
            }
            onClick={handleCloseNav}
          >
            Reservations
          </NavLink>
          <NavLink
            to="/admin/events"
            className={({ isActive }: { isActive: boolean }) =>
              `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
            }
            onClick={handleCloseNav}
          >
            Events
          </NavLink>
          <RoleGuard roles={['superadmin', 'admin']}>
            <NavLink
              to="/admin/site-configuration"
              className={({ isActive }: { isActive: boolean }) =>
                `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
              }
              onClick={handleCloseNav}
            >
              Site Configuration
            </NavLink>
          </RoleGuard>
          <RoleGuard roles={['superadmin']}>
            <NavLink
              to="/admin/team"
              className={({ isActive }: { isActive: boolean }) =>
                `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
              }
              onClick={handleCloseNav}
            >
              Team Management
            </NavLink>
          </RoleGuard>
        </nav>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__header">
          <button className="admin-shell__menu-toggle" type="button" onClick={handleToggleNav}>
            {navOpen ? 'Close menu' : 'Menu'}
          </button>
          <div className="admin-shell__header-right">
            <span className="admin-shell__user">
              {user?.email}
              {user?.role && (
                <span
                  className="admin-shell__role-badge"
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    color: '#fff',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginLeft: '0.5rem'
                  }}
                >
                  {getRoleLabel(user.role)}
                </span>
              )}
            </span>
            <button className="admin-shell__signout" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>
        <main className="admin-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
