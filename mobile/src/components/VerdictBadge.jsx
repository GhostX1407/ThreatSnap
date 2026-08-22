export function getVerdictColor(verdict) {
  switch (verdict) {
    case 'high_risk': return 'var(--color-high)';
    case 'medium_risk': return 'var(--color-medium)';
    case 'low_risk': return 'var(--color-low)';
    default: return 'var(--text-muted)';
  }
}

export function getVerdictBg(verdict) {
  switch (verdict) {
    case 'high_risk': return 'var(--color-high-bg)';
    case 'medium_risk': return 'var(--color-medium-bg)';
    case 'low_risk': return 'var(--color-low-bg)';
    default: return 'var(--bg-card)';
  }
}

export function getVerdictLabel(verdict) {
  switch (verdict) {
    case 'high_risk': return 'High Risk';
    case 'medium_risk': return 'Medium Risk';
    case 'low_risk': return 'Low Risk';
    default: return 'Unknown';
  }
}

export function getVerdictIcon(verdict) {
  switch (verdict) {
    case 'high_risk': return '🔴';
    case 'medium_risk': return '🟡';
    case 'low_risk': return '🟢';
    default: return '⚪';
  }
}

export default function VerdictBadge({ verdict }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: getVerdictColor(verdict),
      background: getVerdictBg(verdict),
      border: `1px solid ${getVerdictColor(verdict)}30`,
    }}>
      {getVerdictIcon(verdict)}
      {getVerdictLabel(verdict)}
    </span>
  );
}
