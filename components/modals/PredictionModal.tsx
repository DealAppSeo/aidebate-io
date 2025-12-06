'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PredictionModalProps {
    isOpen: boolean
    onClose: () => void
    onPredict: (prediction: 'ai1' | 'ai2' | null, wagered: boolean) => void
    ai1Name: string
    ai2Name: string
    canWager: boolean
    currentStreak: number
}

export default function PredictionModal({
    isOpen,
    onClose,
    onPredict,
    ai1Name,
    ai2Name,
    canWager,
    currentStreak
}: PredictionModalProps) {
    const [prediction, setPrediction] = useState<'ai1' | 'ai2' | null>(null)
    const [wagered, setWagered] = useState(false)

    const handleSubmit = () => {
        onPredict(prediction, wagered)
        onClose()
    }

    const getWagerMultiplier = () => {
        if (currentStreak >= 10) return '5x'
        if (currentStreak >= 5) return '3x'
        if (currentStreak >= 3) return '2x'
        if (currentStreak >= 2) return '1.5x'
        return '1x'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-[#171717] border border-[#27272a] rounded-2xl p-8 max-w-md w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Make Your Prediction</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Prediction Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setPrediction('ai1')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${prediction === 'ai1'
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-[#27272a] hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="font-bold">{ai1Name} wins</div>
                                </button>

                                <button
                                    onClick={() => setPrediction('ai2')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${prediction === 'ai2'
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-[#27272a] hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="font-bold">{ai2Name} wins</div>
                                </button>

                                <button
                                    onClick={() => setPrediction(null)}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${prediction === null
                                            ? 'border-gray-500 bg-gray-500/10'
                                            : 'border-[#27272a] hover:border-gray-500/50'
                                        }`}
                                >
                                    <div className="text-gray-400">Skip prediction</div>
                                </button>
                            </div>

                            {/* Wager Option */}
                            {canWager && prediction && (
                                <div className="mb-6 p-4 bg-[#0a0a0a] rounded-lg border border-[#27272a]">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div>
                                            <div className="font-medium">Wager Your Streak</div>
                                            <div className="text-sm text-gray-400">
                                                {getWagerMultiplier()} RepID if correct, lose streak if wrong
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={wagered}
                                            onChange={(e) => setWagered(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                    </label>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                {prediction ? 'Lock In Prediction' : 'Watch Debate'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
