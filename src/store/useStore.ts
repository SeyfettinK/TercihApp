import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile, City, Preference, Assignment, Settings } from '../types/database'

interface AppState {
  user: User | null
  profile: Profile | null
  profiles: Profile[]
  cities: City[]
  preferences: Preference[]
  assignments: Assignment[]
  settings: Settings | null
  loading: boolean
  
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setProfiles: (profiles: Profile[]) => void
  setCities: (cities: City[]) => void
  setPreferences: (preferences: Preference[]) => void
  setAssignments: (assignments: Assignment[]) => void
  setSettings: (settings: Settings | null) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  profiles: [],
  cities: [],
  preferences: [],
  assignments: [],
  settings: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setProfiles: (profiles) => set({ profiles }),
  setCities: (cities) => set({ cities }),
  setPreferences: (preferences) => set({ preferences }),
  setAssignments: (assignments) => set({ assignments }),
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ loading }),
}))

