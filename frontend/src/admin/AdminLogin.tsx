import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';

interface AdminLoginProps {
  brand: string;
  tagline: string;
}

export const AdminLogin = ({ brand, tagline }: AdminLoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!email || !password) {
      setError('Enter your email address and password to continue.');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      navigate('/admin');
    }, 450);
  };

  return (
    <main className="admin-login">
      <section className="admin-login__panel" aria-labelledby="admin-login-title">
        <div className="admin-login__brand">
          <span className="admin-login__logo" aria-label={`${brand} admin`}>
            {brand}
          </span>
          <p className="admin-login__tagline">{tagline}</p>
        </div>
        <header className="admin-login__header">
          <p className="admin-login__eyebrow">Business Platform</p>
          <h1 id="admin-login-title">Sign in to manage the experience</h1>
          <p className="admin-login__intro">
            Access hero backgrounds, event schedules, reservations, and partner enquiries from one control centre.
          </p>
        </header>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              placeholder="promoter@ojaplusclub.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="admin-login__field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your secure passphrase"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="admin-login__error">{error}</p>}
          <button type="submit" className="admin-login__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
        <p className="admin-login__aux">
          <Link to="/">Return to customer experience</Link>
        </p>
      </section>
      <aside className="admin-login__background" aria-hidden="true">
        <div className="admin-login__halo" />
        <div className="admin-login__noise" />
        <p className="admin-login__motif">Nightlife, orchestrated.</p>
      </aside>
    </main>
  );
};
