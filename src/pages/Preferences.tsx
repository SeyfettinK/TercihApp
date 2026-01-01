import { useEffect, useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import type { City, Settings } from '../types/database'
import SortablePreference from '../components/preferences/SortablePreference'
import { runPlacementAlgorithmAsync } from '../lib/algorithm'

interface PreferenceItem {
  id: string
  cityId: number
  cityName: string
  priority: number
}

export default function Preferences() {
  const { profile, cities, setCities, settings, setSettings } = useStore()
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceItem[]>([])
  const [wantsLottery, setWantsLottery] = useState(profile?.wants_lottery || false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: citiesData } = await supabase
      .from('cities')
      .select('*')
      .order('name')

    if (citiesData) {
      setCities(citiesData as City[])
    }

    if (profile) {
      const { data: prefsData } = await supabase
        .from('preferences')
        .select('*, cities(name)')
        .eq('user_id', profile.id)
        .order('priority')

      if (prefsData && prefsData.length > 0) {
        const prefs: PreferenceItem[] = prefsData.map((p: { id: string; city_id: number; cities: { name: string }; priority: number }) => ({
          id: p.id,
          cityId: p.city_id,
          cityName: p.cities.name,
          priority: p.priority,
        }))
        setSelectedPreferences(prefs)
      }
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSelectedPreferences((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addPreference = (city: City) => {
    if (selectedPreferences.length >= 10) {
      setMessage({ type: 'error', text: 'En fazla 10 tercih yapabilirsiniz!' })
      return
    }

    if (selectedPreferences.some(p => p.cityId === city.id)) {
      setMessage({ type: 'error', text: 'Bu şehri zaten tercih ettiniz!' })
      return
    }

    const newPref: PreferenceItem = {
      id: `temp-${Date.now()}`,
      cityId: city.id,
      cityName: city.name,
      priority: selectedPreferences.length + 1,
    }

    setSelectedPreferences([...selectedPreferences, newPref])
    setMessage(null)
  }

  const removePreference = (id: string) => {
    setSelectedPreferences(selectedPreferences.filter(p => p.id !== id))
  }

  const savePreferences = async () => {
    if (!profile) return

    setSaving(true)
    setMessage(null)

    try {
      // 1. Tercihleri kaydet
      await supabase
        .from('preferences')
        .delete()
        .eq('user_id', profile.id)

      if (selectedPreferences.length > 0) {
        const prefsToInsert = selectedPreferences.map((p, index) => ({
          user_id: profile.id,
          city_id: p.cityId,
          priority: index + 1,
        }))

        const { error } = await supabase
          .from('preferences')
          .insert(prefsToInsert)

        if (error) throw error
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ wants_lottery: wantsLottery })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // 2. Otomatik simülasyon çalıştır (eğer ayar aktifse)
      if (settings?.auto_simulation) {
        setMessage({ type: 'success', text: 'Tercihleriniz kaydedildi, simülasyon çalıştırılıyor...' })
        
        const result = await runPlacementAlgorithmAsync()
        
        if (result.success) {
          setMessage({ type: 'success', text: `Tercihleriniz kaydedildi ve sonuçlar güncellendi! (${result.assigned} kişi yerleştirildi)` })
        } else {
          setMessage({ type: 'error', text: 'Tercihleriniz kaydedildi ancak simülasyon çalıştırılamadı: ' + (result.error || 'Bilinmeyen hata') })
        }
      } else {
        setMessage({ type: 'success', text: 'Tercihleriniz başarıyla kaydedildi!' })
      }
      
      await fetchData()
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Tercihler kaydedilirken bir hata oluştu.' })
    }

    setSaving(false)
  }

  const availableCities = cities.filter(
    city => !selectedPreferences.some(p => p.cityId === city.id)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const periodClosed = !settings?.preference_period_open

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Şehir Tercihleriniz</h1>
          <p className="text-[var(--color-text-secondary)]">
            Tercih etmek istediğiniz şehirleri seçin ve sıralayın. En fazla 10 şehir seçebilirsiniz.
          </p>
        </div>

        {periodClosed && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-amber-400 font-medium">Tercih dönemi kapalı</p>
                <p className="text-amber-400/70 text-sm mt-1">Tercihlerinizi görüntüleyebilirsiniz ancak değişiklik yapamazsınız.</p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Cities */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-white">Mevcut Şehirler</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{availableCities.length} şehir mevcut</p>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {availableCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => !periodClosed && addPreference(city)}
                  disabled={periodClosed}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    periodClosed
                      ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed'
                      : 'bg-[var(--color-bg-tertiary)] text-white hover:bg-[var(--color-accent)] hover:scale-105 border border-transparent hover:border-[var(--color-accent)]'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Preferences */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-white">Tercihleriniz</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{selectedPreferences.length}/10 tercih yapıldı</p>
            </div>
            
            <div className="p-6 min-h-[300px]">
              {selectedPreferences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-[var(--color-text-secondary)]">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-center">Henüz tercih yapmadınız</p>
                  <p className="text-sm text-center mt-1">Soldaki listeden şehir seçin</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedPreferences.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedPreferences.map((pref, index) => (
                        <SortablePreference
                          key={pref.id}
                          id={pref.id}
                          cityName={pref.cityName}
                          priority={index + 1}
                          onRemove={() => !periodClosed && removePreference(pref.id)}
                          disabled={periodClosed}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Lottery Option */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
              <label className={`flex items-start gap-3 ${periodClosed ? 'opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={wantsLottery}
                  onChange={(e) => !periodClosed && setWantsLottery(e.target.checked)}
                  disabled={periodClosed}
                  className="mt-1 w-5 h-5 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
                />
                <div>
                  <p className="text-white font-medium">Genel Kuraya Kal</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Tercihlerimden hiçbiri gelmezse, kalan boş şehirler arasında kuraya katılmak istiyorum.
                  </p>
                </div>
              </label>
            </div>

            {/* Save Button */}
            {!periodClosed && (
              <div className="px-6 py-4 border-t border-[var(--color-border)]">
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="btn-primary w-full"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Kaydediliyor...
                    </span>
                  ) : (
                    'Tercihleri Kaydet'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
