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
  const lotteryPool: Profile[] = []
  
  // Sort profiles by final_score descending
  const sortedProfiles = [...profiles].sort((a, b) => b.final_score - a.final_score)
  
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
  
  // Process each profile in order
  for (const profile of sortedProfiles) {
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
    
    // If not assigned and wants lottery, add to pool
    if (!assigned) {
      if (profile.wants_lottery) {
        lotteryPool.push(profile)
      } else {
        results.push({
          userId: profile.id,
          cityId: null,
          type: 'unassigned'
        })
      }
    }
  }
  
  // Shuffle lottery pool using Fisher-Yates
  for (let i = lotteryPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[lotteryPool[i], lotteryPool[j]] = [lotteryPool[j], lotteryPool[i]]
  }
  
  // Assign remaining cities to lottery pool
  const remainingCities = Array.from(availableCities)
  for (let i = 0; i < lotteryPool.length && i < remainingCities.length; i++) {
    results.push({
      userId: lotteryPool[i].id,
      cityId: remainingCities[i],
      type: 'lottery'
    })
  }
  
  // Mark remaining lottery pool as unassigned
  for (let i = remainingCities.length; i < lotteryPool.length; i++) {
    results.push({
      userId: lotteryPool[i].id,
      cityId: null,
      type: 'unassigned'
    })
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

    // 3. Clear existing assignments
    await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 4. Insert new assignments
    const assignmentsToInsert = results
      .filter(r => r.cityId !== null)
      .map(r => ({
        user_id: r.userId,
        city_id: r.cityId,
        assignment_type: r.type,
      }))

    if (assignmentsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('assignments')
        .insert(assignmentsToInsert)

      if (insertError) throw new Error('Atamalar kaydedilemedi: ' + insertError.message)
    }

    // 5. Publish results
    await supabase
      .from('settings')
      .update({ results_published: true })
      .eq('id', 1)

    return {
      success: true,
      assigned: assignmentsToInsert.length
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

