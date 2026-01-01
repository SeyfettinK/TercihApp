import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Önce erişim kodunu kontrol et
    const { data: codeCheck, error: codeError } = await supabase.rpc('verify_access_code', {
      code_input: accessCode
    })

    if (codeError || !codeCheck) {
      setError('❌ Hatalı erişim kodu! Lütfen geçerli bir kod girin.')
      setLoading(false)
      return
    }

    // 2. Erişim kodu doğruysa, normal login işlemine devam et
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-3xl font-bold text-white mb-2">Tercih Robotu</h1>
          <p className="text-[var(--color-text-secondary)]">Ünvan Değişikliği Tercih Sistemi</p>
        </div>

        <div className="card p-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-white mb-6">Giriş Yap</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Erişim Kodu */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                🔐 Erişim Kodu
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] transition-all"
                placeholder="Özel erişim kodunuzu girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[var(--color-text-secondary)] text-sm">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-[var(--color-accent)] hover:underline font-medium">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
