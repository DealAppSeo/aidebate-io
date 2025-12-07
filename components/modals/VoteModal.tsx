'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface VoteModalProps {
    isOpen: boolean
    onClose: () => void
    onVote: (vote: 'ai_a' | 'ai_b' | 'tie') => void
    ai1Name: string
    ai2Name: string
}

export default function VoteModal({
    isOpen,
    onClose,
    onVote,
    ai1Name,
    ai2Name
}: VoteModalProps) {
    const [selectedVote, setSelectedVote] = useState<'ai_a' | 'ai_b' | 'tie' | null>(null)

    const handleSubmit = () => {
        if (selectedVote) {
            onVote(selectedVote)
            onClose()
        }
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
                                <h2 className="text-2xl font-bold">Cast Your Verdict</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-6">
                                Who made the stronger argument?
                            </p>

                            {/* Vote Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setSelectedVote('ai_a')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedVote === 'ai_a'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-[#27272a] hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="font-bold text-lg">{ai1Name}</div>
                                </button>

                                <button
                                    onClick={() => setSelectedVote('ai_b')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedVote === 'ai_b'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-[#27272a] hover:border-blue-500/50'
                                        }`}
                                >
                                    <div className="font-bold text-lg">{ai2Name}</div>
                                </button>

                                <button
                                    onClick={() => setSelectedVote('tie')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all ${selectedVote === 'tie'
                                        ? 'border-gray-500 bg-gray-500/10'
                                        : 'border-[#27272a] hover:border-gray-500/50'
                                        }`}
                                >
                                    <div className="font-medium text-gray-300">It's a Tie</div>
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedVote}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Submit Vote
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
