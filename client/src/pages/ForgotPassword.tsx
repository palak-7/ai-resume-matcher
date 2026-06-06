import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSent(true)
        } catch {
            setSent(true) // Always show success — security best practice
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot password</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    Enter your email and we'll send a reset link
                </p>

                {sent ? (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-700 dark:text-green-400">
                        If that email exists, a reset link has been sent. Check your inbox.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-gray-500 mt-4">
                    <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword