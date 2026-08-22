import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDriftStats, getThreatHistory } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ThreatCard from '../components/ThreatCard';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const { token, username, role, isSenior } = useAuth();
  const navigate = useNavigate();

  const [threats, setThreats] = useState([]);
  const [drift, setDrift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const historyData = await getThreatHistory(token);
      setThreats(historyData.threats || []);

      if (isSenior) {
        try {
          const driftData = await getDriftStats(token);
          setDrift(driftData);
        } catch {
          // drift is optional, don't block dashboard
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const recentThreats = threats.slice(-5).reverse();

  const stats = {
    total: threats.length,
    high: threats.filter(t => t.verdict === 'high_risk').length,
    medium: threats.filter(t => t.verdict === 'medium_risk').length,
    low: threats.filter(t => t.verdict === 'low_risk').length,
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h1 className="page-title">
          Welcome, <span style={{ color: 'var(--accent-cyan)' }}>{username}</span>
        </h1>
        <p className="page-subtitle">
          {role === 'senior' ? 'Senior Analyst' : 'Junior Analyst'} Dashboard
        </p>
      </div>

      {/* Drift warning banner (senior only) */}
      {isSenior && drift && drift.drift_warning && (
        <div style={{
          background: 'var(--color-medium-bg)',
          border: '1px solid rgba(255, 165, 2, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-sm)',
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--color-medium)', fontSize: '0.875rem' }}>
              Model Drift Detected
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Latest score ({drift.latest_score}) deviates significantly from rolling average ({drift.rolling_average}).
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchData} />
      ) : (
        <div className="stack">
          {/* Quick action */}
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={() => navigate('/analyze')}
            style={{ marginBottom: 'var(--space-sm)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            New Threat Analysis
          </button>

          {/* Stats cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-sm)',
          }}>
            <StatCard label="Total Scans" value={stats.total} color="var(--accent-cyan)" />
            <StatCard label="High Risk" value={stats.high} color="var(--color-high)" />
            <StatCard label="Medium Risk" value={stats.medium} color="var(--color-medium)" />
            <StatCard label="Low Risk" value={stats.low} color="var(--color-low)" />
          </div>

          {/* Drift stats (senior only) */}
          {isSenior && drift && drift.rolling_average !== null && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">📊 Model Stats</span>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: drift.drift_warning ? 'var(--color-medium)' : 'var(--color-low)',
                  textTransform: 'uppercase',
                }}>
                  {drift.drift_warning ? 'Drift Detected' : 'Stable'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rolling Avg
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {drift.rolling_average}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Latest Score
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {drift.latest_score}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent threats */}
          <div>
            <div className="flex-between" style={{ marginBottom: 'var(--space-sm)' }}>
              <h3>Recent Analyses</h3>
              {threats.length > 5 && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => navigate('/history')}
                >
                  View All
                </button>
              )}
            </div>
            {recentThreats.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No analyses yet"
                message="Submit your first threat indicator to get started"
              />
            ) : (
              <div className="stack-sm">
                {recentThreats.map((threat, i) => (
                  <ThreatCard
                    key={threat.id || i}
                    threat={threat}
                    onClick={() => navigate('/result', { state: { result: threat } })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.5rem',
        fontWeight: 800,
        color,
        lineHeight: 1,
      }}>
        {value}
      </p>
      <p style={{
        fontSize: '0.6875rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginTop: '4px',
      }}>
        {label}
      </p>
    </div>
  );
}
