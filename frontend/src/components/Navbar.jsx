import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Flame, FlaskConical, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import './Navbar.css'

const navItems = [
  { path: '/explore', label: 'Explore' },
  { path: '/lab', label: 'Lab' },
  { path: '/pipelines', label: 'Pipelines' },
  { path: '/challenges', label: 'Challenges' },
  { path: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLanding = location.pathname === '/'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className={`navbar ${isLanding ? 'navbar-transparent' : ''}`} id="main-nav">
      <div className="navbar-inner container">
        <NavLink to="/" className="navbar-logo" id="logo">
          <FlaskConical size={24} />
          <span>CryptoForge</span>
        </NavLink>

        <div className="pill-tabs" id="nav-tabs">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `pill-tab ${isActive ? 'active' : ''}`}
              id={`nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <NavLink to="/dashboard" className="btn btn-ghost btn-sm" title="Dashboard">
                <User size={18} />
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className="btn btn-primary btn-sm" id="nav-signin">
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
