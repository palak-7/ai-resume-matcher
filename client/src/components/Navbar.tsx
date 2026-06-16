import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ChevronDown, Settings, LayoutDashboard, LogOut, History } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'

const Navbar = () => {
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800 px-6 py-3.5">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <div
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer"
                >
                    {/* Light mode */}
                    <img
                        src="/logo-light.svg"
                        alt="AI Resume Matcher"
                        className="h-12 w-auto block dark:hidden"
                    />
                    {/* Dark mode */}
                    <img
                        src="/logo-dark.svg"
                        alt="AI Resume Matcher"
                        className="h-12 w-auto hidden dark:block"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">

                    {/* History */}
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <History size={15} />
                        <span className="hidden sm:inline">History</span>
                    </button>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {/* User dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {initial}
                            </div>
                            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                                {user?.name}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1.5 z-50">

                                {/* User info */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={() => { navigate('/dashboard'); setDropdownOpen(false) }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                                >
                                    <LayoutDashboard size={15} className="text-gray-400" />
                                    Dashboard
                                </button>

                                <button
                                    onClick={() => { navigate('/settings'); setDropdownOpen(false) }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                                >
                                    <Settings size={15} className="text-gray-400" />
                                    Settings
                                </button>

                                <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                                    <button
                                        onClick={() => { logout(); setDropdownOpen(false) }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2.5 transition-colors"
                                    >
                                        <LogOut size={15} className="text-red-400" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar