import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Info, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import './Explore.css'

const categoryBadgeClass = {
  'Symmetric': 'badge-symmetric',
  'Asymmetric': 'badge-asymmetric',
  'Hash Functions': 'badge-hash',
  'Key Exchange': 'badge-key-exchange',
  'Digital Signatures': 'badge-critical',
  'Classical Ciphers': 'badge-classical',
  'Math Functions': 'badge-primary',
  'Encoding': 'badge-success',
}

export default function Explore() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [algorithms, setAlgorithms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAlgorithms()
      .then(data => {
        setAlgorithms(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch algorithms", err)
        setLoading(false)
      })
  }, [])

  const filtered = algorithms.filter(a => {
    const desc = a.description || a.desc || ''
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="explore-page" id="explore-page">
      <div className="container">
        {/* Search */}
        <div className="explore-search-wrap" id="search-section">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input-search explore-search"
            placeholder="Search algorithms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="search-input"
          />
        </div>

        {/* Category Filters */}
        <div className="pill-tabs explore-filters" id="category-filters">
          {['All', ...new Set(algorithms.map(a => a.category))].map(cat => (
            <button
              key={cat}
              className={`pill-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="explore-layout">
          {/* Algorithm Grid */}
          <div className="explore-grid" id="algorithm-grid">
            {loading && <p style={{ color: 'var(--color-steel)' }}>Loading algorithms...</p>}
            {!loading && filtered.map((algo, i) => (
              <div
                className="card algo-card animate-fade-in-up"
                key={algo.id}
                id={`algo-${algo.id}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="algo-card-header">
                  <h3 className="text-heading-sm">{algo.name}</h3>
                  <button className="btn-icon" title="Algorithm info">
                    <Info size={16} />
                  </button>
                </div>
                <div className="algo-card-meta">
                  <span className={`badge ${categoryBadgeClass[algo.category]}`}>{algo.category}</span>
                  <span className="text-mono text-caption" style={{ color: 'var(--color-steel)' }}>{algo.complexity}</span>
                </div>
                <div className="algo-card-difficulty">
                  <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Difficulty</span>
                  <div className="difficulty-dots">
                    {[1,2,3,4,5].map(d => (
                      <span key={d} className={`difficulty-dot ${d <= algo.difficulty ? 'filled' : ''}`} />
                    ))}
                  </div>
                </div>
                <p className="text-body-sm algo-card-desc">{algo.description || algo.desc}</p>
                <Link to={`/lab/${algo.id}`} className="btn btn-cta btn-sm algo-card-btn" id={`launch-${algo.id}`}>
                  Launch Lab <ArrowRight size={14} />
                </Link>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div className="explore-empty">
                <p className="text-body" style={{ color: 'var(--color-steel)' }}>No algorithms match your search.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="explore-sidebar" id="progress-sidebar">
            <div className="card-flat card-sm">
              {user ? (
                <>
                  <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-lg)' }}>Your Progress</h4>
                  <div className="sidebar-stat">
                    <div className="flex-between" style={{ marginBottom: 'var(--space-xs)' }}>
                      <span className="text-body-sm">Algorithms Mastered</span>
                      <span className="text-body-sm-bold">18 / 45</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="sidebar-stat" style={{ marginTop: 'var(--space-lg)' }}>
                    <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Current Level</span>
                    <div className="text-heading-sm" style={{ color: 'var(--color-primary)' }}>Level 7</div>
                  </div>
                  <div className="sidebar-stat" style={{ marginTop: 'var(--space-base)' }}>
                    <span className="text-caption" style={{ color: 'var(--color-steel)' }}>Total XP</span>
                    <div className="text-heading-sm">2,340 XP</div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
                  <h4 className="text-subtitle-lg" style={{ marginBottom: 'var(--space-md)' }}>Join the Forge</h4>
                  <Lock size={32} style={{ color: 'var(--color-steel)', margin: '0 auto var(--space-md)' }} />
                  <p className="text-body-sm" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-md)' }}>
                    Sign in to track your mastery progress, earn XP, and unlock achievements as you learn.
                  </p>
                  <Link to="/auth" className="btn btn-primary btn-sm btn-full">
                    Sign In to Start
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
