import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PDFUpload from '../components/PDFUpload'
import ScoreCard from '../components/ScoreCard'
import api from '../services/api'

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
      const res = await api.post('/resume/analyse', {
        resumeId: resume.id,
        jobDescription: jobDescription.trim(),
      })
      setResult(res.data.analysis)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed')
    } finally {
      setAnalysing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New Analysis</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {!result ? (
          <>
            {/* Step 1 — Upload */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Step 1 — Upload Resume
              </h2>
              <PDFUpload onUploadSuccess={setResume} />
            </div>

            {/* Step 2 — JD */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Step 2 — Paste Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — the more detail, the better the analysis..."
                rows={8}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {jobDescription.length} characters
                {jobDescription.length < 50 && jobDescription.length > 0 && (
                  <span className="text-amber-500"> — needs at least 50</span>
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Analyse button */}
            <button
              onClick={handleAnalyse}
              disabled={analysing || !resume}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {analysing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analysing with AI...
                </>
              ) : (
                '✦ Analyse Resume'
              )}
            </button>
          </>
        ) : (
          <>
            {/* Score Card */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Analysis Result</h2>
              <button
                onClick={() => { setResult(null); setResume(null); setJobDescription('') }}
                className="text-sm text-blue-600 hover:underline"
              >
                New Analysis
              </button>
            </div>

            <ScoreCard
              matchScore={result.matchScore}
              matchedSkills={result.matchedSkills}
              missingSkills={result.missingSkills}
              suggestions={result.suggestions}
            />
          </>
        )}

      </div>
    </div>
  )
}

export default Analyse