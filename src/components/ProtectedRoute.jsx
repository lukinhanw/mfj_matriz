import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { usePermissions } from '../hooks/usePermissions'

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  const location = useLocation()
  const { canAccess } = usePermissions()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canAccess(location.pathname)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute