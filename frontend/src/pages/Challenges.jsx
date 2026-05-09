import { Link } from 'react-router-dom'
import { Flame, Clock, Trophy, ArrowRight, CheckCircle, BarChart3 } from 'lucide-react'
import './Challenges.css'

const challenges = [
  {
    id: 'daily',
    type: 'daily',
    title: 'Break the Substitution Cipher',
    desc: "You've intercepted an encrypted message. Using frequency analysis and pattern recognition, decrypt the hidden text.",
    difficulty: 'Medium',
    xp: 250,
    timeLeft: '18h 42m',
    attempts: 47,
  },
  {
    id: 'c1',
    title: 'Decrypt the Caesar Shift',
    desc: 'Given a message shifted by an unknown key, find the plaintext.',
    difficulty: 'Easy',
    xp: 50,
    timeLeft: null,
  },
  {
    id: 'c2',
    title: 'Base64 Decode Chain',
    desc: 'Decode a triple-encoded Base64 message to reveal the flag.',
    difficulty: 'Easy',
    xp: 75,
    timeLeft: null,
  },
  {
    id: 'c3',
    title: 'AES Key Recovery',
    desc: 'Given plaintext-ciphertext pairs encrypted with AES-128-ECB, recover the key.',
    difficulty: 'Medium',
    xp: 150,
    timeLeft: '2h 34m',
  },
  {
    id: 'c4',
    title: 'Hash Collision Hunt',
    desc: 'Find two different inputs that produce the same MD5 hash prefix.',
    difficulty: 'Medium',
    xp: 175,
    timeLeft: null,
  },
  {
    id: 'c5',
    title: 'RSA Factoring Challenge',
    desc: 'Factor a 256-bit RSA modulus given only the public key.',
    difficulty: 'Hard',
    xp: 300,
    timeLeft: '5h left',
  },
  {
    id: 'c6',
    title: 'ROT13 Roundtrip',
    desc: 'Prove that ROT13 applied twice returns the original text.',
    difficulty: 'Easy',
    xp: 50,
    completed: true,
  },
]

const difficultyBadge = { 'Easy': 'badge-easy', 'Medium': 'badge-medium', 'Hard': 'badge-hard' }

export default function Challenges() {
  return (
    <div className="challenges-page" id="challenges-page">
      <div className="challenges-layout">
        <main className="challenges-main">
          {/* Header */}
          <div className="challenges-header" id="challenges-header">
            <div>
              <h1 className="text-heading-lg" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Flame size={28} /> Challenge Arena
              </h1>
              <p className="text-body" style={{ color: 'var(--color-steel)', marginTop: 'var(--space-xs)' }}>
                Test your cryptography skills and earn XP
              </p>
            </div>
            <div className="flex gap-md">
              <span className="badge badge-primary">Active: 5</span>
              <span className="badge badge-success">Completed: 12</span>
              <span className="badge" style={{ backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-steel)' }}>Locked: 13</span>
            </div>
          </div>

          {/* Challenge Cards */}
          <div className="challenges-list" id="challenges-list">
            {challenges.map((ch, i) => (
              <div
                key={ch.id}
                className={`card-flat card-sm challenge-card ${ch.type === 'daily' ? 'card-featured' : ''} ${ch.completed ? 'challenge-done' : ''} animate-fade-in-up`}
                id={`challenge-${ch.id}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {ch.type === 'daily' && (
                  <span className="badge badge-gold" style={{ marginBottom: 'var(--space-md)' }}>⚡ DAILY CHALLENGE</span>
                )}
                <div className="challenge-card-top">
                  <div>
                    <span className={`badge ${difficultyBadge[ch.difficulty]}`} style={{ marginRight: 'var(--space-md)' }}>{ch.difficulty}</span>
                    {ch.completed && <span className="badge badge-success"><CheckCircle size={12} /> Completed</span>}
                  </div>
                </div>
                <h3 className={`text-subtitle-lg ${ch.completed ? 'challenge-title-done' : ''}`}>{ch.title}</h3>
                <p className="text-body-sm" style={{ color: 'var(--color-steel)', margin: 'var(--space-xs) 0 var(--space-base)' }}>{ch.desc}</p>
                <div className="challenge-card-footer">
                  <div className="flex gap-lg">
                    <span className="text-body-sm-bold" style={{ color: '#b8860b' }}>🏆 {ch.xp} XP</span>
                    {ch.timeLeft && <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}><Clock size={13} /> {ch.timeLeft}</span>}
                    {ch.attempts && <span className="text-body-sm" style={{ color: 'var(--color-steel)' }}>📊 {ch.attempts} attempts</span>}
                  </div>
                  {!ch.completed && (
                    <button className="btn btn-primary btn-sm">
                      Start <ArrowRight size={14} />
                    </button>
                  )}
                  {ch.completed && (
                    <span className="text-body-sm" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                      {ch.xp} XP earned ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="challenges-sidebar" id="challenge-stats">
          <div className="card-flat card-sm">
            <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-xl)' }}>Your Challenge Stats</h4>

            <div className="donut-chart-wrap">
              <svg viewBox="0 0 100 100" className="donut-chart">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-surface-soft)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-primary)" strokeWidth="10"
                  strokeDasharray="251.2" strokeDashoffset="150.72" strokeLinecap="round"
                  transform="rotate(-90 50 50)" />
              </svg>
              <div className="donut-center">
                <span className="text-heading-sm">40%</span>
                <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Complete</span>
              </div>
            </div>

            <div className="challenge-stat-list">
              <div className="challenge-stat-row">
                <span className="text-body-sm">XP Earned</span>
                <span className="text-body-sm-bold" style={{ color: 'var(--color-primary)' }}>875 XP</span>
              </div>
              <div className="challenge-stat-row">
                <span className="text-body-sm">Avg. Time</span>
                <span className="text-body-sm-bold">12 min</span>
              </div>
              <div className="challenge-stat-row">
                <span className="text-body-sm">Ranking</span>
                <span className="text-body-sm-bold">#4 in class</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
