import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings2, CheckCircle, AlertCircle, Trash2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDeleteAccount } from '../hooks/useAuth'

const Settings = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [error, setError] = useState('')
    const deleteMutation = useDeleteAccount()

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm')
            return
        }
        setError('')
        try {
            await deleteMutation.mutateAsync()
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* ── Hero banner — same dark navy gradient as Dashboard & History */}
            <div
                className="relative overflow-hidden px-6 py-10"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <div
                    className="absolute top-0 right-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
                />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Settings2 size={15} className="text-blue-400" />
                        <span className="text-slate-400 text-sm">Manage your account</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                </div>
            </div>

            {/* ── Content */}
            <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">

                {/* ── Profile card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Profile</h2>
                    </div>

                    <div className="space-y-1">
                        {[
                            { label: 'Name', value: user?.name },
                            { label: 'Email', value: user?.email },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                            </div>
                        ))}

                        {/* Verified row */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-sm text-gray-400 dark:text-gray-500">Verified</span>
                            {user?.isVerified ? (
                                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                                    <CheckCircle size={14} />
                                    Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm font-medium text-amber-500 dark:text-amber-400">
                                    <AlertCircle size={14} />
                                    Not verified
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Danger zone */}
                <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={15} className="text-red-500" />
                        <h2 className="font-semibold text-red-600 dark:text-red-400 text-sm">Danger Zone</h2>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
                        Permanently delete your account and all data — resumes, analyses, everything. This cannot be undone.
                    </p>

                    {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete my account
                        </button>
                    ) : (
                        <div className="space-y-4">

                            {/* Warning list */}
                            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                                    This will permanently delete:
                                </p>
                                <ul className="space-y-1.5">
                                    {[
                                        'Your account and profile',
                                        'All uploaded resumes',
                                        'All analysis history',
                                        'All saved data',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                            <span className="w-1 h-1 bg-red-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Confirm input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                                />
                            </div>

                            {/* Inline error */}
                            {error && (
                                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2.5 rounded-xl">
                                    <AlertCircle size={13} />
                                    {error}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending || confirmText !== 'DELETE'}
                                    className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
                                >
                                    {deleteMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Yes, delete everything'
                                    )}
                                </button>
                                <button
                                    onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
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