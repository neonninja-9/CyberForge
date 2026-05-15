import { useState, useEffect } from 'react'
import { Shield, Layers, Target, Flame, Lock, Award, Zap, Star, Trophy, Crown, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { getDashboardData } from '../lib/userProgress'
import './Dashboard.css'

/* ─── XP thresholds per level ─── */
function xpForLevel(level) {
  return level * 500
}

function getLevelTitle(level) {
  if (level >= 10) return 'Crypto Wizard'
  if (level >= 7) return 'Cipher Master'
  if (level >= 5) return 'Code Breaker'
  if (level >= 3) return 'Cipher Apprentice'
  return 'Novice Cryptographer'
}

/* ─── Achievement definitions (unlocked based on real data) ─── */
function computeAchievements(stats) {
  return [
    {
      name: 'First Encryption',
      icon: <Lock size={24} />,
      color: 'var(--color-success)',
      unlocked: stats.totalRuns >= 1,
      desc: 'Run your first algorithm',
    },
    {
      name: 'Explorer',
      icon: <Shield size={24} />,
      color: 'var(--color-asymmetric)',
      unlocked: stats.algorithmsUsed >= 5,
      desc: 'Try 5 different algorithms',
    },
    {
      name: 'Pipeline Pro',
      icon: <Layers size={24} />,
      color: 'var(--color-primary)',
      unlocked: stats.pipelinesBuilt >= 1,
      desc: 'Build your first pipeline',
    },
    {
      name: '100 XP Club',
      icon: <Star size={24} />,
      color: '#daa520',
      unlocked: (stats.profile?.total_xp || 0) >= 100,
      desc: 'Earn 100 XP',
    },
    {
      name: 'Challenge Accepted',
      icon: <Zap size={24} />,
      color: 'var(--color-attention)',
      unlocked: stats.challengesCompleted >= 1,
      desc: 'Complete a challenge',
    },
    {
      name: 'Streak Master',
      icon: <Award size={24} />,
      color: 'var(--color-critical)',
      unlocked: stats.bestStreak >= 7,
      desc: '7-day learning streak',
    },
    {
      name: 'Crypto Wizard',
      icon: <Crown size={24} />,
      color: 'var(--color-primary)',
      unlocked: stats.algorithmsUsed >= 20,
      desc: 'Use 20 different algorithms',
    },
    {
      name: 'All Algorithms',
      icon: <Trophy size={24} />,
      color: '#ff6b35',
      unlocked: stats.algorithmsUsed >= stats.totalAlgorithms,
      desc: 'Try every algorithm',
    },
  ]
}


export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [dashData, setDashData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    getDashboardData(user.id)
      .then(data => {
        setDashData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard data error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [user])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const email = user?.email || ''
  const provider = user?.app_metadata?.provider || 'email'

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-page" id="dashboard-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw size={32} className="spin" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-lg)' }} />
            <p className="text-body" style={{ color: 'var(--color-steel)' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const profile = dashData?.profile || {}
  const stats = dashData?.stats || {}
  const recentActivity = dashData?.recentActivity || []

  const totalXP = profile.total_xp || 0
  const level = profile.level || 1
  const xpForNext = xpForLevel(level)
  const xpInLevel = totalXP - xpForLevel(level - 1)
  const xpNeeded = xpForNext - xpForLevel(level - 1)
  const progressPct = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 0
  const xpRemaining = xpForNext - totalXP

  const achievements = computeAchievements({ ...stats, profile })

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        {/* Profile Header */}
        <div className="dash-profile" id="profile-section">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="dash-avatar-img" />
          ) : (
            <div className="avatar avatar-lg">{initials}</div>
          )}
          <div className="dash-profile-info">
            <h1 className="text-heading-lg">{displayName}</h1>
            <p className="text-body-sm" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xs)' }}>
              {email}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <span className="badge badge-primary" style={{ fontSize: 14, padding: '6px 16px' }}>{getLevelTitle(level)}</span>
              <span className="badge" style={{
                fontSize: 12,
                padding: '4px 10px',
                background: 'var(--color-surface-raised)',
                color: 'var(--color-steel)',
                textTransform: 'capitalize'
              }}>
                via {provider}
              </span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm dash-logout-btn"
            onClick={handleLogout}
            title="Sign out"
            id="dashboard-logout"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* XP Progress */}
        <div className="dash-xp-bar" id="xp-bar">
          <div className="flex-between" style={{ marginBottom: 'var(--space-xs)' }}>
            <span className="text-body-bold">Level {level}</span>
            <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
              {totalXP.toLocaleString()} / {xpForNext.toLocaleString()} XP
            </span>
          </div>
          <div className="progress-bar" style={{ height: 16 }}>
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-caption" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-xs)', textAlign: 'right' }}>
            {xpRemaining > 0 ? `${xpRemaining.toLocaleString()} XP to Level ${level + 1}` : 'Max Level!'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 dash-stats" id="stats-grid">
          {[
            {
              icon: <Shield size={24} />,
              label: 'Algorithms Used',
              value: `${stats.algorithmsUsed || 0} / ${stats.totalAlgorithms || 28}`,
              progress: stats.totalAlgorithms ? Math.round((stats.algorithmsUsed / stats.totalAlgorithms) * 100) : 0,
            },
            {
              icon: <Layers size={24} />,
              label: 'Pipelines Built',
              value: `${stats.pipelinesBuilt || 0}`,
              sub: `${stats.totalRuns || 0} total executions`,
            },
            {
              icon: <Target size={24} />,
              label: 'Challenges Done',
              value: `${stats.challengesCompleted || 0} / ${stats.totalChallenges || 3}`,
              progress: stats.totalChallenges ? Math.round((stats.challengesCompleted / stats.totalChallenges) * 100) : 0,
            },
            {
              icon: <Flame size={24} />,
              label: 'Current Streak',
              value: `${stats.streakDays || 0} days`,
              sub: `Best: ${stats.bestStreak || 0} days`,
            },
          ].map((stat, i) => (
            <div className="card-flat card-sm dash-stat-card" key={i}>
              <div className="dash-stat-icon">{stat.icon}</div>
              <div className="text-body-sm" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xs)' }}>{stat.label}</div>
              <div className="text-heading-sm" style={{ color: 'var(--color-primary)' }}>{stat.value}</div>
              {stat.progress !== undefined && (
                <div className="progress-bar progress-bar-sm" style={{ marginTop: 'var(--space-sm)' }}>
                  <div className="progress-bar-fill" style={{ width: `${stat.progress}%` }} />
                </div>
              )}
              {stat.trend && <div className="text-caption" style={{ color: stat.trendColor, marginTop: 'var(--space-xs)' }}>{stat.trend}</div>}
              {stat.sub && <div className="text-caption" style={{ color: 'var(--color-stone)', marginTop: 'var(--space-xs)' }}>{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="dash-section" id="achievements-section">
          <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="text-heading-sm">Achievements</h2>
            <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>
              {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
            </span>
          </div>
          <div className="achievements-row">
            {achievements.map((a, i) => (
              <div key={i} className={`achievement-badge ${a.unlocked ? '' : 'locked'}`} title={a.desc}>
                <div className="achievement-icon" style={a.unlocked ? { backgroundColor: `${a.color}20`, color: a.color } : {}}>
                  {a.unlocked ? a.icon : <Lock size={20} />}
                </div>
                <span className="text-caption">{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-section" id="activity-section">
          <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="text-heading-sm">Recent Activity</h2>
            <Link to="/explore" className="text-body-sm">Explore More →</Link>
          </div>
          <div className="card-flat card-sm">
            {recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
                <p className="text-body" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-md)' }}>
                  No activity yet. Start exploring algorithms!
                </p>
                <Link to="/explore" className="btn btn-primary btn-sm">Go to Explore</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Category</th>
                      <th>Runs</th>
                      <th>Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map(run => (
                      <tr key={run.id}>
                        <td className="text-body-sm-bold">
                          <Link to={`/lab/${run.algorithm_id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                            {run.algorithm_name}
                          </Link>
                        </td>
                        <td><span className="badge badge-sm">{run.category}</span></td>
                        <td>{run.run_count}×</td>
                        <td className="text-caption" style={{ color: 'var(--color-steel)' }}>
                          {new Date(run.last_run_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="card-flat card-sm" style={{ marginTop: 'var(--space-xl)', borderColor: 'var(--color-critical)' }}>
            <p className="text-body-sm" style={{ color: 'var(--color-critical)' }}>
              Some data couldn't be loaded: {error}
            </p>
            <p className="text-caption" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-sm)' }}>
              Make sure the database tables have been created. See <code>backend/supabase_schema.sql</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
