import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useRegister } from '../hooks/useAuth'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Start matching your resume today</p>

        {registerMutation.isError && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error?.response?.data?.message || 'Registration failed'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Palak Sehgal"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Min 6 characters, uppercase + number"
              required
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register