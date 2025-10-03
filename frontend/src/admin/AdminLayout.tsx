import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { SiteContent } from '../types/content';
import { useAdminAuth } from './AdminAuthContext';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/site-configuration', label: 'Site Configuration' }
];

export const AdminLayout = ({ siteContent }: { siteContent: SiteContent }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">OjaPlus Business</div>
        <nav className="admin-shell__nav" aria-label="Admin navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `admin-shell__nav-link${isActive ? ' admin-shell__nav-link--active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-shell__main">
        <header className="admin-shell__header">
          <div>
            <h1>Business Platform</h1>
            <p>Manage the customer-facing experience and upcoming programming.</p>
          </div>
          <button type="button" className="admin-shell__logout" onClick={handleLogout}>
            Sign out
          </button>
        </header>
        <section className="admin-shell__content">
          <Outlet context={{ siteContent }} />
        </section>
      </main>
    </div>
  );
};

