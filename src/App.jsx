import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import Rankings from './pages/Rankings'
import History from './pages/History'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
          <Route path="/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
