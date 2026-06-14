import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff, Sparkles } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registerMutation.mutateAsync({ name, email, password })
      navigate('/dashboard')
    } catch { /* error registerMutation se aayega */ }
  }

  const error = registerMutation.error as any

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand (identical to Login) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow accent */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            AI Resume Matcher
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your next job starts<br />
            <span className="text-blue-400">with one upload.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            AI-powered resume analysis that shows exactly where you stand — before you even apply.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[
              { value: '85%', label: 'match accuracy' },
              { value: '3x', label: 'more interviews' },
              { value: '10s', label: 'to analyse' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-slate-500 text-xs">
            "Know your gaps. Fix them. Get hired."
          </p>
        </div>
      </div>

      {/* ── Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">AI Resume Matcher</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Start matching your resume today — it's free.
          </p>

          {/* Error */}
          {registerMutation.isError && (
            <div className="px-4 py-3 rounded-xl mb-5 text-sm border flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <span className="mt-0.5">⚠</span>
              <span>{error?.response?.data?.message || 'Registration failed'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                placeholder="Palak Sehgal"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                  placeholder="Min 6 characters, uppercase + number"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-500 transition-colors">
              ← Back to home
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register