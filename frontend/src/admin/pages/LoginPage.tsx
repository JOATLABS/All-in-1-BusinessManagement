import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';

export const LoginPage = () => {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/admin/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    void login({ email: form.email, password: form.password })
      .then((success) => {
        if (success) {
          navigate(redirectPath, { replace: true });
          return;
        }
        setError('The credentials you entered do not match our records.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="admin-login">
      <div className="admin-login__panel">
        <h1>OjaPlus Business Access</h1>
        <p>Sign in to manage events, visuals, and venue operations.</p>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="admin@ojaplusclub.com"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="••••••••"
            />
          </label>
          {error && <p className="admin-login__error">{error}</p>}
          <button type="submit" className="admin-login__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="admin-login__hint">Demo credentials: admin@ojaplusclub.com / admin123!</p>
      </div>
    </div>
  );
};

