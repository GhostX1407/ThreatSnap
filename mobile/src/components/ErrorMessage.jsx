export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      background: 'var(--color-error-bg)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>⚠</span>
        <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          className="btn btn-sm btn-danger"
          onClick={onRetry}
          style={{ alignSelf: 'flex-start', marginTop: '4px' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
