import { useState } from 'react'
import { GitBranch, Sparkles, Copy, Check, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getGitHubToken } from '../utils/githubToken'
import { useGenerateRepoBullets, useGithubRepos } from '../hooks/useAI'
import { apiUrl } from '../config/api'

interface Repo {
    id: number
    name: string
    description: string
    language: string
    stars: number
    url: string
}

const RepoBulletGenerator = () => {
    const { user } = useAuth()
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
    const [bullets, setBullets] = useState<string[]>([])
    const [copied, setCopied] = useState<number | null>(null)
    const generateBulletsMutation = useGenerateRepoBullets()
    const githubToken = getGitHubToken(user)
    const { data: repos = [], isLoading: fetching } = useGithubRepos(githubToken)

    const handleGenerate = async () => {
        if (!selectedRepo) return
        setBullets([])
        try {
            const bullets = await generateBulletsMutation.mutateAsync({
                repoName: selectedRepo.name,
                repoDescription: selectedRepo.description,
                language: selectedRepo.language,
                githubToken,
            })
            setBullets(bullets)
        } catch (error) {
            console.error('Failed to generate bullets', error)
        }
    }

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(index)
            setTimeout(() => setCopied(null), 2000)
        } catch (error) {
            console.error('Failed to copy text', error)
        }
    }

    // ── Not connected state
    if (!githubToken) {
        return (
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={15} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        GitHub Repo Bullet Generator
                    </h3>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                    Connect GitHub to auto-generate resume bullets from your repos
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
                    <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center shrink-0">
                        <GitBranch size={20} className="text-white dark:text-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Connect your GitHub</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            We'll read your public repos to generate bullets
                        </p>
                    </div>
                    <a
                        href={`${apiUrl}/github/auth`}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm whitespace-nowrap"
                    >
                        <GitBranch size={14} />
                        Connect GitHub
                    </a>
                </div>
            </div>
        )
    }

    // ── Connected state
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Sparkles size={15} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    GitHub Repo Bullet Generator
                </h3>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                Select a repo — AI generates 3 resume bullet points
            </p>

            {fetching ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2">
                    <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin" />
                    Loading repos...
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Select */}
                    <div className="relative">
                        <select
                            value={selectedRepo?.id || ''}
                            onChange={(e) => {
                                const repo = repos.find((r) => r.id === Number(e.target.value))
                                setSelectedRepo(repo || null)
                                setBullets([])
                            }}
                            className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 transition-all"
                        >
                            <option value="">Select a repository...</option>
                            {repos.map((repo) => (
                                <option key={repo.id} value={repo.id}>
                                    {repo.name}{repo.language ? ` (${repo.language})` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Generate button */}
                    {selectedRepo && (
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generateBulletsMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {generateBulletsMutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Generate Resume Bullets
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Generated bullets */}
            {bullets.length > 0 && (
                <div className="mt-5 space-y-2.5">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                        Generated Bullets
                    </p>

                    {bullets.map((bullet, index) => (
                        <div
                            key={index}
                            className="flex gap-3 items-start bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 group"
                        >
                            <span className="w-5 h-5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                                {index + 1}
                            </span>

                            <p className="text-sm text-gray-700 dark:text-gray-200 flex-1 leading-relaxed">
                                {bullet}
                            </p>

                            <button
                                type="button"
                                onClick={() => handleCopy(bullet, index)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                                {copied === index ? (
                                    <>
                                        <Check size={12} className="text-green-500" />
                                        <span className="text-green-500">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RepoBulletGenerator
