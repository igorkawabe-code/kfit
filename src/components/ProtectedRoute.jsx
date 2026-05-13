import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="text-accent font-display text-3xl tracking-widest animate-pulse">KFIT</div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user && !profile) return <Navigate to="/setup" replace />

  return children
}
