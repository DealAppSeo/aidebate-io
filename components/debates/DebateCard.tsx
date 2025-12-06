'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

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
    const totalVotes = debate.vote_count_ai1 + debate.vote_count_ai2 + debate.vote_count_tie
    const ai1Percent = totalVotes > 0 ? Math.round((debate.vote_count_ai1 / totalVotes) * 100) : 0
    const ai2Percent = totalVotes > 0 ? Math.round((debate.vote_count_ai2 / totalVotes) * 100) : 0

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
                    {debate.featured && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Featured
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-4 line-clamp-2">
                    {debate.title}
                </h3>

                {/* AI Avatars */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full ${getAIColor(debate.ai1_model)} flex items-center justify-center text-white font-bold text-sm`}>
                            {debate.ai1_name[0]}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{debate.ai1_name}</div>
                            <div className="text-xs text-gray-400">{ai1Percent}%</div>
                        </div>
                    </div>

                    <div className="text-gray-500 text-sm">VS</div>

                    <div className="flex items-center gap-2">
                        <div>
                            <div className="text-sm font-medium text-right">{debate.ai2_name}</div>
                            <div className="text-xs text-gray-400 text-right">{ai2Percent}%</div>
                        </div>
                        <div className={`w-10 h-10 rounded-full ${getAIColor(debate.ai2_model)} flex items-center justify-center text-white font-bold text-sm`}>
                            {debate.ai2_name[0]}
                        </div>
                    </div>
                </div>

                {/* Vote Bar */}
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden mb-3">
                    <div className="h-full flex">
                        <div
                            className={`${getAIColor(debate.ai1_model)} transition-all`}
                            style={{ width: `${ai1Percent}%` }}
                        />
                        <div
                            className={`${getAIColor(debate.ai2_model)} transition-all`}
                            style={{ width: `${ai2Percent}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{totalVotes} votes</span>
                    <span>{Math.floor(debate.total_duration_seconds / 60)}:{String(debate.total_duration_seconds % 60).padStart(2, '0')}</span>
                </div>
            </motion.div>
        </Link>
    )
}
