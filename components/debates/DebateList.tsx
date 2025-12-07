'use client'

import DebateCard from './DebateCard'

interface Debate {
    id: string
    topic: string
    category: string
    ai_a_name: string
    ai_a_id: string
    ai_b_name: string
    ai_b_id: string
    ai_a_votes: number
    ai_b_votes: number
    is_featured: boolean
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
