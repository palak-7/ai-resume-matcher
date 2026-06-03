import { useState } from 'react'
import api from '../services/api'

interface Question {
    question: string
    type: 'technical' | 'behavioral' | 'situational'
    tip: string
}

interface Props {
    jobDescription?: string
    missingSkills?: { skill: string; severity: string }[]
}

const typeConfig = {
    technical: { label: 'Technical', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
    behavioral: { label: 'Behavioral', bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' },
    situational: { label: 'Situational', bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300' },
}

const InterviewQuestions = ({ jobDescription, missingSkills }: Props) => {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(false)
    const [jd, setJd] = useState(jobDescription || '')
    const [error, setError] = useState('')

    const handleGenerate = async () => {
        if (!jd.trim()) { setError('Please enter a job description'); return }
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/ai/interview-questions', {
                jobDescription: jd,
                missingSkills,
            })
            setQuestions(res.data.questions)
        } catch {
            setError('Failed to generate questions — try again')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                ✦ Interview Question Predictor
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                AI predicts likely questions based on the JD and your skill gaps
            </p>

            {!jobDescription && (
                <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste job description..."
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none mb-3"
                />
            )}

            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : 'Predict Interview Questions'}
            </button>

            {questions.length > 0 && (
                <div className="mt-4 space-y-3">
                    {questions.map((q, i) => {
                        const cfg = typeConfig[q.type] || typeConfig.technical
                        return (
                            <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {i + 1}. {q.question}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    💡 {q.tip}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default InterviewQuestions