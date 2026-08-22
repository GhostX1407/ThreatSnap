import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireSenior = false }) {
  const { isAuthenticated, isSenior } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSenior && !isSenior) {
    return (
      <div className="page animate-in">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-2xl) var(--space-md)',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔒</span>
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)', maxWidth: '300px' }}>
            This section requires <strong style={{ color: 'var(--accent-cyan)' }}>senior analyst</strong> privileges.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
