'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Bot, MessageSquare, Clock, DollarSign,
    TrendingUp, AlertTriangle, CheckCircle, XCircle,
    Activity, Users, TrendingDown
} from 'lucide-react'
import { LiveQueryFeed } from '@/components/admin/LiveQueryFeed'

const supabase = createClient()

interface DashboardMetrics {
    agents_online: number
    agents_total: number
    pending_queries: number
    processing_queries: number
    avg_wait_time_ms: number
    queries_last_hour: number
    ai_cost_last_hour: number
    error_rate: number
    active_debates: number
    total_votes_today: number
}

// Helpers
function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
}

function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [recentEvents, setRecentEvents] = useState<any[]>([])
    const [providers, setProviders] = useState<any[]>([])

    // Real-time subscription
    useEffect(() => {
        // Initial fetch
        fetchDashboardData()

        // Subscribe to metrics changes
        const subscription = supabase
            .channel('admin-dashboard')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'system_metrics'
            }, () => fetchDashboardData())
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'scaling_events'
            }, () => fetchRecentEvents())
            .subscribe()

        // Poll every 10 seconds
        const interval = setInterval(fetchDashboardData, 10000)

        return () => {
            subscription.unsubscribe()
            clearInterval(interval)
        }
    }, [])

    async function fetchDashboardData() {
        // Latest metrics
        const { data: latestMetrics } = await supabase
            .from('system_metrics')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

        // Online agents count
        const thirtySecsAgo = new Date(Date.now() - 30000).toISOString()
        const { count: agentsOnline } = await supabase
            .from('ats_agents')
            .select('*', { count: 'exact', head: true })
            .gte('last_heartbeat', thirtySecsAgo)

        const { count: agentsTotal } = await supabase
            .from('ats_agents')
            .select('*', { count: 'exact', head: true })

        // Today's votes
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const { count: votesToday } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString())

        // Active debates
        const { count: activeDebates } = await supabase
            .from('debates')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')

        // Handle case where system_metrics might be empty early on
        setMetrics({
            agents_online: agentsOnline || 0,
            agents_total: agentsTotal || 0,
            pending_queries: latestMetrics?.pending_queries || 0,
            processing_queries: latestMetrics?.processing_queries || 0,
            avg_wait_time_ms: latestMetrics?.avg_wait_time_ms || 0,
            queries_last_hour: latestMetrics?.queries_last_hour || 0,
            ai_cost_last_hour: latestMetrics?.ai_cost_last_hour || 0,
            error_rate: latestMetrics?.error_rate_percent || 0,
            active_debates: activeDebates || 0,
            total_votes_today: votesToday || 0
        })

        fetchRecentEvents()
        fetchProviders()
    }

    async function fetchRecentEvents() {
        const { data } = await supabase
            .from('scaling_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5)

        setRecentEvents(data || [])
    }

    async function fetchProviders() {
        const { data } = await supabase
            .from('ai_provider_config')
            .select('*')
            .order('weight', { ascending: false })

        setProviders(data || [])
    }

    if (!metrics) {
        return <div className="text-white p-8">Loading dashboard metrics...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">System Overview</h1>
                <div className="text-sm text-gray-500">
                    Auto-refreshing every 10s
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    icon={Bot}
                    label="Agents Online"
                    value={`${metrics.agents_online}/${metrics.agents_total}`}
                    status={metrics.agents_online > 0 ? 'good' : 'critical'}
                />
                <MetricCard
                    icon={MessageSquare}
                    label="Query Queue"
                    value={metrics.pending_queries.toString()}
                    subtext={`${metrics.processing_queries} processing`}
                    status={metrics.pending_queries > 10 ? 'warning' : 'good'}
                />
                <MetricCard
                    icon={Clock}
                    label="Avg Wait Time"
                    value={formatDuration(metrics.avg_wait_time_ms)}
                    status={metrics.avg_wait_time_ms > 30000 ? 'critical' : metrics.avg_wait_time_ms > 10000 ? 'warning' : 'good'}
                />
                <MetricCard
                    icon={DollarSign}
                    label="Cost (Last Hour)"
                    value={`$${metrics.ai_cost_last_hour.toFixed(2)}`}
                    status={metrics.ai_cost_last_hour > 8 ? 'warning' : 'good'}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    icon={TrendingUp}
                    label="Queries/Hour"
                    value={metrics.queries_last_hour.toString()}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label="Error Rate"
                    value={`${metrics.error_rate.toFixed(1)}%`}
                    status={metrics.error_rate > 5 ? 'critical' : metrics.error_rate > 1 ? 'warning' : 'good'}
                />
                <MetricCard
                    icon={Activity}
                    label="Active Debates"
                    value={metrics.active_debates.toString()}
                />
                <MetricCard
                    icon={Users}
                    label="Votes Today"
                    value={metrics.total_votes_today.toString()}
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Provider Status */}
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-4">AI Provider Status</h2>
                    <div className="space-y-3">
                        {providers.length > 0 ? providers.map(provider => (
                            <ProviderRow key={provider.id} provider={provider} />
                        )) : <p className="text-gray-500 text-sm">No provider configs found</p>}
                    </div>
                </div>

                {/* Recent Scaling Events */}
                <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Scaling Events</h2>
                    <div className="space-y-2">
                        {recentEvents.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent events</p>
                        ) : (
                            recentEvents.map(event => (
                                <EventRow key={event.id} event={event} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Live Query Feed */}
            <LiveQueryFeed />
        </div>
    )
}

// Metric Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricCard({ icon: Icon, label, value, subtext, status = 'neutral' }: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusColors: any = {
        good: 'text-green-400',
        warning: 'text-yellow-400',
        critical: 'text-red-400',
        neutral: 'text-blue-400'
    }

    return (
        <div className="bg-[#111] border border-[#27272a] rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${statusColors[status]}`} />
                <span className="text-sm text-gray-400">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${statusColors[status]}`}>
                {value}
            </div>
            {subtext && (
                <div className="text-xs text-gray-500 mt-1">{subtext}</div>
            )}
        </div>
    )
}

// Provider Row Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProviderRow({ provider }: any) {
    const isHealthy = !provider.circuit_open && provider.enabled

    return (
        <div className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg">
            <div className="flex items-center gap-3">
                {isHealthy ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-white font-medium">{provider.display_name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                    {provider.current_rpm}/{provider.max_rpm} rpm
                </span>
                <span className="text-gray-400">
                    Weight: {provider.weight}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${isHealthy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                    {isHealthy ? 'Online' : 'Circuit Open'}
                </span>
            </div>
        </div>
    )
}

// Event Row Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EventRow({ event }: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons: any = {
        scale_up: <TrendingUp className="w-4 h-4 text-green-400" />,
        scale_down: <TrendingDown className="w-4 h-4 text-blue-400" />,
        failover: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
        rate_limit: <XCircle className="w-4 h-4 text-red-400" />
    }

    return (
        <div className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg text-sm">
            <div className="flex items-center gap-2">
                {icons[event.event_type] || <Activity className="w-4 h-4 text-gray-400" />}
                <span className="text-white">{event.event_type}</span>
                <span className="text-gray-500">- {event.trigger_reason}</span>
            </div>
            <div className="flex items-center gap-2">
                {event.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-gray-500">
                    {formatTimeAgo(event.timestamp)}
                </span>
            </div>
        </div>
    )
}
