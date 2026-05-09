import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Lock, BarChart3, Users, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import './Auth.css'

const floatingSymbols = ['∑', 'π', '⊕', '🔐', '01', '🔑', '∞', 'AES', 'RSA', 'SHA', '∈', 'λ']

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/explore')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) setError(error.message)
  }

  return (
    <div className="auth-page" id="auth-page">
      {/* Left Panel */}
      <div className="auth-brand" id="auth-brand">
        <div className="auth-brand-bg">
          {floatingSymbols.map((sym, i) => (
            <span
              key={i}
              className="auth-symbol"
              style={{
                left: `${10 + (i * 8) % 80}%`,
                top: `${5 + (i * 11) % 85}%`,
                animationDelay: `${i * 0.5}s`,
                fontSize: `${16 + (i % 3) * 6}px`,
              }}
            >
              {sym}
            </span>
          ))}
        </div>
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <FlaskConical size={28} />
            <span>CryptoForge</span>
          </div>
          <h2 className="text-display auth-brand-heading">
            Unlock the World<br />of Cryptography
          </h2>
          <p className="text-subtitle-md" style={{ color: 'var(--color-stone)', marginBottom: 'var(--space-xxxl)' }}>
            Join thousands of students mastering cryptographic algorithms through interactive experimentation
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <Lock size={18} />
              <span>45+ cryptographic algorithms to explore</span>
            </div>
            <div className="auth-feature">
              <BarChart3 size={18} />
              <span>Gamified learning with XP and achievements</span>
            </div>
            <div className="auth-feature">
              <Users size={18} />
              <span>Compete with classmates on the leaderboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-form-panel" id="auth-form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="text-heading-lg">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
          <p className="text-body" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xxl)' }}>
            {isSignUp ? 'Start your cryptography journey' : 'Welcome back to the Forge'}
          </p>

          {error && (
            <div className={`auth-alert ${error.includes('Check') ? 'auth-alert-success' : ''}`}>
              {error}
            </div>
          )}

          <div className="auth-field">
            <label className="label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="label" htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isSignUp && (
              <a href="#" className="text-body-sm auth-forgot">Forgot password?</a>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading}
            id="auth-submit"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social">
            <button type="button" className="btn btn-ghost auth-social-btn" onClick={() => handleOAuth('google')}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" className="btn btn-ghost auth-social-btn" onClick={() => handleOAuth('github')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <p className="text-body-sm auth-switch">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          <p className="text-caption auth-powered">
            Powered by Supabase
          </p>
        </form>
      </div>
    </div>
  )
}
