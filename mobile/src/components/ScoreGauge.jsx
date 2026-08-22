import { getVerdictColor, getVerdictLabel } from './VerdictBadge';

/**
 * Circular score gauge with animated ring and verdict coloring.
 * score: 0-100, verdict: 'low_risk' | 'medium_risk' | 'high_risk'
 */
export default function ScoreGauge({ score, verdict, size = 160 }) {
  const color = getVerdictColor(verdict);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-sm)',
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-primary)"
            strokeWidth="8"
          />
          {/* Score ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              transition: 'stroke-dashoffset 0.8s ease',
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        {/* Score number in center */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: size * 0.25,
            fontWeight: 800,
            color: color,
            lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{
            fontSize: '0.6875rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: '4px',
          }}>
            Risk Score
          </span>
        </div>
      </div>
      <span style={{
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {getVerdictLabel(verdict)}
      </span>
    </div>
  );
}
