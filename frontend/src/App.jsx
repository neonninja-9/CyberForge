import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Explore from './pages/Explore'
import Lab from './pages/Lab'
import Pipelines from './pages/Pipelines'
import Challenges from './pages/Challenges'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth page has its own layout (no navbar) */}
          <Route path="/auth" element={<Auth />} />

          {/* All other routes share the navbar layout */}
          <Route path="*" element={
            <>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/lab" element={<Lab />} />
                  <Route path="/lab/:algorithmId" element={<Lab />} />
                  <Route path="/pipelines" element={<Pipelines />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
