import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export const AdminLogin = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
  }, [email, password]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setLocalError('Enter your credentials to continue');
      return;
    }

    try {
      await login(email, password);
      const from = (location.state as { from?: Location } | undefined)?.from;
      navigate(from?.pathname ?? '/admin', { replace: true });
    } catch (authError) {
      if (authError instanceof Error) {
        setLocalError(authError.message);
      } else {
        setLocalError('Unable to sign in at the moment');
      }
    }
  };

  const message = localError ?? error;

  return (
    <div className="admin-login">
      <section className="admin-login__panel">
        <div className="admin-login__brand">
          <span className="admin-login__logo">OjaPlus Console</span>
          <p className="admin-login__tagline">Curate the experience. Power the night.</p>
        </div>

        <header className="admin-login__header">
          <p className="admin-login__eyebrow">Restricted access</p>
          <h1>Sign in</h1>
          <p className="admin-login__intro">
            Enter the credentials provisioned for your promoter or operations account to manage the customer-facing site and
            upcoming experiences.
          </p>
        </header>

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <label className="admin-login__field">
            Email
            <input
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="admin-login__field">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="admin-login__error" role="alert">{message}</p> : null}
          <button className="admin-login__submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Enter console'}
          </button>
        </form>

        <p className="admin-login__aux">
          Need access? Contact the <a href="mailto:operations@ojaplusclub.com">operations team</a> to provision an account.
        </p>
        <p className="admin-login__aux">
          <Link to="/">Return to public site</Link>
        </p>
      </section>

      <section className="admin-login__background" aria-hidden="true">
        <div className="admin-login__halo" />
        <div className="admin-login__noise" />
        <div className="admin-login__motif">DRINK · DINE · DANCE</div>
      </section>
    </div>
  );
};
