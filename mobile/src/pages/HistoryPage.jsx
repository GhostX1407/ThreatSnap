import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getThreatHistory } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ThreatCard from '../components/ThreatCard';

export default function HistoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThreatHistory(token);
      setThreats((data.threats || []).reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredThreats = filter === 'all'
    ? threats
    : threats.filter(t => t.verdict === filter);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="page-title">Threat History</h1>
        <p className="page-subtitle">{threats.length} total analyses</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchHistory} />
      ) : threats.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No threat history"
          message="Analyses you perform will appear here"
        />
      ) : (
        <div className="stack">
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto' }}>
            {[
              { value: 'all', label: 'All' },
              { value: 'high_risk', label: 'High' },
              { value: 'medium_risk', label: 'Medium' },
              { value: 'low_risk', label: 'Low' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="btn btn-sm"
                style={{
                  background: filter === f.value ? 'var(--accent-cyan-dim)' : 'var(--bg-card)',
                  color: filter === f.value ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: `1px solid ${filter === f.value ? 'var(--accent-cyan)' : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Threat list */}
          {filteredThreats.length === 0 ? (
            <EmptyState
              icon="🔎"
              title={`No ${filter.replace('_', ' ')} threats`}
              message="Try a different filter"
            />
          ) : (
            <div className="stack-sm">
              {filteredThreats.map((threat, i) => (
                <ThreatCard
                  key={threat.id || i}
                  threat={threat}
                  onClick={() => navigate('/result', { state: { result: threat } })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
