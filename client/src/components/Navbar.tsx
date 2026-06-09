import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { useState } from 'react'
import toast from "react-hot-toast";
import api from "../services/api";

const Navbar = () => {
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate()
    const handleResendVerification = async () => {
        try {
            setIsSending(true);

            const res = await api.post("/auth/resend-verification");

            toast.success(res.data.message);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send verification email"
            );
        } finally {
            setIsSending(false);
        }
    };
    return (
        <div>
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h1
                    onClick={() => navigate('/dashboard')}
                    className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:opacity-80"
                >
                    AI Resume Matcher
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Hi, {user?.name}
                    </span>
                    <button
                        onClick={() => navigate('/history')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        History
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="text-lg hover:opacity-70 transition-opacity"
                        title="Toggle dark mode"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <button
                        onClick={logout}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            {user && !user.isVerified && (
                <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-amber-600">⚠️</span>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Please verify your email to unlock all features.
                        </p>
                    </div>

                    <button
                        onClick={handleResendVerification}
                        disabled={isSending}
                        className="px-3 py-1.5 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isSending ? "Sending..." : "Resend Email"}
                    </button>
                </div>
            )}
        </div>
    )
}

export default Navbar