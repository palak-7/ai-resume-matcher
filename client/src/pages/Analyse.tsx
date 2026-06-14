import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, FileText, ClipboardList, Wrench } from 'lucide-react'
import PDFUpload from '../components/PDFUpload'
import ScoreCard from '../components/ScoreCard'
import BulletRewriter from '../components/BulletRewriter'
import InterviewQuestions from '../components/InterviewQuestions'
import CoverLetter from '../components/CoverLetter'
import { useAnalyseResume } from '../hooks/useResumes'

interface Resume {
  id: string
  originalName: string
  textLength: number
}

interface AnalysisResult {
  id: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: { skill: string; severity: 'high' | 'medium' | 'low' }[]
  suggestions: string[]
}

const Analyse = () => {
  const analyseMutation = useAnalyseResume()
  const [resume, setResume] = useState<Resume | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleAnalyse = async () => {
    if (!resume) { setError('Please upload a resume first'); return }
    if (jobDescription.trim().length < 50) {
      setError('Job description is too short — paste the full JD')
      return
    }
    setError('')
    setAnalysing(true)
    try {
      const res = await analyseMutation.mutateAsync({
        resumeId: resume.id,
        jobDescription: jobDescription.trim(),
      })
      setResult(res)
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Analysis failed')
      } else {
        setError('Analysis failed')
      }
    } finally {
      setAnalysing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero banner — same dark navy gradient */}
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

        <div className="relative z-10 max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>

          {!result ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-blue-400" />
                <span className="text-slate-400 text-sm">AI-powered resume analysis</span>
              </div>
              <h1 className="text-3xl font-bold text-white">New Analysis</h1>
              <p className="text-slate-400 text-sm mt-1">
                Upload your resume and paste a job description to get your match score.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={15} className="text-blue-400" />
                    <span className="text-slate-400 text-sm">Analysis complete</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white">Your Results</h1>
                </div>
                <button
                  onClick={() => { setResult(null); setResume(null); setJobDescription('') }}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                >
                  New Analysis
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {!result ? (
          <>
            {/* Step 1 — Upload */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Upload Resume
                  </h2>
                </div>
              </div>
              <PDFUpload onUploadSuccess={setResume} />
            </div>

            {/* Step 2 — JD */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold shrink-0">
                  2
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={15} className="text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Paste Job Description
                  </h2>
                </div>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — the more detail, the better the analysis..."
                rows={8}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                {jobDescription.length} characters
                {jobDescription.length < 50 && jobDescription.length > 0 && (
                  <span className="text-amber-500 dark:text-amber-400"> — needs at least 50</span>
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Analyse button */}
            <button
              onClick={handleAnalyse}
              disabled={analysing || !resume}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
            >
              {analysing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analyse Resume
                </>
              )}
            </button>
          </>

        ) : (
          <>
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <ScoreCard
                matchScore={result.matchScore}
                matchedSkills={result.matchedSkills}
                missingSkills={result.missingSkills}
                suggestions={result.suggestions}
              />
            </div>

            {/* AI Tools */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={15} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  AI Tools
                </h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <BulletRewriter />
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <InterviewQuestions
                    jobDescription={jobDescription}
                    missingSkills={result.missingSkills}
                  />
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <CoverLetter
                    jobDescription={jobDescription}
                    resumeId={resume?.id}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Analyse