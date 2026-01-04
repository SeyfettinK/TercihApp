import type { Profile, City, Preference } from '../types/database'
import { supabase } from './supabase'

interface AssignmentResult {
  userId: string
  cityId: number | null
  type: 'preference' | 'lottery' | 'unassigned'
  preferenceOrder?: number
}

interface SimulationResult {
  success: boolean
  assigned: number
  error?: string
}

export function runPlacementAlgorithm(
  profiles: Profile[],
  cities: City[],
  preferences: Preference[]
): AssignmentResult[] {
  const results: AssignmentResult[] = []
  const availableCities = new Set(cities.filter(c => c.is_available).map(c => c.id))
  const totalCities = availableCities.size // Toplam müsait şehir sayısı (genellikle 27)
  
  // Sort profiles by final_score descending, then by years_of_service descending (tie-breaker)
  const sortedProfiles = [...profiles].sort((a, b) => {
    // Önce final_score'a göre sırala (büyükten küçüğe)
    if (b.final_score !== a.final_score) {
      return b.final_score - a.final_score
    }
    
    // Eğer final_score aynıysa, years_of_service'e göre sırala (büyükten küçüğe)
    // NULL veya undefined değerler 0 olarak kabul edilir (en düşük öncelik)
    const aYears = a.years_of_service ?? 0
    const bYears = b.years_of_service ?? 0
    return bYears - aYears
  })
  
  // Get preferences grouped by user
  const preferencesByUser = new Map<string, Preference[]>()
  for (const pref of preferences) {
    if (!preferencesByUser.has(pref.user_id)) {
      preferencesByUser.set(pref.user_id, [])
    }
    preferencesByUser.get(pref.user_id)!.push(pref)
  }
  
  // Sort each user's preferences by priority
  for (const [userId, userPrefs] of preferencesByUser) {
    userPrefs.sort((a, b) => a.priority - b.priority)
    preferencesByUser.set(userId, userPrefs)
  }
  
  // ⚠️ KRİTİK: İlk N kişi (N = şehir sayısı, genellikle 27) MUTLAKA yerleşmeli!
  // Bu kişilere öncelik vermeliyiz.
  
  // PHASE 1: İlk N kişi için tercih bazlı yerleştirme
  const topN = sortedProfiles.slice(0, totalCities) // İlk 27 kişi
  const rest = sortedProfiles.slice(totalCities)     // 28+ kişiler
  
  const topNLotteryPool: Profile[] = []
  
  // İlk N kişi için tercih yerleştirmesi
  for (const profile of topN) {
    const userPrefs = preferencesByUser.get(profile.id) || []
    let assigned = false
    
    // Try to assign based on preferences
    for (const pref of userPrefs) {
      if (availableCities.has(pref.city_id)) {
        results.push({
          userId: profile.id,
          cityId: pref.city_id,
          type: 'preference',
          preferenceOrder: pref.priority
        })
        availableCities.delete(pref.city_id)
        assigned = true
        break
      }
    }
    
    // Eğer tercihine yerleşemediyse
    if (!assigned) {
      if (profile.wants_lottery) {
        // Genel kuraya katılmak istiyor → garanti yerleşecek (top N'de)
        topNLotteryPool.push(profile)
      } else {
        // Ne tercih ne de genel kura → yerleşemedi
        results.push({
          userId: profile.id,
          cityId: null,
          type: 'unassigned'
        })
      }
    }
  }
  
  // PHASE 2: İlk N'in lottery havuzunu ÖNCE yerleştir (garanti)
  // ⚠️ KRİTİK: 28+ kişilere geçmeden önce ilk 27'nin lottery havuzunu yerleştirmeliyiz!
  let remainingCities = Array.from(availableCities)
  let cityIndex = 0
  
  for (const profile of topNLotteryPool) {
    if (cityIndex < remainingCities.length) {
      results.push({
        userId: profile.id,
        cityId: remainingCities[cityIndex],
        type: 'lottery'
      })
      availableCities.delete(remainingCities[cityIndex]) // Şehri kullanılabilir listeden çıkar
      cityIndex++
    } else {
      // Bu asla olmamalı (top N her zaman yerleşmeli), ama güvenlik için
      console.error('HATA: İlk 27 kişiden biri yerleşemedi!', profile)
      results.push({
        userId: profile.id,
        cityId: null,
        type: 'unassigned'
      })
    }
  }
  
  // PHASE 3: 28+ kişiler için tercih bazlı yerleştirme (KALAN şehirlere)
  const restLotteryPool: Profile[] = []
  
  for (const profile of rest) {
    const userPrefs = preferencesByUser.get(profile.id) || []
    let assigned = false
    
    // Try to assign based on preferences
    for (const pref of userPrefs) {
      if (availableCities.has(pref.city_id)) {
        results.push({
          userId: profile.id,
          cityId: pref.city_id,
          type: 'preference',
          preferenceOrder: pref.priority
        })
        availableCities.delete(pref.city_id)
        assigned = true
        break
      }
    }
    
    // Eğer tercihine yerleşemediyse
    if (!assigned) {
      if (profile.wants_lottery) {
        // Genel kuraya katılmak istiyor → havuza ekle (yer varsa yerleşir)
        restLotteryPool.push(profile)
      } else {
        // Ne tercih ne de genel kura → yerleşemedi
        results.push({
          userId: profile.id,
          cityId: null,
          type: 'unassigned'
        })
      }
    }
  }
  
  // PHASE 4: rest'in lottery pool'unu yerleştir (yer varsa)
  remainingCities = Array.from(availableCities)
  cityIndex = 0
  
  for (const profile of restLotteryPool) {
    if (cityIndex < remainingCities.length) {
      results.push({
        userId: profile.id,
        cityId: remainingCities[cityIndex],
        type: 'lottery'
      })
      cityIndex++
    } else {
      // Yer kalmadı (28+ için normal)
      results.push({
        userId: profile.id,
        cityId: null,
        type: 'unassigned'
      })
    }
  }
  
  return results
}

