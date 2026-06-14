import { useNavigate } from 'react-router-dom'
import { Plus, History, FileText, TrendingUp, ChevronRight, Sparkles } from 'lucide-react'
import { DashboardSkeleton } from '../components/Skeleton'
import RepoBulletGenerator from '../components/RepoBulletGenerator'
import { useAnalyses, useResumes } from '../hooks/useResumes'
import { useAuth } from '../context/useAuth'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: resumes = [], isLoading: resumesLoading } = useResumes()
  const { data: analyses = [], isLoading: analysesLoading } = useAnalyses()
  const loading = resumesLoading || analysesLoading

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600 dark:text-green-400' :
      score >= 50 ? 'text-amber-500 dark:text-amber-400' :
        'text-red-500 dark:text-red-400'

  const scoreBg = (score: number) =>
    score >= 75 ? 'bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900' :
      score >= 50 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900' :
        'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900'

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum: number, a: any) => sum + a.matchScore, 0) / analyses.length)
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero banner — dark navy gradient (same as Login left panel) */}
      <div
        className="relative overflow-hidden px-6 py-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow accent */}
        <div
          className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            {/* Left — greeting + stats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <span className="text-slate-400 text-sm">
                  Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-slate-400 text-sm">
                {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} · {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} uploaded
              </p>

              {/* Stat row — same pattern as Login + Landing */}
              <div className="flex gap-8 mt-6">
                {[
                  { value: analyses.length.toString(), label: 'total analyses' },
                  { value: resumes.length.toString(), label: 'resumes uploaded' },
                  { value: avgScore !== null ? `${avgScore}%` : '—', label: 'avg match score' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — CTA buttons */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <button
                onClick={() => navigate('/analyse')}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm whitespace-nowrap"
              >
                <Plus size={15} />
                New Analysis
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap"
              >
                <History size={15} />
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* ── Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Recent Analyses */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Analyses</h2>
                  </div>
                  {analyses.length > 5 && (
                    <button
                      onClick={() => navigate('/history')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {analyses.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp size={18} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No analyses yet</p>
                    <button
                      onClick={() => navigate('/analyse')}
                      className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Run your first analysis →
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {analyses.slice(0, 5).map((a: any) => (
                      <li
                        key={a._id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${scoreColor(a.matchScore)} ${scoreBg(a.matchScore)}`}>
                          {a.matchScore}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Uploaded Resumes */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <FileText size={16} className="text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Uploaded Resumes</h2>
                </div>

                {resumes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">No resumes uploaded yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {resumes.slice(0, 5).map((r: any) => (
                      <li
                        key={r._id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {r.originalName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* ── Repo Bullet Generator */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <RepoBulletGenerator />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard