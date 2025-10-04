import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

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
            className={({ isActive }) =>
              `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
            }
            onClick={handleCloseNav}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/site-configuration"
            className={({ isActive }) =>
              `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`
            }
            onClick={handleCloseNav}
          >
            Site Configuration
          </NavLink>
        </nav>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__header">
          <button className="admin-shell__menu-toggle" type="button" onClick={handleToggleNav}>
            {navOpen ? 'Close menu' : 'Menu'}
          </button>
          <div className="admin-shell__header-right">
            <span className="admin-shell__user">{user?.email}</span>
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
