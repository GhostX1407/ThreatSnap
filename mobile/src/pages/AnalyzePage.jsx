import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyzeThreat } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TYPES = [
  { value: 'url', label: 'URL', placeholder: 'https://suspicious-site.com/login', icon: '🔗' },
  { value: 'ip', label: 'IP Address', placeholder: '192.168.1.100', icon: '🌐' },
  { value: 'hash', label: 'File Hash', placeholder: 'e99a18c428cb38d5f260853678922e03', icon: '#️⃣' },
];

export default function AnalyzePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('url');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');

  const currentType = TYPES.find(t => t.value === type);

  const validate = () => {
    if (!value.trim()) {
      setFormError('Please enter a threat indicator value');
      return false;
    }

    if (type === 'url') {
      try {
        new URL(value.trim());
      } catch {
        setFormError('Please enter a valid URL (include http:// or https://)');
        return false;
      }
    }

    if (type === 'ip') {
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(value.trim())) {
        setFormError('Please enter a valid IPv4 address (e.g., 192.168.1.1)');
        return false;
      }
    }

    if (type === 'hash') {
      const hashPattern = /^[a-fA-F0-9]{32,128}$/;
      if (!hashPattern.test(value.trim())) {
        setFormError('Please enter a valid MD5, SHA-1, or SHA-256 hash');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await analyzeThreat(token, type, value.trim());
      navigate('/result', { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page animate-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '320px',
        }}>
          <LoadingSpinner size={56} message="" />
          <h3 style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
            Analyzing Threat
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Running AI risk scoring and generating explanation...
          </p>
          <div style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
          }}>
            {currentType.icon} {value.trim()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="page-title">Analyze Threat</h1>
        <p className="page-subtitle">Submit a threat indicator for AI-powered risk assessment</p>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

        {/* Type selector */}
        <div className="form-group">
          <label className="form-label">Indicator Type</label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setType(t.value); setFormError(''); }}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: type === t.value ? 'var(--accent-cyan-dim)' : 'var(--bg-card)',
                  border: `1.5px solid ${type === t.value ? 'var(--accent-cyan)' : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: type === t.value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Value input */}
        <div className="form-group">
          <label className="form-label" htmlFor="threat-value">
            {currentType.label} Value
          </label>
          <input
            id="threat-value"
            className={`form-input ${formError ? 'error' : ''}`}
            type="text"
            placeholder={currentType.placeholder}
            value={value}
            onChange={e => { setValue(e.target.value); setFormError(''); }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
            autoComplete="off"
            spellCheck="false"
          />
          {formError && <p className="form-error">{formError}</p>}
        </div>

        {/* Info card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          <p>
            <strong style={{ color: 'var(--text-secondary)' }}>How it works:</strong> Your indicator is sent to our AI scoring engine which evaluates risk using heuristic analysis and threat intelligence feeds. A GenAI model then generates a human-readable explanation of the verdict.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={!value.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Analyze Threat
        </button>
      </form>
    </div>
  );
}
