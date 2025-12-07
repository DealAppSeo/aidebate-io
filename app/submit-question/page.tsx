'use client'

import Header from '@/components/layout/Header'
import { motion } from 'framer-motion'
import { ArrowLeft, Swords } from 'lucide-react'
import Link from 'next/link'

export default function SubmitQuestionPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Debates
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#171717] border border-[#27272a] rounded-2xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Swords className="w-8 h-8 text-blue-500" />
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Challenge the AI</h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Have a burning question or a controversial topic? Submit it here and watch the AI models battle it out!
                    </p>

                    <div className="bg-[#0a0a0a] border border-[#27272a] rounded-xl p-8 mb-8">
                        <p className="text-sm text-yellow-500 mb-2 font-mono uppercase tracking-wider">Coming Soon</p>
                        <h3 className="text-xl font-bold mb-2">Community Submissions</h3>
                        <p className="text-gray-500 text-sm">
                            We're currently building the system to let you drive the conversation. Stay tuned!
                        </p>
                    </div>

                    <form className="opacity-50 pointer-events-none">
                        <div className="text-left mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Question</label>
                            <textarea
                                className="w-full bg-[#0a0a0a] border border-[#27272a] rounded-lg p-4 h-32 resize-none"
                                placeholder="e.g., Is universal basic income inevitable?"
                            />
                        </div>
                        <button disabled className="w-full bg-blue-600/50 text-white font-bold py-3 rounded-lg cursor-not-allowed">
                            Submit Challenge
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    )
}
