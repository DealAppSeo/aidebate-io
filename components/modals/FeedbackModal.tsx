'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (reasons: string[], otherText: string) => void
    winnerName: string
}

const FEEDBACK_OPTIONS = [
    { id: 'logical', label: 'More logical' },
    { id: 'evidence', label: 'Better evidence' },
    { id: 'honest', label: 'More honest' },
    { id: 'style', label: 'Better style' },
    { id: 'direct', label: 'More direct' },
    { id: 'other', label: 'Other' },
]

export default function FeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    winnerName
}: FeedbackModalProps) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [otherText, setOtherText] = useState('')

    const toggleReason = (id: string) => {
        setSelectedReasons(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    const handleSubmit = () => {
        onSubmit(selectedReasons, otherText)
        setSelectedReasons([])
        setOtherText('')
        onClose()
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
                                <h2 className="text-2xl font-bold">Why {winnerName}?</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-6">
                                Help us understand what makes a great AI response. (+3 RepID)
                            </p>

                            <div className="space-y-3 mb-6">
                                {FEEDBACK_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleReason(option.id)}
                                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedReasons.includes(option.id)
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-[#27272a] hover:border-blue-500/50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {selectedReasons.includes('other') && (
                                <textarea
                                    value={otherText}
                                    onChange={(e) => setOtherText(e.target.value)}
                                    placeholder="Tell us more..."
                                    className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-3 mb-6 resize-none"
                                    rows={3}
                                />
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={selectedReasons.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
