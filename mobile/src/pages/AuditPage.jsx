import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditLog } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

function actionLabel(action) {
  switch (action) {
    case 'threat_analyzed': return 'Analyzed Threat';
    default: return action;
  }
}

export default function AuditPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLog(token);
      setEntries((data.entries || []).reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Audit Log</h1>
            <p className="page-subtitle">Security event trail — senior access only</p>
          </div>
          {!loading && entries.length > 0 && (
            <button className="btn btn-sm btn-secondary" onClick={fetchAudit}>
              Refresh
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading audit log..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAudit} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No audit entries"
          message="Audit events will appear here as analysts perform threat analyses"
        />
      ) : (
        <div className="stack-sm">
          {entries.map((entry, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 'var(--space-md)',
                borderLeft: '3px solid var(--accent-cyan)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {actionLabel(entry.action)}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    by <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{entry.user}</span>
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              {entry.resource_id && (
                <div style={{
                  marginTop: 'var(--space-sm)',
                  padding: '4px 8px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}>
                    Resource: {entry.resource_id}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
