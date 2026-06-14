import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, CheckCircle, Target, ChevronRight, Lock } from 'lucide-react'
import ScoreCard from '../components/ScoreCard'
import { usePublicAnalyse } from '../hooks/useAI'

interface PublicResult {
    matchScore: number
    matchedSkills: string[]
    missingSkills: { skill: string; severity: 'high' | 'medium' | 'low' }[]
    suggestionsCount: number
    isLimited: boolean
}

const Landing = () => {
    const publicMutation = usePublicAnalyse()
    const navigate = useNavigate()
    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [result, setResult] = useState<PublicResult | null>(null)
    const [error, setError] = useState('')

    const handleAnalyse = async () => {
        if (resumeText.trim().length < 50) { setError('Resume text too short — min 50 characters'); return }
        if (jobDescription.trim().length < 50) { setError('Job description too short — min 50 characters'); return }
        setError('')
        try {
            const data = await publicMutation.mutateAsync({ resumeText, jobDescription })
            setResult(data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Analysis failed — try again')
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">

            {/* ── Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Sparkles size={15} className="text-white" />
                        </div>
                        <span className="text-gray-900 dark:text-white font-semibold text-base tracking-tight">
                            AI Resume Matcher
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm flex items-center gap-1.5"
                        >
                            Get started free
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero — two-column like Login */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">

                    {/* Left — headline */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium mb-6">
                            <Zap size={11} />
                            Powered by Groq AI · LLaMA 3.1
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-5">
                            Know your resume score<br />
                            <span className="text-blue-500">before you apply.</span>
                        </h1>

                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-md">
                            Paste your resume and job description — AI analyses your match score, finds skill gaps, and tells you exactly what's missing.
                        </p>

                        {/* Stats — same pattern as Login */}
                        <div className="flex gap-8 mb-10">
                            {[
                                { value: '85%', label: 'match accuracy' },
                                { value: '3x', label: 'more interviews' },
                                { value: '10s', label: 'to analyse' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Feature list */}
                        <div className="space-y-2.5">
                            {[
                                { icon: CheckCircle, text: 'Instant match score against any job posting' },
                                { icon: Target, text: 'Pinpoints missing skills by severity' },
                                { icon: Sparkles, text: 'AI rewrite suggestions for your bullet points' },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                    <Icon size={15} className="text-blue-500 shrink-0" />
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — feature cards */}
                    <div
                        className="hidden lg:flex flex-col justify-between p-10 rounded-2xl relative overflow-hidden min-h-105"
                        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
                    >
                        {/* Subtle grid */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                        {/* Glow */}
                        <div
                            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
                        />

                        <div className="relative z-10 space-y-4">
                            {[
                                { icon: '📊', title: 'Match Score', desc: 'See exactly how well you fit the role before clicking apply.' },
                                { icon: '✓', title: 'Skill Match', desc: 'Highlights the skills you already have that employers want.' },
                                { icon: '🎯', title: 'Skill Gaps', desc: 'Shows what`s missing — ranked by how much it matters.' },
                                { icon: '💡', title: 'AI Suggestions', desc: 'Rewrites your bullet points to close the gaps automatically.' },
                            ].map((f) => (
                                <div
                                    key={f.title}
                                    className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5"
                                >
                                    <span className="text-xl mt-0.5">{f.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{f.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="relative z-10 text-slate-500 text-xs mt-6">
                            "Know your gaps. Fix them. Get hired."
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Checker tool */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-6 py-16">

                    {!result ? (
                        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">

                            <div className="text-center mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Try it free — no account needed
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    3 free analyses per hour · Takes about 10 seconds
                                </p>
                            </div>

                            <div className="space-y-5">
                                {/* Resume */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Paste your resume text
                                    </label>
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Copy and paste your resume content here — skills, experience, education..."
                                        rows={6}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{resumeText.length} characters</p>
                                </div>

                                {/* JD */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Paste job description
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the full job description here..."
                                        rows={6}
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">{jobDescription.length} characters</p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                                        <span className="mt-0.5">⚠</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={handleAnalyse}
                                    disabled={publicMutation.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {publicMutation.isPending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analysing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Analyse for free
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Results</h2>
                                <button
                                    onClick={() => { setResult(null); setResumeText(''); setJobDescription('') }}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>

                            {/* Score card */}
                            <ScoreCard
                                matchScore={result.matchScore}
                                matchedSkills={result.matchedSkills}
                                missingSkills={result.missingSkills}
                                suggestions={[]}
                            />

                            {/* Locked CTA — styled like Login left panel */}
                            <div
                                className="rounded-2xl p-6 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
                            >
                                {/* Grid overlay */}
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage:
                                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                        backgroundSize: '40px 40px',
                                    }}
                                />
                                {/* Glow */}
                                <div
                                    className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock size={16} className="text-blue-400" />
                                        <p className="text-base font-bold text-white">
                                            {result.suggestionsCount} AI suggestions waiting
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Sign up to unlock your full analysis — it's free
                                    </p>

                                    <div className="grid grid-cols-2 gap-2.5 mb-6">
                                        {[
                                            { icon: '💡', text: `${result.suggestionsCount} improvement suggestions` },
                                            { icon: '✍️', text: 'AI bullet point rewriter' },
                                            { icon: '🎤', text: 'Interview question predictor' },
                                            { icon: '📝', text: 'Cover letter generator' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                                                <span>{item.icon}</span>
                                                <span>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate('/register')}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm"
                                        >
                                            Create free account
                                        </button>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="flex-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                            <Sparkles size={11} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Resume Matcher</span>
                    </div>
                    <p className="text-xs text-gray-400">"Know your gaps. Fix them. Get hired."</p>
                </div>
            </div>
        </div>
    )
}

export default Landing