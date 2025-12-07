'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

const supabase = createClient()

export default function CostsPage() {
    const [hourlyData, setHourlyData] = useState<any[]>([])
    const [providerBreakdown, setProviderBreakdown] = useState<any[]>([])
    const [totals, setTotals] = useState({ today: 0, week: 0, month: 0 })

    useEffect(() => {
        fetchCostData()
    }, [])

    async function fetchCostData() {
        // Last 24 hours hourly costs
        // NOTE: If table system_metrics doesn't have ai_cost_last_hour populated, this might be empty
        const { data: metrics } = await supabase
            .from('system_metrics')
            .select('timestamp, ai_cost_last_hour')
            .gte('timestamp', new Date(Date.now() - 86400000).toISOString())
            .order('timestamp', { ascending: true })

        // Aggregate by hour
        const hourly: Record<string, number> = {}
        metrics?.forEach((m: any) => {
            const hour = new Date(m.timestamp).toISOString().slice(0, 13)
            if (!hourly[hour]) hourly[hour] = 0
            hourly[hour] = Math.max(hourly[hour], m.ai_cost_last_hour || 0)
        })

        setHourlyData(Object.entries(hourly).map(([hour, cost]) => ({
            hour: hour.slice(11, 13) + ':00',
            cost
        })))

        // Provider breakdown (mock - would come from detailed logging)
        setProviderBreakdown([
            { name: 'Anthropic', cost: 4.50, color: '#8B5CF6' },
            { name: 'OpenAI', cost: 2.30, color: '#22C55E' },
            { name: 'Groq', cost: 0.15, color: '#F59E0B' },
            { name: 'DeepSeek', cost: 0.45, color: '#3B82F6' }
        ])

        // Calculate totals
        const todayCost = Object.values(hourly).reduce((a: number, b: number) => a + b, 0)
        setTotals({
            today: todayCost,
            week: todayCost * 5.2,  // Estimate
            month: todayCost * 22   // Estimate
        })
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Cost Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Today</div>
                    <div className="text-2xl font-bold text-white">${totals.today.toFixed(2)}</div>
                </div>
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">This Week (Est)</div>
                    <div className="text-2xl font-bold text-white">${totals.week.toFixed(2)}</div>
                </div>
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">This Month (Est)</div>
                    <div className="text-2xl font-bold text-white">${totals.month.toFixed(2)}</div>
                </div>
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Budget Status</div>
                    <div className="text-2xl font-bold text-green-400">On Track</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                {/* Hourly Cost Line Chart */}
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Hourly Costs (24h)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={hourlyData}>
                            <XAxis dataKey="hour" stroke="#666" />
                            <YAxis stroke="#666" tickFormatter={(v: number) => `$${v}`} />
                            <Tooltip
                                contentStyle={{ background: '#111', border: '1px solid #333' }}
                                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']}
                            />
                            <Line
                                type="monotone"
                                dataKey="cost"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Provider Breakdown Pie Chart */}
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Cost by Provider</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={providerBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                dataKey="cost"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {providerBreakdown.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Budget Controls */}
            <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                <h2 className="text-lg font-semibold text-white mb-4">Budget Controls</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Hourly Limit</label>
                        <input
                            type="number"
                            defaultValue={10}
                            className="w-full mt-1 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Daily Limit</label>
                        <input
                            type="number"
                            defaultValue={100}
                            className="w-full mt-1 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Monthly Limit</label>
                        <input
                            type="number"
                            defaultValue={2000}
                            className="w-full mt-1 bg-[#0a0a0a] border border-[#27272a] rounded-lg p-2 text-white"
                        />
                    </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                    Save Budget Settings
                </button>
            </div>
        </div>
    )
}
