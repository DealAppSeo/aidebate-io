'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Zap, Target, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'
import { RepIDBreakdown } from '@/lib/repid'

interface ResultsModalProps {
    isOpen: boolean
    onClose: () => void
    repidEarned: RepIDBreakdown
    newStreak: number
    predictionCorrect: boolean | null
}

export default function ResultsModal({
    isOpen,
    onClose,
    repidEarned,
    newStreak,
    predictionCorrect
}: ResultsModalProps) {

    useEffect(() => {
        if (isOpen && repidEarned.total > 20) {
            // Trigger confetti for big wins
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, [isOpen, repidEarned.total])

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
                        className="fixed inset-0 bg-black/80 z-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#171717] border border-[#27272a] rounded-2xl p-8 max-w-md w-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Results</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Prediction Result */}
                            {predictionCorrect !== null && (
                                <div className={`mb-6 p-4 rounded-lg ${predictionCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                    <p className={`font-medium ${predictionCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                        {predictionCorrect ? '✓ Prediction Correct!' : '✗ Prediction Incorrect'}
                                    </p>
                                </div>
                            )}

                            {/* RepID Earned */}
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-400 mb-2">RepID Earned</div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="text-6xl font-mono font-bold text-[#fbbf24]"
                                >
                                    +{repidEarned.total}
                                </motion.div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Base</span>
                                    <span className="font-mono">+{repidEarned.base}</span>
                                </div>

                                {repidEarned.bonuses.map((bonus, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {getBonusIcon(bonus.type)}
                                            <span className="text-gray-400">{getBonusLabel(bonus.type)}</span>
                                        </div>
                                        <span className="font-mono text-[#a855f7]">
                                            {bonus.amount ? `+${bonus.amount}` : `${bonus.multiplier}x`}
                                        </span>
                                    </div>
                                ))}

                                {repidEarned.multiplier > 1 && (
                                    <div className="flex items-center justify-between text-sm font-bold">
                                        <span className="text-[#a855f7]">Multiplier</span>
                                        <span className="font-mono text-[#a855f7]">{repidEarned.multiplier.toFixed(1)}x</span>
                                    </div>
                                )}
                            </div>

                            {/* Streak */}
                            {newStreak > 0 && (
                                <div className="mb-6 p-4 bg-[#0a0a0a] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Current Streak</span>
                                        <span className="font-mono text-lg font-bold text-[#f97316]">
                                            {newStreak} 🔥
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
