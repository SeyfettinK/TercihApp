import { Navigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, profile } = useStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !profile?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

