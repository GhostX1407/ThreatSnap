import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!password) {
      setFormError('Password is required');
      return;
    }

    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch {
      // error is already set in AuthContext
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      background: 'var(--bg-primary)',
    }}>
      <div className="animate-in" style={{ width: '100%', maxWidth: '380px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto var(--space-md)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-cyan-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={{ marginBottom: 'var(--space-xs)' }}>
            Threat<span style={{ color: 'var(--accent-cyan)' }}>Snap</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Threat Intelligence Platform
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-lg)' }}>
          <h2 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center', fontSize: '1.125rem' }}>
            Sign in to continue
          </h2>

          {(error || formError) && (
            <div style={{
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              marginBottom: 'var(--space-md)',
              fontSize: '0.8125rem',
              color: 'var(--color-error)',
            }}>
              {formError || error}
            </div>
          )}

          <div className="stack">
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input
                id="login-username"
                className="form-input"
                type="text"
                placeholder="e.g. analyst1"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 'var(--space-sm)' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo hint */}
        <div style={{
          marginTop: 'var(--space-lg)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <p style={{ marginBottom: '4px' }}>Demo credentials:</p>
          <p>
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>analyst1</span>
            {' / '}
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>demo1234</span>
            {' '}
            <span style={{ color: 'var(--text-muted)' }}>(junior)</span>
          </p>
          <p>
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>analyst2</span>
            {' / '}
            <span className="mono" style={{ color: 'var(--text-secondary)' }}>demo1234</span>
            {' '}
            <span style={{ color: 'var(--text-muted)' }}>(senior)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
