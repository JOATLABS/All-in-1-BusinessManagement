import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  brand: string;
  tagline: string;
}

export const AdminLayout = ({ brand, tagline }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleSignOut = () => {
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-shell__nav${isNavOpen ? ' admin-shell__nav--open' : ''}`}>
        <div className="admin-shell__identity">
          <span className="admin-shell__logo">{brand}</span>
          <p className="admin-shell__tagline">{tagline}</p>
        </div>
        <nav id="admin-nav" className="admin-shell__menu" aria-label="Admin navigation">
          <NavLink end to="/admin" className={({ isActive }) => `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/site"
            className={({ isActive }) => `admin-shell__link${isActive ? ' admin-shell__link--active' : ''}`}
          >
            Site configuration
          </NavLink>
        </nav>
      </aside>
      <div className="admin-shell__main">
        <header className="admin-shell__header">
          <button
            type="button"
            className="admin-shell__menu-toggle"
            onClick={() => setIsNavOpen((state) => !state)}
            aria-expanded={isNavOpen}
            aria-controls="admin-nav"
          >
            Menu
          </button>
          <div className="admin-shell__header-right">
            <button type="button" className="admin-shell__signout" onClick={handleSignOut}>
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
