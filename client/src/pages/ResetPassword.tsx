import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPassword } from '../hooks/useAuth'

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()
    const token = searchParams.get('token')
    const resetPasswordMutation = useResetPassword()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setError("");

        try {
            await resetPasswordMutation.mutateAsync({
                token: token || "",
                newPassword: password,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Reset failed — link may have expired"
            );
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md text-center">
                    <div className="text-4xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
                    <p className="text-gray-500 text-sm mb-6">You can now login with your new password.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset password</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Enter your new password</p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Same password again"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword