import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import type { Profile, Settings } from '../types/database'
import DisclaimerBanner from '../components/common/DisclaimerBanner'

export default function Dashboard() {
  const { profile, profiles, setProfiles, settings, setSettings } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')

    if (profilesData) {
      // Sıralama: Önce nihai puana göre (büyükten küçüğe)
      // Aynı puandaysa hizmet yılına göre (büyükten küçüğe)
      // Hizmet yılı yoksa 0 kabul edilir
      const sortedProfiles = (profilesData as Profile[]).sort((a, b) => {
        // Önce final_score'a göre sırala (büyükten küçüğe)
        if (b.final_score !== a.final_score) {
          return b.final_score - a.final_score
        }
        
        // Eğer final_score aynıysa, years_of_service'e göre sırala (büyükten küçüğe)
        // NULL veya undefined değerler 0 olarak kabul edilir
        const aYears = a.years_of_service ?? 0
        const bYears = b.years_of_service ?? 0
        return bYears - aYears
      })
      
      setProfiles(sortedProfiles)
    }

    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (settingsData) {
      setSettings(settingsData as Settings)
    }

    setLoading(false)
  }

  const myRank = profiles.findIndex(p => p.id === profile?.id) + 1
  const isInTop27 = myRank > 0 && myRank <= 27

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DisclaimerBanner />
        
        {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Sıralamanız</p>
              <p className="text-3xl font-bold text-white">{myRank || '-'}</p>
              <p className={`text-sm mt-2 ${isInTop27 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                {isInTop27 ? 'İlk 27 içindesiniz' : 'Yedek sıradasınız'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Nihai Puanınız</p>
              <p className="text-3xl font-bold text-white">{profile?.final_score?.toFixed(2)}</p>
              <div className="flex gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                <span>Yazılı: {profile?.written_score}</span>
                <span>Mülakat: {profile?.interview_score}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-1">Tercih Dönemi</p>
              <p className="text-xl font-semibold text-white">
                {settings?.preference_period_open ? 'Açık' : 'Kapalı'}
              </p>
              {settings?.results_published && (
                <p className="text-sm mt-2 text-[var(--color-success)]">Sonuçlar yayınlandı</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-white">Sıralama Tablosu</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Toplam {profiles.length} aday • İlk 27 kişi yerleşecek
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg-tertiary)]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Sıra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Yazılı</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Mülakat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Nihai Puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {profiles.map((p, index) => {
                const rank = index + 1
                const isMe = p.id === profile?.id
                const isTop27 = rank <= 27

                return (
                  <tr 
                    key={p.id} 
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-[var(--color-accent)]/10 border-l-2 border-l-[var(--color-accent)]' 
                        : 'hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        isTop27 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'
                      }`}>
                        {rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isMe ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                          {p.full_name}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs rounded">
                            Siz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-text-secondary)]">
                      {p.written_score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[var(--color-text-secondary)]">
                      {p.interview_score.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-semibold ${isTop27 ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {p.final_score.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

            {profiles.length === 0 && (
            <div className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
              Henüz kayıtlı aday bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
