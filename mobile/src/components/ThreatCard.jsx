import VerdictBadge, { getVerdictColor } from './VerdictBadge';

function typeIcon(type) {
  switch (type) {
    case 'url': return '🔗';
    case 'ip': return '🌐';
    case 'hash': return '#️⃣';
    default: return '❓';
  }
}

function formatTimestamp(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function ThreatCard({ threat, onClick }) {
  const { type, value, score, verdict, confidence, source, timestamp } = threat;
  const color = getVerdictColor(verdict);

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `3px solid ${color}`,
        padding: 'var(--space-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: '1.125rem' }}>{typeIcon(type)}</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--text-primary)',
            wordBreak: 'break-all',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'inline-block',
          }}>
            {value}
          </span>
        </div>
        <VerdictBadge verdict={verdict} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        marginTop: 'var(--space-sm)',
      }}>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score
          </span>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: '1.125rem' }}>
            {score}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confidence
          </span>
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {confidence}%
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Source
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {source}
          </p>
        </div>
      </div>

      {timestamp && (
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
          {formatTimestamp(timestamp)}
        </p>
      )}
    </div>
  );
}
