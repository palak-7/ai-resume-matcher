import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'

const Navbar = () => {
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Bahar click karne pe dropdown band karo
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h1
                onClick={() => navigate('/dashboard')}
                className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:opacity-80"
            >
                AI Resume Matcher
            </h1>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/history')}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                    History
                </button>

                <button
                    onClick={toggleTheme}
                    className="text-lg hover:opacity-70 transition-opacity"
                >
                    {isDark ? '☀️' : '🌙'}
                </button>

                {/* Username dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        {/* Avatar circle */}
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user?.name}</span>
                        <span className="text-gray-400 text-xs">{dropdownOpen ? '▲' : '▼'}</span>
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                            {/* User info */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Menu items */}
                            <button
                                onClick={() => { navigate('/settings'); setDropdownOpen(false) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <span>⚙️</span> Settings
                            </button>

                            <button
                                onClick={() => { navigate('/dashboard'); setDropdownOpen(false) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <span>📊</span> Dashboard
                            </button>

                            <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                                <button
                                    onClick={() => { logout(); setDropdownOpen(false) }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
                                >
                                    <span>🚪</span> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar