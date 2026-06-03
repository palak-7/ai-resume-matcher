import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'

const Navbar = () => {
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()

    return (
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
    )
}

export default Navbar