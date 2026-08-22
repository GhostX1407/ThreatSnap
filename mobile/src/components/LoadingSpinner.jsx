export default function LoadingSpinner({ size = 40, message = 'Analyzing...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-md)',
      padding: 'var(--space-2xl) 0',
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth="3"
        />
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="60"
        />
      </svg>
      {message && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {message}
        </p>
      )}
    </div>
  );
}
