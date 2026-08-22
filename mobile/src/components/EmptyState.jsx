export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl) var(--space-md)',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>{icon}</span>
      <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
        {title}
      </h3>
      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '280px' }}>
          {message}
        </p>
      )}
    </div>
  );
}
