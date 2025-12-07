'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

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

interface DebateCardProps {
    debate: Debate
}

const AI_COLORS: Record<string, string> = {
    claude: 'bg-purple-600',
    gpt: 'bg-amber-500',
    grok: 'bg-red-500',
    gemini: 'bg-green-500',
    llama: 'bg-blue-500',
    deepseek: 'bg-cyan-500',
}

export default function DebateCard({ debate }: DebateCardProps) {
    const totalVotes = debate.ai_a_votes + debate.ai_b_votes
    const aiAPercent = totalVotes > 0 ? Math.round((debate.ai_a_votes / totalVotes) * 100) : 0
    const aiBPercent = totalVotes > 0 ? Math.round((debate.ai_b_votes / totalVotes) * 100) : 0

    const getAIColor = (model: string) => {
        const key = model.toLowerCase().split('-')[0]
        return AI_COLORS[key] || 'bg-gray-600'
    }

    return (
        <Link href={`/debate/${debate.id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-[#171717] border border-[#27272a] rounded-xl p-6 cursor-pointer transition-all hover:border-blue-500/50"
            >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                        {debate.category}
                    </span>
                    {debate.is_featured && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Featured
                        </span>
                    )}
                </div>

                {/* Topic */}
                <h3 className="text-lg font-bold mb-4 line-clamp-2">
                    {debate.topic}
                </h3>

                {/* AI Avatars */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full ${getAIColor(debate.ai_a_id)} flex items-center justify-center text-white font-bold text-sm`}>
                            {debate.ai_a_name[0]}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{debate.ai_a_name}</div>
                            <div className="text-xs text-gray-400">{aiAPercent}%</div>
                        </div>
                    </div>

                    <div className="text-gray-500 text-sm">VS</div>

                    <div className="flex items-center gap-2">
                        <div>
                            <div className="text-sm font-medium text-right">{debate.ai_b_name}</div>
                            <div className="text-xs text-gray-400 text-right">{aiBPercent}%</div>
                        </div>
                        <div className={`w-10 h-10 rounded-full ${getAIColor(debate.ai_b_id)} flex items-center justify-center text-white font-bold text-sm`}>
                            {debate.ai_b_name[0]}
                        </div>
                    </div>
                </div>

                {/* Vote Bar */}
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden mb-3">
                    <div className="h-full flex">
                        <div
                            className={`${getAIColor(debate.ai_a_id)} transition-all`}
                            style={{ width: `${aiAPercent}%` }}
                        />
                        <div
                            className={`${getAIColor(debate.ai_b_id)} transition-all`}
                            style={{ width: `${aiBPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{totalVotes} votes</span>
                </div>
            </motion.div>
        </Link>
    )
}
