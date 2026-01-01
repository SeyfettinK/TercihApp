import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'

export default function Navbar() {
  const { profile } = useStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Sıralama' },
    { path: '/preferences', label: 'Tercihler' },
    { path: '/results', label: 'Sonuçlar' },
  ]

  if (profile?.is_admin) {
    navItems.push({ path: '/admin', label: 'Admin' })
  }

  return (
    <nav className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-white hover:text-[var(--color-accent)] transition-colors group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
              <span>Tercih Robotu</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30'
                  : 'hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {profile?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">Puan: {profile?.final_score?.toFixed(2)}</p>
              </div>
            </Link>
            
            {/* Mobile Profile Button */}
            <Link
              to="/profile"
              className="sm:hidden w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center text-xs font-bold text-white"
            >
              {profile?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Link>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3 flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname === item.path
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
