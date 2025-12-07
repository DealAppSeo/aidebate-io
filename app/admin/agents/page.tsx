'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bot, Activity, Zap, Clock, RefreshCw } from 'lucide-react'

const supabase = createClient()

export default function AgentsPage() {
    const [agents, setAgents] = useState<any[]>([])

    useEffect(() => {
        fetchAgents()
        const interval = setInterval(fetchAgents, 5000)
        return () => clearInterval(interval)
    }, [])

    async function fetchAgents() {
        const { data } = await supabase
            .from('ats_agents')
            .select('*')
            .order('id')

        setAgents(data || [])
    }

    async function restartAgent(agentId: string) {
        // Call Railway API to restart service
        const response = await fetch('/api/admin/restart-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId })
        })

        if (response.ok) {
            fetchAgents()
            alert('Restart triggered successfully')
        } else {
            alert('Failed to trigger restart')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">ATS Agents</h1>
                <button
                    onClick={fetchAgents}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        onRestart={() => restartAgent(agent.id)}
                    />
                ))}
                {agents.length === 0 && <p className="text-gray-500">No agents found.</p>}
            </div>
        </div>
    )
}

function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
}

function AgentCard({ agent, onRestart }: any) {
    const isOnline = agent.last_heartbeat &&
        (Date.now() - new Date(agent.last_heartbeat).getTime()) < 30000

    return (
        <div className={`bg-[#111] border rounded-xl p-4 ${isOnline ? 'border-green-700' : 'border-red-700'
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOnline ? 'bg-green-900' : 'bg-red-900'
                        }`}>
                        <Bot className={`w-6 h-6 ${isOnline ? 'text-green-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">{agent.id}</h3>
                        <p className="text-sm text-gray-400">{agent.display_name}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${isOnline ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>

            <p className="text-sm text-gray-400 mb-4">{agent.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
                {agent.specialties?.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-[#27272a] rounded text-xs text-gray-300">
                        {s}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-[#0a0a0a] rounded p-2">
                    <div className="text-lg font-bold text-white">{agent.queries_handled || 0}</div>
                    <div className="text-xs text-gray-500">Queries</div>
                </div>
                <div className="bg-[#0a0a0a] rounded p-2">
                    <div className="text-lg font-bold text-white">
                        {agent.avg_response_time_ms ? `${(agent.avg_response_time_ms / 1000).toFixed(1)}s` : '-'}
                    </div>
                    <div className="text-xs text-gray-500">Avg Time</div>
                </div>
                <div className="bg-[#0a0a0a] rounded p-2">
                    <div className="text-lg font-bold text-white">
                        {agent.last_heartbeat ? formatTimeAgo(agent.last_heartbeat) : 'Never'}
                    </div>
                    <div className="text-xs text-gray-500">Last Ping</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onRestart}
                    disabled={isOnline}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 rounded-lg text-white text-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Restart
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#27272a] hover:bg-[#3a3a3a] rounded-lg text-white text-sm"
                >
                    <Activity className="w-4 h-4" />
                    Logs
                </button>
            </div>
        </div>
    )
}
