import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-loaded pages for code-splitting
const Landing = lazy(() => import('./pages/Landing'))
const Explore = lazy(() => import('./pages/Explore'))
const Lab = lazy(() => import('./pages/Lab'))
const Pipelines = lazy(() => import('./pages/Pipelines'))
const Challenges = lazy(() => import('./pages/Challenges'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Auth = lazy(() => import('./pages/Auth'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div className="auth-loading-spinner" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth page has its own layout (no navbar) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<Auth />} />

              {/* All other routes share the navbar layout */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main style={{ flex: 1 }}>
                    <Routes>
                      {/* Landing is public */}
                      <Route path="/" element={<Landing />} />

                      {/* Public pages — free for all visitors */}
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/lab" element={<Lab />} />
                      <Route path="/lab/:algorithmId" element={<Lab />} />
                      <Route path="/pipelines" element={<Pipelines />} />

                      {/* Gated pages — require login */}
                      <Route path="/challenges" element={
                        <ProtectedRoute><Challenges /></ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                      } />

                      {/* 404 fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: 'var(--space-xxl)',
    }}>
      <h1 className="text-display" style={{ marginBottom: 'var(--space-base)' }}>404</h1>
      <p className="text-body" style={{ color: 'var(--color-steel)', marginBottom: 'var(--space-xl)' }}>
        Page not found. The page you're looking for doesn't exist.
      </p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  )
}

