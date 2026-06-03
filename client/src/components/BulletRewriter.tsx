import { useState } from 'react'
import api from '../services/api'

const BulletRewriter = () => {
    const [bullet, setBullet] = useState('')
    const [jd, setJd] = useState('')
    const [rewrites, setRewrites] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState<number | null>(null)
    const [error, setError] = useState('')

    const handleRewrite = async () => {
        if (!bullet.trim()) { setError('Please enter a bullet point'); return }
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/ai/rewrite-bullet', {
                bulletPoint: bullet,
                jobDescription: jd,
            })
            setRewrites(res.data.rewrites)
        } catch {
            setError('Failed to rewrite — try again')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopied(index)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                ✦ AI Bullet Rewriter
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Paste a resume bullet point — get 3 stronger versions
            </p>

            <div className="space-y-3">
                <textarea
                    value={bullet}
                    onChange={(e) => setBullet(e.target.value)}
                    aria-label="Resume bullet point"
                    placeholder="e.g. Worked on React projects for the team"
                    rows={2}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
                <input
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Optional: paste target job title or JD for better results"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <button
                    onClick={handleRewrite}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rewriting...</>
                    ) : 'Rewrite with AI'}
                </button>
            </div>

            {rewrites.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        3 Stronger Versions
                    </p>
                    {rewrites.map((r, i) => (
                        <div
                            key={i}
                            className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                            <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                {i + 1}
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-200 flex-1">{r}</p>
                            <button
                                onClick={() => handleCopy(r, i)}
                                className="text-xs text-gray-400 hover:text-blue-600 shrink-0"
                            >
                                {copied === i ? '✓' : 'Copy'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BulletRewriter
