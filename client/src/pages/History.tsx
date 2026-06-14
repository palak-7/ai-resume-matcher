import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, ChevronUp, TrendingUp, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { useAnalyses } from '../hooks/useResumes'

const severityColor = {
    high: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900',
    medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900',
    low: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900',
}

const History = () => {
    const [expanded, setExpanded] = useState<string | null>(null)
    const navigate = useNavigate()
    const { data: analyses = [], isLoading } = useAnalyses()

    const scoreColor = (score: number) =>
        score >= 75 ? 'text-green-600 dark:text-green-400' :
            score >= 50 ? 'text-amber-500 dark:text-amber-400' :
                'text-red-500 dark:text-red-400'

    const scoreBg = (score: number) =>
        score >= 75 ? 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900' :
            score >= 50 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900' :
                'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* ── Hero banner — same dark navy gradient as Dashboard */}
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

                <div className="relative z-10 max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={15} className="text-blue-400" />
                            <span className="text-slate-400 text-sm">Your results over time</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-1">Analysis History</h1>
                        <p className="text-slate-400 text-sm">
                            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} total
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/analyse')}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm whitespace-nowrap self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        New Analysis
                    </button>
                </div>
            </div>

            {/* ── Content */}
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Loading skeleton */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3 mb-3" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-2/3" />
                            </div>
                        ))}
                    </div>

                ) : analyses.length === 0 ? (
                    /* Empty state */
                    <div className="text-center py-24">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={20} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">No analyses yet</p>
                        <button
                            onClick={() => navigate('/analyse')}
                            className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                            Run your first analysis →
                        </button>
                    </div>

                ) : (
                    <div className="space-y-3">
                        {analyses.map(a => (
                            <div
                                key={a._id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
                            >
                                {/* ── Row header */}
                                <button
                                    onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Score badge */}
                                        <span className={`text-lg font-bold px-3 py-1.5 rounded-xl border shrink-0 ${scoreColor(a.matchScore)} ${scoreBg(a.matchScore)}`}>
                                            {a.matchScore}%
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                                                {a.jobDescription.substring(0, 80)}...
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(a.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {expanded === a._id
                                        ? <ChevronUp size={16} className="text-gray-400 shrink-0 ml-3" />
                                        : <ChevronDown size={16} className="text-gray-400 shrink-0 ml-3" />
                                    }
                                </button>

                                {/* ── Expanded detail */}
                                {expanded === a._id && (
                                    <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-5 space-y-5">

                                        {/* Matched Skills */}
                                        {a.matchedSkills.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2.5">
                                                    <CheckCircle size={13} className="text-green-500" />
                                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                        Matched Skills
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {a.matchedSkills.map(s => (
                                                        <span
                                                            key={s}
                                                            className="bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900 text-xs px-2.5 py-1 rounded-lg"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Skills */}
                                        {a.missingSkills.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2.5">
                                                    <XCircle size={13} className="text-red-400" />
                                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                        Missing Skills
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {a.missingSkills.map(s => (
                                                        <span
                                                            key={s.skill}
                                                            className={`text-xs px-2.5 py-1 rounded-lg ${severityColor[s.severity]}`}
                                                        >
                                                            {s.skill} · {s.severity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {a.suggestions.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2.5">
                                                    <Lightbulb size={13} className="text-blue-500" />
                                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                        Suggestions
                                                    </p>
                                                </div>
                                                <ul className="space-y-2">
                                                    {a.suggestions.map((s, i) => (
                                                        <li
                                                            key={i}
                                                            className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
                                                        >
                                                            <span className="w-5 h-5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                                                {i + 1}
                                                            </span>
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default History