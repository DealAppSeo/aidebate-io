'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Zap, Target, Trophy, Share2, Play, Swords } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { RepIDBreakdown } from '@/lib/repid'
import { useRouter } from 'next/navigation'

interface ResultsModalProps {
    isOpen: boolean
    onClose: () => void
    repidEarned: RepIDBreakdown
    newStreak: number
    predictionCorrect: boolean | null
    vote: 'ai_a' | 'ai_b' | 'tie' | null
    ai1Name: string
    ai2Name: string
    ai1Votes: number
    ai2Votes: number
    topic: string
}

export default function ResultsModal({
    isOpen,
    onClose,
    repidEarned,
    newStreak,
    predictionCorrect,
    vote,
    ai1Name,
    ai2Name,
    ai1Votes,
    ai2Votes,
    topic
}: ResultsModalProps) {
    const router = useRouter()
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const count = repidEarned.total > 20 ? 150 : 75
            confetti({
                particleCount: count,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, [isOpen, repidEarned.total])

    const totalVotes = ai1Votes + ai2Votes || 1
    const ai1Percent = Math.round((ai1Votes / totalVotes) * 100)
    const ai2Percent = 100 - ai1Percent

    const handleShare = async () => {
        const text = `I just voted in "${topic}" on AIDebate.io! \nWinner: ${ai1Votes > ai2Votes ? ai1Name : ai2Name} \n\nCheck it out: https://aidebate.io`
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const getBonusIcon = (type: string) => {
        switch (type) {
            case 'prediction_match': return <Target className="w-4 h-4" />
            case 'community_match': return <TrendingUp className="w-4 h-4" />
            case 'contrarian': return <Zap className="w-4 h-4" />
            case 'hot_streak': return <Trophy className="w-4 h-4" />
            case 'wager_won': return <Trophy className="w-4 h-4" />
            default: return null
        }
    }

    const getBonusLabel = (type: string) => {
        switch (type) {
            case 'prediction_match': return 'Prediction Match'
            case 'community_match': return 'Community Match'
            case 'contrarian': return 'Contrarian Bonus'
            case 'hot_streak': return 'Hot Streak!'
            case 'wager_won': return 'Wager Won!'
            default: return type
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#171717] border border-[#27272a] rounded-2xl p-6 md:p-8 max-w-md w-full pointer-events-auto shadow-2xl relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Debate Results
                                    </h2>
                                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* User Vote */}
                                <div className="text-center mb-8">
                                    <p className="text-gray-400 mb-2">You voted for</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className={`text-xl font-bold ${vote === 'ai_a' ? 'text-purple-400' : vote === 'ai_b' ? 'text-amber-400' : 'text-gray-400'}`}>
                                            {vote === 'ai_a' ? ai1Name : vote === 'ai_b' ? ai2Name : 'Tie'}
                                        </span>
                                        {predictionCorrect && (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                                                Predicted Correctly
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Results Bar */}
                                <div className="space-y-2 mb-8">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-purple-400">{ai1Name} {ai1Percent}%</span>
                                        <span className="text-amber-400">{ai2Percent}% {ai2Name}</span>
                                    </div>
                                    <div className="h-4 bg-[#0a0a0a] rounded-full overflow-hidden flex relative border border-white/5">
                                        <motion.div
                                            initial={{ width: '50%' }}
                                            animate={{ width: `${ai1Percent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-purple-600 to-purple-500"
                                        />
                                        <motion.div
                                            initial={{ width: '50%' }}
                                            animate={{ width: `${ai2Percent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-l from-amber-600 to-amber-500"
                                        />
                                        {/* Center Line */}
                                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/50" />
                                    </div>
                                    <p className="text-center text-xs text-gray-500 mt-1">
                                        Total Votes: {totalVotes}
                                    </p>
                                </div>

                                {/* RepID Reward */}
                                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 mb-8">
                                    <div className="flex bg-[#0a0a0a] rounded-lg p-2 mb-4 justify-between items-center">
                                        <div className="text-gray-400">Total Earned</div>
                                        <div className="text-yellow-400 font-bold font-mono text-2xl">+{repidEarned.total} RepID</div>
                                    </div>

                                    <div className="space-y-1">
                                        {/* Breakdown items */}
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>Base Reward</span>
                                            <span>+{repidEarned.base}</span>
                                        </div>
                                        {repidEarned.bonuses.map((bonus, i) => (
                                            <div key={i} className="flex justify-between text-xs text-purple-400">
                                                <span className="flex items-center gap-1">
                                                    {getBonusIcon(bonus.type)} {getBonusLabel(bonus.type)}
                                                </span>
                                                <span>+{bonus.amount || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleShare}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        {copied ? "Link Copied!" : "Share Result"}
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={onClose}
                                            className="bg-[#27272a] hover:bg-[#323238] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                        >
                                            <Play className="w-4 h-4" />
                                            Watch Another
                                        </button>
                                        <button
                                            onClick={() => router.push('/submit-question')}
                                            className="bg-[#27272a] hover:bg-[#323238] text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                        >
                                            <Swords className="w-4 h-4" />
                                            Challenge AI
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
