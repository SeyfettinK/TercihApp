import { useState } from 'react'
import type { City, Preference } from '../../types/database'
import CityPreferenceStats from './CityPreferenceStats'
import PlacementRankStats from './PlacementRankStats'

interface AssignmentWithPreferences {
    city_id: number
    user_id: string
    preferences?: Preference[]
}

interface ProfileWithPreferences {
    profile: { id: string }
    preferences: Preference[]
}

interface ResultsStatisticsProps {
    assignments: AssignmentWithPreferences[]
    unassignedProfiles: ProfileWithPreferences[]
    cities: City[]
    allPreferences: Preference[]
}

export default function ResultsStatistics({
    assignments,
    unassignedProfiles,
    cities,
    allPreferences
}: ResultsStatisticsProps) {
    const [activeTab, setActiveTab] = useState<'asil' | 'yedek'>('asil')

    // Get preferences for assigned users
    const assignedUserIds = new Set(assignments.map(a => a.user_id))
    const assignedPreferences = allPreferences.filter(p => assignedUserIds.has(p.user_id))

    // Get preferences for unassigned users
    const unassignedUserIds = new Set(unassignedProfiles.map(p => p.profile.id))
    const unassignedPreferences = allPreferences.filter(p => unassignedUserIds.has(p.user_id))

    return (
        <div className="card overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-white">📊 İstatistikler</h2>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    Tercih ve yerleştirme istatistikleri
                </p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-2">
                <button
                    onClick={() => setActiveTab('asil')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'asil'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/80'
                        }`}
                >
                    ✅ Asil ({assignments.length})
                </button>
                <button
                    onClick={() => setActiveTab('yedek')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'yedek'
                            ? 'bg-amber-500 text-white'
                            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]/80'
                        }`}
                >
                    ⏳ Yedek ({unassignedProfiles.length})
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'asil' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PlacementRankStats
                            assignments={assignments}
                            title="Yerleştirme Sırası Dağılımı"
                            accentColor="emerald"
                        />
                        <CityPreferenceStats
                            preferences={assignedPreferences}
                            cities={cities}
                            title="En Çok Tercih Edilen İller (Asil)"
                            accentColor="emerald"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6 bg-[var(--color-bg-tertiary)]">
                            <h3 className="text-lg font-semibold text-white mb-4">Yedek Aday Bilgisi</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Toplam Yedek</span>
                                    <span className="text-xl font-bold text-amber-400">{unassignedProfiles.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Tercih Yapan</span>
                                    <span className="text-xl font-bold text-amber-400">
                                        {unassignedProfiles.filter(p => p.preferences.length > 0).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--color-text-secondary)]">Tercih Yapmayan</span>
                                    <span className="text-xl font-bold text-red-400">
                                        {unassignedProfiles.filter(p => p.preferences.length === 0).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <CityPreferenceStats
                            preferences={unassignedPreferences}
                            cities={cities}
                            title="En Çok Tercih Edilen İller (Yedek)"
                            accentColor="amber"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
