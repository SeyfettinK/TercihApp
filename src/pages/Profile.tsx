import { useState } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { profile, setProfile } = useStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Şifre değiştirme
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // Kura tercihi
  const [wantsLottery, setWantsLottery] = useState(profile?.wants_lottery || false)
  const [lotteryLoading, setLotteryLoading] = useState(false)

  // Hizmet yılı
  const [yearsOfService, setYearsOfService] = useState<number | null>(profile?.years_of_service ?? null)
  const [editingYears, setEditingYears] = useState(false)
  const [yearsLoading, setYearsLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validasyon
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' })
      setLoading(false)
      return
    }

    if (passwords.new.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır!' })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      })

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Şifreniz başarıyla değiştirildi!' })
      setPasswords({ current: '', new: '', confirm: '' })
      setShowPasswords(false)
    } catch (error: any) {
      setMessage({ type: 'error', text: `Şifre değiştirilemedi: ${error.message}` })
    }

    setLoading(false)
  }

  const handleLotteryChange = async () => {
    setLotteryLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wants_lottery: !wantsLottery })
        .eq('id', profile?.id)

      if (error) throw error

      setWantsLottery(!wantsLottery)
      setProfile({ ...profile!, wants_lottery: !wantsLottery })
      setMessage({ type: 'success', text: '✅ Kura tercihiniz güncellendi!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: `Güncelleme başarısız: ${error.message}` })
    }

    setLotteryLoading(false)
  }

  const handleYearsUpdate = async () => {
    setYearsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ years_of_service: yearsOfService })
        .eq('id', profile?.id)

      if (error) throw error

      setProfile({ ...profile!, years_of_service: yearsOfService ?? undefined })
      setEditingYears(false)
      setMessage({ type: 'success', text: '✅ Hizmet yılı bilginiz güncellendi!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: `Güncelleme başarısız: ${error.message}` })
    }

    setYearsLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profilim</h1>
          <p className="text-[var(--color-text-secondary)]">Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Profil Kartı */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1">{profile.full_name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">{profile.email}</p>
                
                {profile.is_admin && (
                  <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-4">
                    👑 Admin
                  </div>
                )}

                <div className="border-t border-[var(--color-border)] pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-secondary)]">Yazılı Puanı</span>
                    <span className="text-sm font-semibold text-white">{profile.written_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--color-text-secondary)]">Mülakat Puanı</span>
                    <span className="text-sm font-semibold text-white">{profile.interview_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                    <span className="text-sm font-bold text-[var(--color-text-secondary)]">Nihai Puan</span>
                    <span className="text-lg font-bold text-[var(--color-accent)]">{profile.final_score.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Ayarlar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hizmet Yılı */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Hizmet Yılı</h3>
                {!editingYears && (
                  <button
                    onClick={() => setEditingYears(true)}
                    className="px-4 py-2 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)]/30 transition-all text-sm font-medium"
                  >
                    ✏️ Düzenle
                  </button>
                )}
              </div>
              
              {editingYears ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                      📅
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">Hizmet Yılınızı Girin</p>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        Aynı puana sahip olduğunuz başka kullanıcılar varsa, hizmet yılı daha yüksek olan öncelikli olarak yerleştirilir.
                        Bu alan <strong>isteğe bağlıdır</strong>, boş bırakabilirsiniz.
                      </p>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                          Hizmet Yılı (İsteğe Bağlı)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={yearsOfService ?? ''}
                          onChange={(e) => setYearsOfService(e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] transition-all"
                          placeholder="Örn: 5 (boş bırakabilirsiniz)"
                        />
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                          💡 İpucu: Girmeseniz de olur. Ama girerseniz aynı puandaki diğer adaylara göre avantajlı olursunuz!
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingYears(false)
                            setYearsOfService(profile?.years_of_service ?? null)
                            setMessage(null)
                          }}
                          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-all"
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleYearsUpdate}
                          disabled={yearsLoading}
                          className="btn-primary px-5 py-2.5"
                        >
                          {yearsLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Kaydediliyor...
                            </span>
                          ) : (
                            '✓ Kaydet'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Hizmet Süreniz</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {yearsOfService !== null && yearsOfService !== undefined 
                        ? `${yearsOfService} yıl - Aynı puana sahip adaylar arasında hizmet yılı yüksek olan öncelikli yerleşir`
                        : 'Henüz girilmedi - Aynı puanda olup hizmet yılı girmeyenler 0 yıl kabul edilir'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Kura Tercihi */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-white">Genel Kura Tercihi</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                    🎲
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">Kuraya Katılım</p>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                      Tercihlerinizden hiçbiri gelmezse, kalan boş şehirler arasında kuraya katılmak ister misiniz?
                    </p>
                    <button
                      onClick={handleLotteryChange}
                      disabled={lotteryLoading}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        wantsLottery
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)]'
                      }`}
                    >
                      {lotteryLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Güncelleniyor...
                        </span>
                      ) : wantsLottery ? (
                        '✓ Kuraya Katılıyorum'
                      ) : (
                        '✗ Kuraya Katılmıyorum'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Şifre Değiştirme */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Güvenlik</h3>
                {!showPasswords && (
                  <button
                    onClick={() => setShowPasswords(true)}
                    className="px-4 py-2 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)]/30 transition-all text-sm font-medium"
                  >
                    🔑 Şifre Değiştir
                  </button>
                )}
              </div>
              
              {showPasswords ? (
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] transition-all"
                      placeholder="En az 6 karakter"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] transition-all"
                      placeholder="Şifrenizi tekrar girin"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswords(false)
                        setPasswords({ current: '', new: '', confirm: '' })
                        setMessage(null)
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-all"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary px-5 py-2.5"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Değiştiriliyor...
                        </span>
                      ) : (
                        '✓ Şifreyi Değiştir'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center text-2xl">
                    🔒
                  </div>
                  <div>
                    <p className="text-white font-medium">Şifreniz Güvenli</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      Son değişiklik: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hesap İşlemleri */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-white">Hesap İşlemleri</h3>
              </div>
              <div className="p-6">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all font-medium"
                >
                  🚪 Çıkış Yap
                </button>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-3 text-center">
                  Hesap kaydı: {new Date(profile.created_at).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

