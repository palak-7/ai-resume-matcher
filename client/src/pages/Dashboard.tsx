import { useNavigate } from 'react-router-dom'
import { DashboardSkeleton } from '../components/Skeleton'
import RepoBulletGenerator from '../components/RepoBulletGenerator'
import { useAnalyses, useResumes } from '../hooks/useResumes'

// interface Resume {
//   _id: string
//   originalName: string
//   createdAt: string
// }

// interface Analysis {
//   _id: string
//   matchScore: number
//   createdAt: string
// }

const Dashboard = () => {
  const navigate = useNavigate()
  const { data: resumes = [], isLoading: resumesLoading } = useResumes()
  const { data: analyses = [], isLoading: analysesLoading } = useAnalyses()
  const loading = resumesLoading || analysesLoading

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' :
      score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {analyses.length} analyses · {resumes.length} resumes uploaded
            </p>
          </div>
          <button
            onClick={() => navigate('/analyse')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            + New Analysis
          </button>
          <button
            onClick={() => navigate('/history')}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            View History
          </button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Recent Analyses */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h3>
                {analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No analyses yet</p>
                    <button
                      onClick={() => navigate('/analyse')}
                      className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2"
                    >
                      Run your first analysis →
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {analyses.slice(0, 5).map((a: any) => (
                      <li key={a._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
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
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Uploaded Resumes</h3>
                {resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 dark:text-gray-500 text-sm">No resumes uploaded yet</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {resumes.slice(0, 5).map((r: any) => (
                      <li key={r._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-50">
                            {r.originalName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div><div className="mt-6">
              <RepoBulletGenerator />
            </div></>
        )}
      </div>
    </div>
  )
}

export default Dashboard
