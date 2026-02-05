import type { Preference } from '../../types/database'

interface AssignmentWithPreferences {
    city_id: number
    preferences?: Preference[]
}

interface PlacementRankStatsProps {
    assignments: AssignmentWithPreferences[]
    title: string
    accentColor?: 'emerald' | 'amber' | 'teal'
}

export default function PlacementRankStats({
    assignments,
    title,
    accentColor = 'emerald'
}: PlacementRankStatsProps) {
    // Calculate which preference rank each person got placed at
    const rankCounts: Record<number, number> = {}
    let lotteryCount = 0

    assignments.forEach(assignment => {
        const prefs = assignment.preferences || []
        const placedPref = prefs.find(p => p.city_id === assignment.city_id)

        if (placedPref) {
            rankCounts[placedPref.priority] = (rankCounts[placedPref.priority] || 0) + 1
        } else {
            // Placed by lottery (not in their preference list)
            lotteryCount++
        }
    })

    // Create sorted array of ranks
    const sortedRanks = Object.entries(rankCounts)
        .map(([rank, count]) => ({ rank: Number(rank), count }))
        .sort((a, b) => a.rank - b.rank)

    const maxCount = Math.max(
        ...sortedRanks.map(r => r.count),
        lotteryCount,
        1
    )

    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-500/20',
            fill: 'bg-emerald-500',
            text: 'text-emerald-400',
            border: 'border-emerald-500/30'
        },
        amber: {
            bg: 'bg-amber-500/20',
            fill: 'bg-amber-500',
            text: 'text-amber-400',
            border: 'border-amber-500/30'
        },
        teal: {
            bg: 'bg-[var(--color-accent)]/20',
            fill: 'bg-[var(--color-accent)]',
            text: 'text-[var(--color-accent)]',
            border: 'border-[var(--color-accent)]/30'
        }
    }

    const colors = colorClasses[accentColor]

    if (assignments.length === 0) {
        return (
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <p className="text-[var(--color-text-tertiary)] text-sm">Henüz yerleştirme verisi yok.</p>
            </div>
        )
    }

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>

            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-40 mb-4">
                {sortedRanks.map(({ rank, count }) => (
                    <div key={rank} className="flex-1 flex flex-col items-center group">
                        <span className={`text-xs font-semibold ${colors.text} mb-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {count}
                        </span>
                        <div
                            className={`w-full rounded-t-lg ${colors.fill} transition-all duration-300 hover:opacity-80`}
                            style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                        />
                        <span className="text-xs text-[var(--color-text-secondary)] mt-2">{rank}.</span>
                    </div>
                ))}
                {lotteryCount > 0 && (
                    <div className="flex-1 flex flex-col items-center group">
                        <span className="text-xs font-semibold text-amber-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lotteryCount}
                        </span>
                        <div
                            className="w-full rounded-t-lg bg-amber-500 transition-all duration-300 hover:opacity-80"
                            style={{ height: `${(lotteryCount / maxCount) * 100}%`, minHeight: '8px' }}
                        />
                        <span className="text-xs text-[var(--color-text-secondary)] mt-2">Kura</span>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--color-border)]">
                {sortedRanks.slice(0, 5).map(({ rank, count }) => (
                    <div key={rank} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${colors.fill}`} />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            {rank}. tercih: <span className={`font-semibold ${colors.text}`}>{count}</span>
                        </span>
                    </div>
                ))}
                {lotteryCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            Kura: <span className="font-semibold text-amber-400">{lotteryCount}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
