import { Shield, Layers, Target, Flame, Lock, Award, Zap, Star, Trophy, Crown } from 'lucide-react'
import './Dashboard.css'

const achievements = [
  { name: 'First Encryption', icon: <Lock size={24} />, color: 'var(--color-success)', unlocked: true },
  { name: 'Hash Master', icon: <Shield size={24} />, color: 'var(--color-asymmetric)', unlocked: true },
  { name: 'Pipeline Pro', icon: <Layers size={24} />, color: 'var(--color-primary)', unlocked: true },
  { name: '100 XP Club', icon: <Star size={24} />, color: '#daa520', unlocked: true },
  { name: 'Speed Demon', icon: <Zap size={24} />, color: 'var(--color-attention)', unlocked: true },
  { name: 'RSA Expert', icon: <Award size={24} />, color: null, unlocked: false },
  { name: 'Crypto Wizard', icon: <Crown size={24} />, color: null, unlocked: false },
  { name: 'All Algorithms', icon: <Trophy size={24} />, color: null, unlocked: false },
]

const leaderboard = [
  { rank: 1, name: 'Sarah Kim', level: 9, xp: '3,890', streak: 14, emoji: '🥇' },
  { rank: 2, name: 'James Park', level: 8, xp: '3,450', streak: 9, emoji: '🥈' },
  { rank: 3, name: 'Maria Lopez', level: 8, xp: '3,210', streak: 7, emoji: '🥉' },
  { rank: 4, name: 'Alex Chen', level: 7, xp: '2,340', streak: 5, isYou: true },
  { rank: 5, name: 'Priya Patel', level: 7, xp: '2,180', streak: 3 },
  { rank: 6, name: 'Tom Wilson', level: 6, xp: '1,920', streak: 2 },
]

export default function Dashboard() {
  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        {/* Profile Header */}
        <div className="dash-profile" id="profile-section">
          <div className="avatar avatar-lg">AC</div>
          <div className="dash-profile-info">
            <h1 className="text-heading-lg">Alex Chen</h1>
            <span className="badge badge-primary" style={{ fontSize: 14, padding: '6px 16px' }}>Cipher Apprentice</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="dash-xp-bar" id="xp-bar">
          <div className="flex-between" style={{ marginBottom: 'var(--space-xs)' }}>
            <span className="text-body-bold">Level 7</span>
            <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>2,340 / 3,000 XP</span>
          </div>
          <div className="progress-bar" style={{ height: 16 }}>
            <div className="progress-bar-fill" style={{ width: '78%' }} />
          </div>
          <div className="text-caption" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-xs)', textAlign: 'right' }}>
            660 XP to Level 8
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-4 dash-stats" id="stats-grid">
          {[
            { icon: <Shield size={24} />, label: 'Algorithms Mastered', value: '18 / 45', progress: 40 },
            { icon: <Layers size={24} />, label: 'Pipelines Built', value: '7', trend: '↑ 3 this week', trendColor: 'var(--color-success)' },
            { icon: <Target size={24} />, label: 'Challenges Completed', value: '12 / 30', progress: 40 },
            { icon: <Flame size={24} />, label: 'Current Streak', value: '5 days', sub: 'Best: 12 days' },
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
            <h2 className="text-heading-sm">Recent Achievements</h2>
            <a href="#" className="text-body-sm">View All →</a>
          </div>
          <div className="achievements-row">
            {achievements.map((a, i) => (
              <div key={i} className={`achievement-badge ${a.unlocked ? '' : 'locked'}`}>
                <div className="achievement-icon" style={a.unlocked ? { backgroundColor: `${a.color}20`, color: a.color } : {}}>
                  {a.unlocked ? a.icon : <Lock size={20} />}
                </div>
                <span className="text-caption">{a.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="dash-section" id="leaderboard-section">
          <div className="flex-between" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className="text-heading-sm">Class Leaderboard</h2>
            <span className="badge badge-primary">CS 301 — Cryptography</span>
          </div>
          <div className="card-flat card-sm leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(row => (
                  <tr key={row.rank} className={row.isYou ? 'you-row' : ''}>
                    <td>{row.emoji || `#${row.rank}`}</td>
                    <td className="text-body-sm-bold">{row.isYou ? '→ You' : ''} {row.name}</td>
                    <td>Lv.{row.level}</td>
                    <td>{row.xp} XP</td>
                    <td>{row.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
