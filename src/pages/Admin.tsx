import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { runPlacementAlgorithm } from '../lib/algorithm'
import type { Profile, City, Preference, Settings } from '../types/database'

type TabType = 'users' | 'cities' | 'settings' | 'simulation'

export default function Admin() {
  const { profiles, setProfiles, cities, setCities, settings, setSettings } = useStore()
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [newCity, setNewCity] = useState('')
  const [newAccessCode, setNewAccessCode] = useState('')
  const [showAccessCode, setShowAccessCode] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [simulationResults, setSimulationResults] = useState<{ userId: string; cityId: number | null; type: string }[] | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [profilesRes, citiesRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('final_score', { ascending: false }),
      supabase.from('cities').select('*').order('name'),
      supabase.from('settings').select('*').single(),
    ])

    if (profilesRes.data) setProfiles(profilesRes.data as Profile[])
    if (citiesRes.data) setCities(citiesRes.data as City[])
    if (settingsRes.data) setSettings(settingsRes.data as Settings)

    setLoading(false)
  }

  const updateUser = async (userId: string, data: Partial<Profile>) => {
    const finalScore = data.written_score !== undefined && data.interview_score !== undefined
      ? Number(((data.written_score + data.interview_score) / 2).toFixed(2))
      : undefined

    const updateData = finalScore !== undefined ? { ...data, final_score: finalScore } : data

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      setMessage({ type: 'error', text: 'Güncelleme başarısız: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Kullanıcı güncellendi!' })
      setEditingUser(null)
      fetchData()
    }
  }

  const addCity = async () => {
    if (!newCity.trim()) return

    const { error } = await supabase
      .from('cities')
      .insert({ name: newCity.trim(), is_available: true })

    if (error) {
      setMessage({ type: 'error', text: 'Şehir eklenemedi: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Şehir eklendi!' })
      setNewCity('')
      fetchData()
    }
  }

  const deleteCity = async (cityId: number) => {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', cityId)

    if (error) {
      setMessage({ type: 'error', text: 'Şehir silinemedi: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Şehir silindi!' })
      fetchData()
    }
  }

  const togglePreferencePeriod = async () => {
    const { error } = await supabase
      .from('settings')
      .update({ preference_period_open: !settings?.preference_period_open })
      .eq('id', 1)

    if (error) {
      setMessage({ type: 'error', text: 'Ayar güncellenemedi: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Tercih dönemi güncellendi!' })
      fetchData()
    }
  }

  const toggleAutoSimulation = async () => {
    const { error } = await supabase
      .from('settings')
      .update({ auto_simulation: !settings?.auto_simulation })
      .eq('id', 1)

    if (error) {
      setMessage({ type: 'error', text: 'Ayar güncellenemedi: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Otomatik simülasyon güncellendi!' })
      fetchData()
    }
  }

  const updateAccessCode = async () => {
    if (!newAccessCode.trim()) {
      setMessage({ type: 'error', text: 'Erişim kodu boş olamaz!' })
      return
    }

    if (newAccessCode.length < 6) {
      setMessage({ type: 'error', text: 'Erişim kodu en az 6 karakter olmalıdır!' })
      return
    }

    const { error } = await supabase.rpc('update_access_code', {
      new_code: newAccessCode
    })

    if (error) {
      setMessage({ type: 'error', text: 'Erişim kodu güncellenemedi: ' + error.message })
    } else {
      setMessage({ type: 'success', text: '✅ Erişim kodu başarıyla güncellendi!' })
      setNewAccessCode('')
      setShowAccessCode(false)
      fetchData()
    }
  }

  const runSimulation = async () => {
    // Fetch all preferences
    const { data: preferences } = await supabase
      .from('preferences')
      .select('*')

    if (!preferences) {
      setMessage({ type: 'error', text: 'Tercihler yüklenemedi!' })
      return
    }

    const results = runPlacementAlgorithm(profiles, cities, preferences as Preference[])
    setSimulationResults(results)
    setMessage({ type: 'success', text: 'Simülasyon tamamlandı!' })
  }

  const publishResults = async () => {
    if (!simulationResults) return

    // Clear existing assignments
    await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Insert new assignments
    const assignmentsToInsert = simulationResults
      .filter(r => r.cityId !== null)
      .map(r => ({
        user_id: r.userId,
        city_id: r.cityId,
        assignment_type: r.type,
      }))

    if (assignmentsToInsert.length > 0) {
      const { error } = await supabase
        .from('assignments')
        .insert(assignmentsToInsert)

      if (error) {
        setMessage({ type: 'error', text: 'Sonuçlar yayınlanamadı: ' + error.message })
        return
      }
    }

    // Update settings
    await supabase
      .from('settings')
      .update({ results_published: true })
      .eq('id', 1)

    setMessage({ type: 'success', text: 'Sonuçlar yayınlandı!' })
    fetchData()
  }

  const tabs = [
    { id: 'users' as const, label: 'Kullanıcılar', icon: '👥' },
    { id: 'cities' as const, label: 'Şehirler', icon: '🏙️' },
    { id: 'settings' as const, label: 'Ayarlar', icon: '⚙️' },
    { id: 'simulation' as const, label: 'Simülasyon', icon: '🎲' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-[var(--color-text-secondary)]">Sistem yönetimi ve simülasyon</p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-white">Kullanıcı Yönetimi</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{profiles.length} kayıtlı kullanıcı</p>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-bg)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Ad Soyad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">E-posta</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Yazılı</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Mülakat</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Nihai</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Hizmet</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Admin</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-light)]">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-surface-light)]/30">
                    <td className="px-4 py-3 text-white">{p.full_name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{p.email}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{p.written_score.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{p.interview_score.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-teal-400">{p.final_score.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.years_of_service !== null && p.years_of_service !== undefined ? (
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 font-medium">
                          {p.years_of_service} yıl
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${p.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {p.is_admin ? 'Evet' : 'Hayır'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setEditingUser(p)}
                        className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded text-sm hover:bg-teal-500/30 transition-all"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-white">Şehir Yönetimi</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{cities.length} şehir tanımlı</p>
            </div>

            
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Yeni şehir adı..."
                  className="flex-1 px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] transition-all"
                />
                <button
                  onClick={addCity}
                  className="btn-primary px-6"
                >
                  Ekle
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg"
                  >
                    <span className="text-white text-sm">{city.name}</span>
                    <button
                      onClick={() => deleteCity(city.id)}
                      className="p-1 text-[var(--color-text-secondary)] hover:text-red-400 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-white">Sistem Ayarları</h2>
            </div>

            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg">
                <div>
                  <p className="text-white font-medium">Tercih Dönemi</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Kullanıcıların tercih yapabilmesini kontrol eder</p>
                </div>
                <button
                  onClick={togglePreferencePeriod}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings?.preference_period_open
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {settings?.preference_period_open ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg">
                <div>
                  <p className="text-white font-medium">Otomatik Simülasyon</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Tercih güncellendiğinde otomatik olarak simülasyon çalıştır ve sonuçları yayınla</p>
                </div>
                <button
                  onClick={toggleAutoSimulation}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings?.auto_simulation
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {settings?.auto_simulation ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg">
                <div>
                  <p className="text-white font-medium">Sonuçlar Yayınlandı</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">Yerleştirme sonuçlarının durumu</p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-medium ${
                  settings?.results_published
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                }`}>
                  {settings?.results_published ? 'Yayınlandı' : 'Yayınlanmadı'}
                </span>
              </div>

              {/* Erişim Kodu Yönetimi */}
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-2xl">
                    🔐
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium flex items-center gap-2">
                      Erişim Kodu Yönetimi
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Kritik</span>
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      Sisteme kayıt olmak için gerekli olan özel erişim kodunu buradan değiştirebilirsiniz
                    </p>
                  </div>
                </div>

                {!showAccessCode ? (
                  <button
                    onClick={() => setShowAccessCode(true)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all font-medium text-sm"
                  >
                    🔑 Erişim Kodunu Değiştir
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                        Yeni Erişim Kodu (min 6 karakter)
                      </label>
                      <input
                        type="text"
                        value={newAccessCode}
                        onChange={(e) => setNewAccessCode(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:border-red-500/50 transition-all"
                        placeholder="Yeni güvenli kod giriniz"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={updateAccessCode}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm"
                      >
                        ✅ Kodu Değiştir
                      </button>
                      <button
                        onClick={() => {
                          setShowAccessCode(false)
                          setNewAccessCode('')
                        }}
                        className="px-4 py-2 bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-all font-medium text-sm"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-white">Yerleştirme Simülasyonu</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Algoritma ile yerleştirme sonuçlarını hesapla</p>
              </div>

              
              <div className="p-6">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={runSimulation}
                    className="btn-primary px-6 py-3"
                  >
                    Simülasyonu Çalıştır
                  </button>

                  {simulationResults && (
                    <button
                      onClick={publishResults}
                      className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-all"
                    >
                      Sonuçları Yayınla
                    </button>
                  )}
                </div>
              </div>
            </div>

            {simulationResults && (
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                  <h2 className="text-lg font-semibold text-white">Simülasyon Sonuçları</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[var(--color-bg-tertiary)]">
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Sıra</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Kullanıcı</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Atanan Şehir</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Tür</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {simulationResults.map((result, index) => {
                        const user = profiles.find(p => p.id === result.userId)
                        const city = cities.find(c => c.id === result.cityId)
                        return (
                          <tr key={result.userId} className="hover:bg-[var(--color-bg-tertiary)]">
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">{index + 1}</td>
                            <td className="px-4 py-3 text-white">{user?.full_name || '-'}</td>
                            <td className="px-4 py-3 text-[var(--color-accent)]">{city?.name || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                result.type === 'preference' ? 'bg-emerald-500/20 text-emerald-400' :
                                result.type === 'lottery' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {result.type === 'preference' ? 'Tercih' :
                                 result.type === 'lottery' ? 'Kura' : 'Yerleşemedi'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] shadow-2xl w-full max-w-md animate-slide-up">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Kullanıcı Düzenle</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const formData = new FormData(form)
                const yearsValue = formData.get('years_of_service') as string
                updateUser(editingUser.id, {
                  full_name: formData.get('full_name') as string,
                  written_score: parseFloat(formData.get('written_score') as string),
                  interview_score: parseFloat(formData.get('interview_score') as string),
                  years_of_service: yearsValue ? parseInt(yearsValue) : null,
                  is_admin: formData.get('is_admin') === 'on',
                })
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Ad Soyad</label>
                <input
                  name="full_name"
                  defaultValue={editingUser.full_name}
                  className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Yazılı Puanı</label>
                  <input
                    name="written_score"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={editingUser.written_score}
                    className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Mülakat Puanı</label>
                  <input
                    name="interview_score"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    defaultValue={editingUser.interview_score}
                    className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Hizmet Yılı <span className="text-xs text-[var(--color-text-tertiary)]">(İsteğe Bağlı)</span>
                </label>
                <input
                  name="years_of_service"
                  type="number"
                  min="0"
                  max="50"
                  defaultValue={editingUser.years_of_service ?? ''}
                  placeholder="Örn: 5 (boş bırakılabilir)"
                  className="w-full px-4 py-3 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg text-white placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
                />
                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                  💡 Aynı puana sahip kullanıcılar arasında tie-breaker olarak kullanılır
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg">
                <input
                  name="is_admin"
                  type="checkbox"
                  defaultChecked={editingUser.is_admin}
                  className="mt-0.5 w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <label className="text-sm font-medium text-white cursor-pointer">Admin Yetkisi Ver</label>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Bu kullanıcı admin paneline erişebilir ve tüm ayarları değiştirebilir</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)] mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-all font-medium text-sm shadow-lg shadow-[var(--color-accent)]/20"
                >
                  ✓ Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
