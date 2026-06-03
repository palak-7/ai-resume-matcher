import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

interface Resume {
  _id: string
  originalName: string
  createdAt: string
}

interface Analysis {
  _id: string
  matchScore: number
  createdAt: string
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeRes, analysisRes] = await Promise.all([
          api.get('/resume/my-resumes'),
          api.get('/resume/analyses'),
        ])
        setResumes(resumeRes.data.resumes)
        setAnalyses(analysisRes.data.analyses)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' :
      score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">AI Resume Matcher</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">
              {analyses.length} analyses · {resumes.length} resumes uploaded
            </p>
          </div>
          <button
            onClick={() => navigate('/analyse')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            + New Analysis
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Recent Analyses */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Analyses</h3>
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No analyses yet</p>
                  <button
                    onClick={() => navigate('/analyse')}
                    className="text-blue-600 text-sm hover:underline mt-2"
                  >
                    Run your first analysis →
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {analyses.slice(0, 5).map((a) => (
                    <li key={a._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">
                        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className={`text-sm font-bold ${scoreColor(a.matchScore)}`}>
                        {a.matchScore}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Uploaded Resumes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Uploaded Resumes</h3>
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No resumes uploaded yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {resumes.slice(0, 5).map((r) => (
                    <li key={r._id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                      <span className="text-lg">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {r.originalName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard