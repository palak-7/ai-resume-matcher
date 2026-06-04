import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GitHubCallback = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        if (token) {
            localStorage.setItem('github_token', token)
            navigate('/dashboard?github=connected')
        } else {
            navigate('/dashboard')
        }
    }, [navigate])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">Connecting GitHub...</p>
            </div>
        </div>
    )
}

export default GitHubCallback
