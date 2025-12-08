'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export const EthicsImpactMeter = ({ score = 75 }: { score?: number }) => {
    const [animatedScore, setAnimatedScore] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 500)
        return () => clearTimeout(timer)
    }, [score])

    return (
        <div className="w-full bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-4 text-center">Your Ethics Impact</h3>

            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
                {/* Gradient Bar */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${animatedScore}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </div>

            <div className="flex justify-between text-xs font-mono text-gray-600">
                <span>Rogue AI</span>
                <span>Neutral</span>
                <span>Guardian</span>
            </div>

            <div className="mt-4 text-center">
                <motion.span
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {animatedScore > 80 ? '🛡️ Guardian Class' : animatedScore > 50 ? '⚖️ Balanced Observer' : '⚠️ Risk Taker'}
                </motion.span>
            </div>
        </div>
    )
}
