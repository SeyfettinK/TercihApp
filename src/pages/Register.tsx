import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { calculateFinalScore } from '../lib/algorithm'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    writtenScore: '',
    interviewScore: '',
    accessCode: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Önce erişim kodunu kontrol et
    const { data: codeCheck, error: codeError } = await supabase.rpc('verify_access_code', {
      code_input: formData.accessCode
    })

    if (codeError || !codeCheck) {
      setError('❌ Hatalı erişim kodu! Bu sisteme sadece özel davet edilen kişiler erişebilir.')
      setLoading(false)
      return
    }

    // 2. Kullanım şartları kontrolü
    if (!acceptedTerms) {
      setError('Devam etmek için Kullanım Şartları ve Gizlilik Politikasını kabul etmelisiniz')
      setLoading(false)
      return
    }

    // 3. Puan kontrolü
    const written = parseFloat(formData.writtenScore)
    const interview = parseFloat(formData.interviewScore)

    if (isNaN(written) || isNaN(interview) || written < 0 || written > 100 || interview < 0 || interview > 100) {
      setError('Puanlar 0-100 arasında olmalıdır')
      setLoading(false)
      return
    }

    const finalScore = calculateFinalScore(written, interview)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        written_score: written,
        interview_score: interview,
        final_score: finalScore,
        wants_lottery: false,
        is_admin: false,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      navigate('/dashboard')
    }
  }

  const previewScore = () => {
    const written = parseFloat(formData.writtenScore)
    const interview = parseFloat(formData.interviewScore)
    if (!isNaN(written) && !isNaN(interview)) {
      return calculateFinalScore(written, interview)
    }
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">🤖</div>
          <h1 className="text-3xl font-bold text-white mb-2">Kayıt Ol</h1>
          <p className="text-[var(--color-text-secondary)]">Tercih sistemine katılın</p>
        </div>

        <div className="card p-8 animate-slide-up">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Erişim Kodu - En Önemli! */}
            <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/30 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-[var(--color-accent)] mb-2 flex items-center gap-2">
                🔐 Erişim Kodu
                <span className="text-xs bg-[var(--color-accent)]/20 px-2 py-0.5 rounded">Zorunlu</span>
              </label>
              <input
                type="text"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] transition-all"
                placeholder="Özel erişim kodunuzu girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                placeholder="Adınız Soyadınız"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                placeholder="En az 6 karakter"
                minLength={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Yazılı Puanı
                </label>
                <input
                  type="number"
                  name="writtenScore"
                  value={formData.writtenScore}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                  placeholder="85.50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Mülakat Puanı
                </label>
                <input
                  type="number"
                  name="interviewScore"
                  value={formData.interviewScore}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                  placeholder="90.00"
                  required
                />
              </div>
            </div>

            {previewScore() !== null && (
              <div className="bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Hesaplanan Nihai Puan:</span>
                  <span className="text-2xl font-bold text-[var(--color-accent)]">{previewScore()}</span>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-amber-400 text-sm font-semibold mb-1">
                    Önemli Uyarı
                  </p>
                  <p className="text-amber-400/80 text-xs">
                    Bu uygulama <strong>sadece simülasyon amaçlıdır</strong> ve hiçbir resmi kurum ile ilişkisi yoktur. 
                    Sonuçlar <strong>bağlayıcı değildir</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms & Privacy Checkbox */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[var(--color-text-secondary)] text-sm flex-1">
                <Link to="/terms-of-service" target="_blank" className="text-[var(--color-accent)] hover:underline">
                  Kullanım Şartları
                </Link>
                {' '}ve{' '}
                <Link to="/privacy-policy" target="_blank" className="text-[var(--color-accent)] hover:underline">
                  Gizlilik Politikası
                </Link>
                'nı okudum ve kabul ediyorum.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[var(--color-text-secondary)] text-sm">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-[var(--color-accent)] hover:underline font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