export function calculateFinalScore(written: number, interview: number): number {
  return Number(((written + interview) / 2).toFixed(2))
}

/**
 * Async wrapper to run simulation and save results
 */
export async function runPlacementAlgorithmAsync(): Promise<SimulationResult> {
  try {
    // 1. Fetch all required data
    const [profilesRes, citiesRes, preferencesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('final_score', { ascending: false }),
      supabase.from('cities').select('*'),
      supabase.from('preferences').select('*')
    ])

    if (profilesRes.error) throw new Error('Profiller yüklenemedi: ' + profilesRes.error.message)
    if (citiesRes.error) throw new Error('Şehirler yüklenemedi: ' + citiesRes.error.message)
    if (preferencesRes.error) throw new Error('Tercihler yüklenemedi: ' + preferencesRes.error.message)

    const profiles = profilesRes.data as Profile[]
    const cities = citiesRes.data as City[]
    const preferences = preferencesRes.data as Preference[]

    // 2. Run the algorithm
    const results = runPlacementAlgorithm(profiles, cities, preferences)

    // 3. Prepare assignments data
    const assignmentsToInsert = results
      .filter(r => r.cityId !== null)
      .map(r => ({
        user_id: r.userId,
        city_id: r.cityId,
        assignment_type: r.type,
      }))

    // 4. Save via RPC (SECURITY DEFINER ile admin yetkisiyle çalışır)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('save_simulation_results', {
      assignments_data: assignmentsToInsert
    })

    if (rpcError) {
      throw new Error('RPC hatası: ' + rpcError.message)
    }

    if (!rpcResult || !rpcResult.success) {
      throw new Error(rpcResult?.error || 'Simülasyon sonuçları kaydedilemedi')
    }

    return {
      success: true,
      assigned: rpcResult.assigned || assignmentsToInsert.length
    }

  } catch (error) {
    console.error('Simulation error:', error)
    return {
      success: false,
      assigned: 0,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }
  }
}

