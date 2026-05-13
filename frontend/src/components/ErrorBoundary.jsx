import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: 'var(--color-bg, #0a0a0f)',
          color: 'var(--color-text, #e6e8ed)',
          textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <h1 style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8b8fa3', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <pre style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '1rem',
            maxWidth: '600px',
            overflow: 'auto',
            fontSize: '13px',
            color: '#f87171',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
