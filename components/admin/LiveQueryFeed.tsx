'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

// Using custom Supabase client instead of '@/lib/supabase' from example
const supabase = createClient()

interface QueryItem {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    assigned_agent?: string
    question: string
    response?: string
    user_repid?: string
    created_at: string
}

export function LiveQueryFeed() {
    const [queries, setQueries] = useState<QueryItem[]>([])

    useEffect(() => {
        // Initial fetch
        fetchQueries()

        // Real-time subscription
        const subscription = supabase
            .channel('live-queries-feed')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'live_queries'
            }, () => fetchQueries())
            .subscribe()

        return () => { subscription.unsubscribe() }
    }, [])

    async function fetchQueries() {
        const { data } = await supabase
            .from('live_queries')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        setQueries(data as QueryItem[] || [])
    }

    function formatTimeAgo(timestamp: string): string {
        const diff = Date.now() - new Date(timestamp).getTime()
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        return `${Math.floor(diff / 3600000)}h ago`
    }

    return (
        <div className="bg-[#111] border border-[#27272a] rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Live Query Feed</h2>
            <div className="space-y-2 max-h-96 overflow-auto">
                {queries.map(query => (
                    <div
                        key={query.id}
                        className={`p-3 rounded-lg border ${query.status === 'pending' ? 'bg-yellow-900/20 border-yellow-700' :
                                query.status === 'processing' ? 'bg-blue-900/20 border-blue-700' :
                                    query.status === 'completed' ? 'bg-green-900/20 border-green-700' :
                                        'bg-red-900/20 border-red-700'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${query.status === 'pending' ? 'bg-yellow-600' :
                                    query.status === 'processing' ? 'bg-blue-600' :
                                        query.status === 'completed' ? 'bg-green-600' :
                                            'bg-red-600'
                                }`}>
                                {query.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                                {query.assigned_agent || 'Unassigned'}
                            </span>
                        </div>
                        <p className="text-white text-sm truncate">{query.question}</p>
                        {query.response && (
                            <p className="text-gray-400 text-xs mt-2 truncate">{query.response}</p>
                        )}
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>RepID: {query.user_repid}</span>
                            <span>{formatTimeAgo(query.created_at)}</span>
                        </div>
                    </div>
                ))}
                {queries.length === 0 && <p className="text-gray-500 text-sm text-center">No queries in feed</p>}
            </div>
        </div>
    )
}
