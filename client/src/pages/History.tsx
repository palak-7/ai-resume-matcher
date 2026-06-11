import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnalyses } from '../hooks/useResumes'

const severityColor = {
    high: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300',
    medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    low: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300',
}

const History = () => {
    const [expanded, setExpanded] = useState<string | null>(null)
    const navigate = useNavigate()
    const {
        data: analyses = [],
        isLoading,
    } = useAnalyses()


    const scoreColor = (score: number) =>
        score >= 75 ? 'text-green-600' :
            score >= 50 ? 'text-amber-600' : 'text-red-600'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Analysis History
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {analyses.length} total analyses
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/analyse')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        + New Analysis
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : analyses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">No analyses yet</p>
                        <button
                            onClick={() => navigate('/analyse')}
                            className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2"
                        >
                            Run your first analysis →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {analyses.map(a => (
                            <div
                                key={a._id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                            >
                                {/* Row */}
                                <button
                                    onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xl font-bold ${scoreColor(a.matchScore)}`}>
                                            {a.matchScore}%
                                        </span>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-1">
                                                {a.jobDescription.substring(0, 80)}...
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(a.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                        {expanded === a._id ? '▲' : '▼'}
                                    </span>
                                </button>

                                {/* Expanded detail */}
                                {expanded === a._id && (
                                    <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">

                                        {/* Matched Skills */}
                                        {a.matchedSkills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                                    Matched Skills
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {a.matchedSkills.map(s => (
                                                        <span key={s} className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs px-2 py-0.5 rounded-full">
                                                            ✓ {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Skills */}
                                        {a.missingSkills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                                    Missing Skills
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {a.missingSkills.map(s => (
                                                        <span key={s.skill} className={`text-xs px-2 py-0.5 rounded-full ${severityColor[s.severity]}`}>
                                                            {s.skill} · {s.severity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {a.suggestions.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                                    Suggestions
                                                </p>
                                                <ul className="space-y-1">
                                                    {a.suggestions.map((s, i) => (
                                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-2">
                                                            <span className="text-blue-500 font-semibold">{i + 1}.</span> {s}
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
