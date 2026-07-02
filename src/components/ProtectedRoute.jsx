import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Spinner from './Spinner'

function getLoginPath(allowedRole) {
  if (allowedRole === 'admin') {
    return '/admin/login'
  }

  return '/doctor/login'
}

function ProtectedRoute({ children, allowedRole }) {
  const { role, loading, isAuthenticated } = useAuth()

  if (loading) {
    return <Spinner centered label="Verificando acceso" description="Un momento por favor." />
  }

  if (!isAuthenticated) {
    return <Navigate to={getLoginPath(allowedRole)} replace />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
