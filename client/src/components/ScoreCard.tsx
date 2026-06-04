interface MissingSkill {
    skill: string
    severity: 'high' | 'medium' | 'low'
}

interface ScoreCardProps {
    matchScore: number
    matchedSkills: string[]
    missingSkills: MissingSkill[]
    suggestions: string[]
}

const severityConfig = {
    high: { label: 'High', bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
    medium: { label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    low: { label: 'Low', bg: 'bg-yellow-100 dark:bg-yellow-950/60', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
}

const ScoreCard = ({ matchScore, matchedSkills, missingSkills, suggestions }: ScoreCardProps) => {
    const scoreColor =
        matchScore >= 75 ? 'text-green-600' :
            matchScore >= 50 ? 'text-amber-600' : 'text-red-600'

    const ringColor =
        matchScore >= 75 ? '#16a34a' :
            matchScore >= 50 ? '#d97706' : '#dc2626'

    const circumference = 2 * Math.PI * 40
    const strokeDashoffset = circumference - (matchScore / 100) * circumference

    return (
        <div className="space-y-6">

            {/* Match Score */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Match Score
                </h3>
                <div className="flex items-center gap-6">
                    {/* Circular meter */}
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="8" />
                            <circle
                                cx="48" cy="48" r="40" fill="none"
                                stroke={ringColor} strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xl font-bold ${scoreColor}`}>{matchScore}%</span>
                        </div>
                    </div>

                    <div>
                        <p className={`text-3xl font-bold ${scoreColor}`}>{matchScore}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {matchScore >= 75 ? 'Strong match — apply with confidence' :
                                matchScore >= 50 ? 'Moderate match — some gaps to address' :
                                    'Weak match — significant gaps found'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Matched Skills */}
            {matchedSkills.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Matched Skills ({matchedSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {matchedSkills.map((skill) => (
                            <span
                                key={skill}
                                className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs font-medium px-3 py-1 rounded-full"
                            >
                                ✓ {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Skills */}
            {missingSkills.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Missing Skills ({missingSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {missingSkills.map(({ skill, severity }) => {
                            const cfg = severityConfig[severity] || severityConfig.low
                            return (
                                <span
                                    key={skill}
                                    className={`${cfg.bg} ${cfg.text} text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {skill}
                                    <span className="opacity-60">· {cfg.label}</span>
                                </span>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        AI Suggestions
                    </h3>
                    <ul className="space-y-3">
                        {suggestions.map((tip, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-200">
                                <span className="w-5 h-5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    )
}

export default ScoreCard
