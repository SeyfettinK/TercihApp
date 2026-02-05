import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
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
            lotteryCount++
        }
    })

    // Create chart data
    const chartData = Object.entries(rankCounts)
        .map(([rank, count]) => ({
            name: `${rank}. Tercih`,
            count,
            isLottery: false
        }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name))

    // Add lottery if exists
    if (lotteryCount > 0) {
        chartData.push({
            name: 'Kura',
            count: lotteryCount,
            isLottery: true
        })
    }

    const colorMap = {
        emerald: '#10b981',
        amber: '#f59e0b',
        teal: '#14b8a6'
    }

    const mainColor = colorMap[accentColor]
    const lotteryColor = '#f59e0b'

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
            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            axisLine={{ stroke: '#374151' }}
                            tickLine={{ stroke: '#374151' }}
                        />
                        <YAxis
                            tick={{ fill: '#9ca3af', fontSize: 11 }}
                            axisLine={{ stroke: '#374151' }}
                            tickLine={{ stroke: '#374151' }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: any) => [`${value} kişi`, 'Yerleşen']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isLottery ? lotteryColor : mainColor}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 mt-2 border-t border-[var(--color-border)]">
                {chartData.filter(d => !d.isLottery).slice(0, 5).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: mainColor }} />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            {item.name}: <span className="font-semibold" style={{ color: mainColor }}>{item.count}</span>
                        </span>
                    </div>
                ))}
                {lotteryCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: lotteryColor }} />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                            Kura: <span className="font-semibold" style={{ color: lotteryColor }}>{lotteryCount}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
