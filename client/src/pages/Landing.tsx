import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import ScoreCard from '../components/ScoreCard'

interface PublicResult {
    matchScore: number
    matchedSkills: string[]
    missingSkills: { skill: string; severity: 'high' | 'medium' | 'low' }[]
    suggestionsCount: number
    isLimited: boolean
}

const Landing = () => {
    const navigate = useNavigate()
    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<PublicResult | null>(null)
    const [error, setError] = useState('')

    const handleAnalyse = async () => {
        if (resumeText.trim().length < 50) { setError('Resume text too short — min 50 characters'); return }
        if (jobDescription.trim().length < 50) { setError('Job description too short — min 50 characters'); return }
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/resume/public-analyse', { resumeText, jobDescription })
            setResult(res.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Analysis failed — try again')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Resume Matcher
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Get started free
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
                    Powered by Groq AI (LLaMA 3.1)
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    Know your resume score<br />before applying
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
                    Paste your resume and job description — AI analyses your match score, finds skill gaps, and tells you exactly what's missing.
                </p>

                {/* Features row */}
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
                    {[
                        { icon: '📊', title: 'Match Score', desc: 'See how well you fit' },
                        { icon: '✓', title: 'Skill Match', desc: 'What you already have' },
                        { icon: '🎯', title: 'Skill Gaps', desc: 'What you need to add' },
                    ].map((f, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                            <div className="text-2xl mb-2">{f.icon}</div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checker tool */}
            <div className="max-w-3xl mx-auto px-6 pb-16">
                {!result ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Try it free — no account needed
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Paste your resume text
                                </label>
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    placeholder="Copy and paste your resume content here — skills, experience, education..."
                                    rows={6}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">{resumeText.length} characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Paste job description
                                </label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    rows={6}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">{jobDescription.length} characters</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleAnalyse}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</>
                                ) : '✦ Analyse for free'}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                3 free analyses per hour · No account needed
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Results</h3>
                            <button
                                onClick={() => { setResult(null); setResumeText(''); setJobDescription('') }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Try again
                            </button>
                        </div>

                        {/* Score card — public version */}
                        <ScoreCard
                            matchScore={result.matchScore}
                            matchedSkills={result.matchedSkills}
                            missingSkills={result.missingSkills}
                            suggestions={[]}  // hidden for public
                        />

                        {/* Locked features CTA */}
                        <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                            <div className="text-center mb-4">
                                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    🔒 {result.suggestionsCount} AI suggestions waiting
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Sign up to unlock full analysis — it's free
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[
                                    { icon: '💡', text: `${result.suggestionsCount} improvement suggestions` },
                                    { icon: '✍️', text: 'AI bullet point rewriter' },
                                    { icon: '🎤', text: 'Interview question predictor' },
                                    { icon: '📝', text: 'Cover letter generator' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span>{item.icon}</span>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Create free account
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Sign in
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Landing