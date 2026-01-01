export interface Profile {
  id: string
  email: string
  full_name: string
  written_score: number
  interview_score: number
  final_score: number
  wants_lottery: boolean
  is_admin: boolean
  created_at: string
}

export interface City {
  id: number
  name: string
  is_available: boolean
}

export interface Preference {
  id: string
  user_id: string
  city_id: number
  priority: number
  updated_at: string
}

export interface Assignment {
  id: string
  user_id: string
  city_id: number
  assignment_type: 'preference' | 'lottery' | 'unassigned'
  assigned_at: string
}

export interface Settings {
  id: number
  preference_period_open: boolean
  results_published: boolean
  auto_simulation: boolean
  access_code?: string // Optional, sadece backend'de
}
