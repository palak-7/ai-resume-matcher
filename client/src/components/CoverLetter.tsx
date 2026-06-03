import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/useAuth'

interface Props {
    resumeId?: string
    jobDescription?: string
}

const CoverLetter = ({ resumeId, jobDescription }: Props) => {
    const { user } = useAuth()
    const [letter, setLetter] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [jd, setJd] = useState(jobDescription || '')
    const [error, setError] = useState('')

    const handleGenerate = async () => {
        if (!jd.trim()) { setError('Please enter a job description'); return }
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/ai/cover-letter', {
                resumeId,
                jobDescription: jd,
                userName: user?.name,
            })
            setLetter(res.data.coverLetter)
        } catch {
            setError('Failed to generate cover letter — try again')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(letter)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                ✦ Cover Letter Generator
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                One-click cover letter tailored to the job description
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
                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : 'Generate Cover Letter'}
            </button>

            {letter && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Generated Cover Letter
                        </p>
                        <button
                            onClick={handleCopy}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {copied ? '✓ Copied!' : 'Copy all'}
                        </button>
                    </div>
                    <textarea
                        value={letter}
                        onChange={(e) => setLetter(e.target.value)}
                        rows={10}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-3 text-sm dark:bg-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">You can edit the letter directly above</p>
                </div>
            )}
        </div>
    )
}

export default CoverLetter