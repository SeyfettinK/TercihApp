import { useState } from 'react'
import type { City, Preference } from '../../types/database'

interface CityPreferenceStatsProps {
    preferences: Preference[]
    cities: City[]
    title: string
    accentColor?: 'emerald' | 'amber' | 'teal'
}

export default function CityPreferenceStats({
    preferences,
    cities,
    title,
    accentColor = 'teal'
}: CityPreferenceStatsProps) {
    const [showAll, setShowAll] = useState(false)

    // Count preferences per city
    const cityCounts: Record<number, number> = {}
    preferences.forEach(pref => {
        cityCounts[pref.city_id] = (cityCounts[pref.city_id] || 0) + 1
    })

    // Calculate all sorted cities
    const allSortedCities = Object.entries(cityCounts)
        .map(([cityId, count]) => ({
            city: cities.find(c => c.id === Number(cityId)),
            count
        }))
        .filter(item => item.city)
        .sort((a, b) => b.count - a.count)

    // Take displayed cities based on toggle
    const displayedCities = showAll ? allSortedCities : allSortedCities.slice(0, 10)

    // maxCount should be from allSortedCities to maintain bar scale when toggling
    const maxCount = allSortedCities.length > 0 ? allSortedCities[0].count : 1

    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-500/20',
            fill: 'bg-emerald-500',
            text: 'text-emerald-400'
        },
        amber: {
            bg: 'bg-amber-500/20',
            fill: 'bg-amber-500',
            text: 'text-amber-400'
        },
        teal: {
            bg: 'bg-[var(--color-accent)]/20',
            fill: 'bg-[var(--color-accent)]',
            text: 'text-[var(--color-accent)]'
        }
    }

    const colors = colorClasses[accentColor]

    if (allSortedCities.length === 0) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">Henüz tercih verisi yok.</p>
            </div>
        )
    }

    return (
        <div className="card p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="space-y-3 flex-1 overflow-auto max-h-[500px] pr-2 custom-scrollbar">
                {displayedCities.map(({ city, count }, index) => (
                    <div key={city!.id} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center text-xs font-semibold ${colors.text}`}>
                                    {index + 1}
                                </span>
                                {city!.name}
                            </span>
                            <span className={`text-sm font-semibold ${colors.text}`}>{count} kişi</span>
                        </div>
                        <div className={`h-2 rounded-full ${colors.bg} overflow-hidden`}>
                            <div
                                className={`h-full rounded-full ${colors.fill} transition-all duration-500 group-hover:opacity-80`}
                                style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {allSortedCities.length > 10 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-all border ${showAll
                            ? 'bg-transparent border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                            : `${colors.bg} ${colors.text} border-transparent hover:brightness-110`
                        }`}
                >
                    {showAll ? 'Daha Az Göster' : `Tüm İlleri Göster (${allSortedCities.length} İl)`}
                </button>
            )}
        </div>
    )
}
