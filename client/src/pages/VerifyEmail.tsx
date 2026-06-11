import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useVerifyEmail } from '../hooks/useAuth'

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const verifyEmailMutation = useVerifyEmail()
    const navigate = useNavigate()
    const { isAuthenticated, refreshUser } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            return
        }

        verifyEmailMutation.mutate(token, {
            onSuccess: async () => {
                if (isAuthenticated) {
                    await refreshUser()
                }
            },
        })
    }, [isAuthenticated, refreshUser, searchParams])
    const token = searchParams.get('token')

    const status =
        !token
            ? 'error'
            : verifyEmailMutation.isPending
                ? 'loading'
                : verifyEmailMutation.isSuccess
                    ? 'success'
                    : verifyEmailMutation.isError
                        ? 'error'
                        : 'loading'
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Verifying your email...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h2>
                        <p className="text-gray-500 text-sm mb-6">Your account is now active.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-4xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h2>
                        <p className="text-gray-500 text-sm mb-6">Link is invalid or expired.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default VerifyEmail
