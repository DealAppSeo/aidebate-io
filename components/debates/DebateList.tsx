'use client'

import DebateCard from './DebateCard'

interface Debate {
    id: string
    title: string
    topic: string
    category: string
    ai1_name: string
    ai1_model: string
    ai2_name: string
    ai2_model: string
    vote_count_ai1: number
    vote_count_ai2: number
    vote_count_tie: number
    total_duration_seconds: number
    featured: boolean
}

interface DebateListProps {
    debates: Debate[]
}

export default function DebateList({ debates }: DebateListProps) {
    if (debates.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No debates available yet.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
            ))}
        </div>
    )
}
