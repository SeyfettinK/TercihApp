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
    // Count preferences per city
    const cityCounts: Record<number, number> = {}
    preferences.forEach(pref => {
        cityCounts[pref.city_id] = (cityCounts[pref.city_id] || 0) + 1
    })

    // Sort by count (descending) and take top 10
    const sortedCities = Object.entries(cityCounts)
        .map(([cityId, count]) => ({
            city: cities.find(c => c.id === Number(cityId)),
            count
        }))
        .filter(item => item.city)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

    const maxCount = sortedCities.length > 0 ? sortedCities[0].count : 1

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

    if (sortedCities.length === 0) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">Henüz tercih verisi yok.</p>
            </div>
        )
    }

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {sortedCities.map(({ city, count }, index) => (
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
        </div>
    )
}
