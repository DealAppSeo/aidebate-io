'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Flag } from 'lucide-react'
import { useState } from 'react'

// ACTUAL DATABASE FORMAT
interface DatabaseRound {
    round: number
    type: string
    ai_a_text: string
    ai_b_text: string
}

interface HallucinationModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (roundNumber: number, aiName: string, claim: string, report: string) => void
    rounds: DatabaseRound[]
    ai1Name: string
    ai2Name: string
}

export default function HallucinationModal({
    isOpen,
    onClose,
    onSubmit,
    rounds,
    ai1Name,
    ai2Name
}: HallucinationModalProps) {
    const [selectedRound, setSelectedRound] = useState<number | null>(null)
    const [selectedAI, setSelectedAI] = useState<string | null>(null)
    const [claim, setClaim] = useState('')
    const [report, setReport] = useState('')

    const handleSubmit = () => {
        if (selectedRound !== null && selectedAI && claim) {
            onSubmit(selectedRound, selectedAI, claim, report)
            setSelectedRound(null)
            setSelectedAI(null)
            setClaim('')
            setReport('')
            onClose()
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
                        <div className="bg-[#171717] border border-[#27272a] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Flag className="w-6 h-6 text-red-500" />
                                    <h2 className="text-2xl font-bold">Flag Hallucination</h2>
                                </div>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-6">
                                Spotted a suspicious claim? Help verify AI honesty. (+5 RepID if confirmed)
                            </p>

                            {/* Select AI */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">Which AI?</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedAI('ai_a')}
                                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${selectedAI === 'ai_a'
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-[#27272a] hover:border-blue-500/50'
                                            }`}
                                    >
                                        {ai1Name}
                                    </button>
                                    <button
                                        onClick={() => setSelectedAI('ai_b')}
                                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${selectedAI === 'ai_b'
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-[#27272a] hover:border-blue-500/50'
                                            }`}
                                    >
                                        {ai2Name}
                                    </button>
                                </div>
                            </div>

                            {/* Select Round */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">Which round?</label>
                                <select
                                    value={selectedRound || ''}
                                    onChange={(e) => setSelectedRound(Number(e.target.value))}
                                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-3"
                                >
                                    <option value="">Select round...</option>
                                    {rounds.map((round) => (
                                        <option key={round.round} value={round.round}>
                                            Round {round.round} - {round.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Claim Text */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">Suspicious claim</label>
                                <textarea
                                    value={claim}
                                    onChange={(e) => setClaim(e.target.value)}
                                    placeholder="Copy the exact claim that seems false..."
                                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-3 resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Report */}
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">Why is this suspicious? (optional)</label>
                                <textarea
                                    value={report}
                                    onChange={(e) => setReport(e.target.value)}
                                    placeholder="Explain why you think this is false..."
                                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-3 resize-none"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!selectedRound || !selectedAI || !claim}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Submit Flag
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
