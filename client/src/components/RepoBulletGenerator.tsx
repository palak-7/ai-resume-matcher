import { useState, useEffect } from 'react'
import api from '../services/api'

interface Repo {
    id: number
    name: string
    description: string
    language: string
    stars: number
    url: string
}

const RepoBulletGenerator = () => {
    const [repos, setRepos] = useState<Repo[]>([])
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
    const [bullets, setBullets] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [copied, setCopied] = useState<number | null>(null)

    const githubToken = localStorage.getItem('github_token')
    const fetchRepos = async () => {
        setFetching(true)

        try {
            const res = await api.get('/github/repos', {
                headers: {
                    'x-github-token': githubToken || '',
                },
            })

            setRepos(res.data.repos || [])
        } catch (error) {
            console.error('Failed to fetch repos', error)
        } finally {
            setFetching(false)
        }
    }

    useEffect(() => {
        if (githubToken) {
            fetchRepos()
        }
    }, [githubToken])


    const handleGenerate = async () => {
        if (!selectedRepo) return

        setLoading(true)
        setBullets([])

        try {
            const res = await api.post('/github/generate-bullets', {
                repoName: selectedRepo.name,
                repoDescription: selectedRepo.description,
                language: selectedRepo.language,
                githubToken,
            })

            setBullets(res.data.bullets || [])
        } catch (error) {
            console.error('Failed to generate bullets', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(index)

            setTimeout(() => {
                setCopied(null)
            }, 2000)
        } catch (error) {
            console.error('Failed to copy text', error)
        }
    }

    if (!githubToken) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    ✦ GitHub Repo Bullet Generator
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Connect GitHub to auto-generate resume bullets from your repos
                </p>

                <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'
                        }/api/github/auth`}
                    className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    Connect GitHub
                </a>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                ✦ GitHub Repo Bullet Generator
            </h3>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Select a repo — AI generates 3 resume bullet points
            </p>

            {fetching ? (
                <p className="text-sm text-gray-400">Loading repos...</p>
            ) : (
                <div className="space-y-3">
                    <select
                        value={selectedRepo?.id || ''}
                        onChange={(e) => {
                            const repo = repos.find(
                                (r) => r.id === Number(e.target.value)
                            )

                            setSelectedRepo(repo || null)
                            setBullets([])
                        }}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Select a repository...</option>

                        {repos.map((repo) => (
                            <option key={repo.id} value={repo.id}>
                                {repo.name} {repo.language ? `(${repo.language})` : ''}
                            </option>
                        ))}
                    </select>

                    {selectedRepo && (
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-gray-900 dark:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Resume Bullets'
                            )}
                        </button>
                    )}
                </div>
            )}

            {bullets.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Generated Bullets
                    </p>

                    {bullets.map((bullet, index) => (
                        <div
                            key={index}
                            className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                            <span className="w-5 h-5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                {index + 1}
                            </span>

                            <p className="text-sm text-gray-700 dark:text-gray-200 flex-1">
                                {bullet}
                            </p>

                            <button
                                type="button"
                                onClick={() => handleCopy(bullet, index)}
                                className="text-xs text-gray-400 hover:text-blue-600 hrink-0"
                            >
                                {copied === index ? '✓' : 'Copy'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RepoBulletGenerator