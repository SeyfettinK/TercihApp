import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import type { Profile, City, Assignment, Settings, Preference } from '../types/database'

interface AssignmentWithDetails extends Assignment {
  profile?: Profile
  city?: City
  preferences?: Preference[]
}

export default function Results() {
  const { profile, settings, setSettings } = useStore()
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [myAssignment, setMyAssignment] = useState<AssignmentWithDetails | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [assignmentsRes, profilesRes, citiesRes, settingsRes, preferencesRes] = await Promise.all([
      supabase.from('assignments').select('*'),
      supabase.from('profiles').select('*').order('final_score', { ascending: false }),
      supabase.from('cities').select('*').order('name'),
      supabase.from('settings').select('*').single(),
      supabase.from('preferences').select('*').order('priority'),
    ])

    if (settingsRes.data) setSettings(settingsRes.data as Settings)
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[])
    if (citiesRes.data) setCities(citiesRes.data as City[])

    if (assignmentsRes.data && profilesRes.data && citiesRes.data && preferencesRes.data) {
      const enrichedAssignments: AssignmentWithDetails[] = assignmentsRes.data.map((a: Assignment) => ({
        ...a,
        profile: profilesRes.data.find((p: Profile) => p.id === a.user_id),
        city: citiesRes.data.find((c: City) => c.id === a.city_id),
        preferences: preferencesRes.data.filter((pref: Preference) => pref.user_id === a.user_id),
      }))

      // Sort by profile's final score
      enrichedAssignments.sort((a, b) => 
        (b.profile?.final_score || 0) - (a.profile?.final_score || 0)
      )

      setAssignments(enrichedAssignments)

      // Find my assignment
      const mine = enrichedAssignments.find(a => a.user_id === profile?.id)
      setMyAssignment(mine || null)
    }

    setLoading(false)
  }

  const getMyRank = () => {
    const idx = profiles.findIndex(p => p.id === profile?.id)
    return idx >= 0 ? idx + 1 : null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!settings?.results_published) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-5xl mb-6">
            ⏳
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Sonuçlar Henüz Yayınlanmadı</h1>
          <p className="text-[var(--color-text-secondary)]">
            Yerleştirme sonuçları henüz yayınlanmamıştır. Sonuçlar yayınlandığında burada görebilirsiniz.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Yerleştirme Sonuçları</h1>
          <p className="text-[var(--color-text-secondary)]">Tercih sonuçları ve yerleştirmeler</p>
        </div>

        {/* My Result Card */}
        {profile && (
          <div className={`card mb-8 p-6 ${
            myAssignment 
              ? 'border-emerald-500/30' 
              : 'border-amber-500/30'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
                myAssignment 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {myAssignment ? '✓' : '–'}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">{profile.full_name}</h2>
                <p className="text-[var(--color-text-secondary)]">
                  Sıralama: {getMyRank()} | Nihai Puan: {profile.final_score.toFixed(2)}
                  {profile.years_of_service !== null && profile.years_of_service !== undefined && (
                    <> | Hizmet Yılı: {profile.years_of_service} yıl</>
                  )}
                </p>
                {myAssignment ? (
                  <div className="mt-3">
                    <span className="text-[var(--color-text-secondary)]">Yerleştiğiniz İl: </span>
                    <span className="text-2xl font-bold text-emerald-400">{myAssignment.city?.name}</span>
                    <span className={`ml-3 px-2 py-1 rounded text-xs ${
                      myAssignment.assignment_type === 'preference' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {myAssignment.assignment_type === 'preference' ? 'Tercih ile' : 'Kura ile'}
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 text-amber-400">Maalesef yerleşemediniz.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
                ✓
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)] text-sm">Tercih ile Yerleşen</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {assignments.filter(a => a.assignment_type === 'preference').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-bold">
                ~
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)] text-sm">Kura ile Yerleşen</p>
                <p className="text-2xl font-bold text-amber-400">
                  {assignments.filter(a => a.assignment_type === 'lottery').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] text-xl font-bold">
                Σ
              </div>
              <div>
                <p className="text-[var(--color-text-tertiary)] text-sm">Toplam Yerleşen</p>
                <p className="text-2xl font-bold text-[var(--color-accent)]">
                  {assignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-white">Tüm Yerleştirmeler</h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Yeşil çerçeve = Yerleştiği il
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-bg-tertiary)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Sıra</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Ad Soyad</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Nihai Puan</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Hizmet Yılı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Tercihleri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Yerleştiği İl</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase">Tür</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
              {assignments.map((assignment, index) => {
                const isMe = assignment.user_id === profile?.id
                const sortedPrefs = (assignment.preferences || []).sort((a, b) => a.priority - b.priority)
                
                return (
                  <tr 
                    key={assignment.id} 
                    className={`transition-colors ${
                      isMe 
                        ? 'bg-[var(--color-accent)]/10 border-l-2 border-l-[var(--color-accent)]' 
                        : 'hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        index < 3 
                          ? 'text-[var(--color-accent)]' 
                          : 'text-[var(--color-text-secondary)]'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isMe ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                          {assignment.profile?.full_name || '-'}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs rounded">
                            Siz
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {assignment.profile?.final_score.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {assignment.profile?.years_of_service !== null && assignment.profile?.years_of_service !== undefined ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          📅 {assignment.profile.years_of_service} yıl
                        </span>
                      ) : (
                        <span className="text-[var(--color-text-tertiary)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sortedPrefs.map((pref) => {
                          const prefCity = cities.find(c => c.id === pref.city_id)
                          const isAssigned = pref.city_id === assignment.city_id
                          
                          return (
                            <div
                              key={pref.id}
                              className={`px-2 py-1 rounded text-xs ${
                                isAssigned
                                  ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 font-semibold'
                                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                              }`}
                              title={`${pref.priority}. tercih`}
                            >
                              {pref.priority}. {prefCity?.name || '-'}
                            </div>
                          )
                        })}
                        {sortedPrefs.length === 0 && (
                          <span className="text-[var(--color-text-tertiary)] text-xs italic">
                            Tercih yapılmamış
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      {assignment.city?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        assignment.assignment_type === 'preference' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {assignment.assignment_type === 'preference' ? 'Tercih' : 'Kura'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>

          {assignments.length === 0 && (
            <div className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
              Henüz yerleştirme yapılmamış.
            </div>
          )}
        </div>

        {/* City Assignments Grid */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-lg font-semibold text-white">Şehir Bazlı Görünüm</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {cities.map((city) => {
              const assignment = assignments.find(a => a.city_id === city.id)
              const isMyCity = assignment?.user_id === profile?.id
              return (
                <div 
                  key={city.id} 
                  className={`p-4 rounded-lg border ${
                    isMyCity 
                      ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]' 
                      : assignment 
                        ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)]' 
                        : 'bg-[var(--color-bg-secondary)] border-dashed border-[var(--color-border)]'
                  }`}
                >
                  <p className={`font-medium text-sm ${isMyCity ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                    {city.name}
                  </p>
                  {assignment ? (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {assignment.profile?.full_name}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Boş</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

