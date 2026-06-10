import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

const Settings = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm')
            return
        }

        setLoading(true)
        setError('')

        try {
            await api.delete('/auth/delete-account')
            logout()
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Account Settings
                </h2>

                {/* Profile info */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <span className="text-gray-900 dark:text-white font-medium">{user?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="text-gray-900 dark:text-white font-medium">{user?.email}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Verified</span>
                            <span className={`font-medium text-sm ${user?.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                {user?.isVerified ? '✓ Verified' : '⚠ Not verified'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Danger zone */}
                <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Permanently delete your account and all data — resumes, analyses, everything. This cannot be undone.
                    </p>

                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        >
                            Delete my account
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">
                                    This will permanently delete:
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-2">
                                    <li>• Your account and profile</li>
                                    <li>• All uploaded resumes</li>
                                    <li>• All analysis history</li>
                                    <li>• All saved data</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type <span className="font-bold text-red-600">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            {error && (
                                <p className="text-red-600 text-xs">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || confirmText !== 'DELETE'}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Deleting...' : 'Yes, delete everything'}
                                </button>
                                <button
                                    onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings