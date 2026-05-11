import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading-screen" id="auth-loading">
        <div className="auth-loading-spinner" />
        <p className="text-body" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-lg)' }}>
          Verifying session...
        </p>
      </div>
    )
  }

  if (!user) {
    // Save the attempted location so we can redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}
