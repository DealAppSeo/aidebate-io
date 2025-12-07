'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'

const supabase = createClient()

export default function EngagementPage() {
    const [ariaVariantStats, setAriaVariantStats] = useState<any[]>([])
    const [completionRates, setCompletionRates] = useState<any[]>([])
    const [dropOffPoints, setDropOffPoints] = useState<any[]>([])

    useEffect(() => {
        fetchEngagementData()
    }, [])

    async function fetchEngagementData() {
        // Aria variant performance
        const { data: engagement } = await supabase
            .from('debate_engagement')
            .select('intro_variant, vote_cast, dropped_off_at_round')

        // Calculate variant completion rates
        const variants = ['A', 'B', 'C']
        const stats = variants.map(v => {
            const variantData = engagement?.filter((e: any) => e.intro_variant?.includes(v)) || []
            const completed = variantData.filter((e: any) => e.vote_cast).length
            return {
                variant: v === 'A' ? 'Energetic' : v === 'B' ? 'Warm' : 'Prestige',
                total: variantData.length,
                completed,
                rate: variantData.length > 0 ? (completed / variantData.length * 100).toFixed(1) : 0
            }
        })
        setAriaVariantStats(stats)

        // Drop-off analysis
        const dropOffs = Array(8).fill(0)
        engagement?.forEach((e: any) => {
            if (e.dropped_off_at_round !== null && typeof e.dropped_off_at_round === 'number') {
                dropOffs[e.dropped_off_at_round]++
            }
        })
        setDropOffPoints(dropOffs.map((count, idx) => ({
            round: idx === 0 ? 'Intro' : idx === 7 ? 'Pre-vote' : `Round ${idx}`,
            dropoffs: count
        })))
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Engagement Analytics</h1>

            {/* Aria Variant A/B Test Results */}
            <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Aria Variant Performance</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {ariaVariantStats.map(stat => (
                        <div
                            key={stat.variant}
                            className="bg-[#0a0a0a] rounded-lg p-4 text-center"
                        >
                            <div className="text-xl font-bold text-white mb-1">{stat.rate}%</div>
                            <div className="text-sm text-gray-400">{stat.variant}</div>
                            <div className="text-xs text-gray-500">
                                {stat.completed}/{stat.total} completed
                            </div>
                        </div>
                    ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ariaVariantStats}>
                        <XAxis dataKey="variant" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                        <Bar dataKey="rate" fill="#3B82F6" name="Completion %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Drop-off Analysis */}
            <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Drop-off Points</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dropOffPoints}>
                        <XAxis dataKey="round" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                        <Bar dataKey="dropoffs" fill="#EF4444" name="Users Dropped" />
                    </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-400 mt-2">
                    Identify where users abandon debates to optimize content and pacing.
                </p>
            </div>

            {/* Winning Variant Recommendation */}
            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-blue-300 mb-2">🎯 Recommendation</h2>
                <p className="text-white">
                    Based on completion rates, <strong>Warm (B)</strong> variant is performing best.
                    Consider increasing its weight from 40% to 60% for new users.
                </p>
                <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                    Apply Recommendation
                </button>
            </div>
        </div>
    )
}
