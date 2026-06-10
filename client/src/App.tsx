import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analyse from './pages/Analyse'
import { useAuth } from './context/useAuth'
import History from './pages/History'
import GitHubCallback from './pages/GitHubCallback'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'

// Navbar sirf logged-in pages pe dikhao
const AppLayout = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const hideNavbar = ['/login', '/register'].includes(location.pathname)

  return (
    <>
      {isAuthenticated && !hideNavbar && <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/analyse" element={
          <ProtectedRoute><Analyse /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><History /></ProtectedRoute>
        } />
        <Route path="/github-callback" element={<GitHubCallback />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
