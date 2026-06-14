import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { setGitHubToken } from '../utils/githubToken'

const GitHubCallback = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (token && setGitHubToken(user, token)) {
            navigate('/dashboard?github=connected')
        } else {
            navigate('/dashboard')
        }
    }, [navigate, user])

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>

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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg tracking-tight">
                        AI Resume Matcher
                    </span>
                </div>

                {/* Spinner + message */}
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-slate-300 text-sm">Connecting GitHub...</p>
                </div>
            </div>
        </div>
    )
}

export default GitHubCallback