import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import ScoreGauge from '../components/ScoreGauge';
import VerdictBadge from '../components/VerdictBadge';

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function typeLabel(type) {
  switch (type) {
    case 'url': return 'URL';
    case 'ip': return 'IP Address';
    case 'hash': return 'File Hash';
    default: return type;
  }
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/analyze" replace />;
  }

  const { id, type, value, score, verdict, explanation, factors, confidence, source, timestamp } = result;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="page-title">Analysis Result</h1>
        <p className="page-subtitle">Threat assessment complete</p>
      </div>

      <div className="stack">
        {/* Score display */}
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <ScoreGauge score={score} verdict={verdict} size={160} />
          <div style={{ marginTop: 'var(--space-md)' }}>
            <VerdictBadge verdict={verdict} />
          </div>
        </div>

        {/* Indicator info */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Indicator</span>
            <span style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              ID: {id}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: '36px',
            }}>
              {typeLabel(type)}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--text-primary)',
              wordBreak: 'break-all',
            }}>
              {value}
            </span>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🤖 AI Explanation</span>
          </div>
          <p style={{
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
          }}>
            {explanation}
          </p>
        </div>

        {/* Risk Factors */}
        {factors && factors.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Risk Factors</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {factors.length} identified
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {factors.map((factor, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--color-high)', fontSize: '0.5rem' }}>●</span>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Details</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <MetaRow label="Confidence" value={`${confidence}%`} />
            <MetaRow label="Data Source" value={source} />
            <MetaRow label="Timestamp" value={formatTimestamp(timestamp)} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/analyze')}
            style={{ flex: 1 }}
          >
            New Analysis
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/history')}
            style={{ flex: 1 }}
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </span>
    </div>
  );
}
