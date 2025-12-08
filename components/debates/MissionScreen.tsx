'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, Star, Users } from 'lucide-react'

interface MissionScreenProps {
    isLoggedIn: boolean
}

export default function MissionScreen({ isLoggedIn }: MissionScreenProps) {
    const router = useRouter()

    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#171717] border border-[#27272a] rounded-2xl p-8 shadow-2xsl text-center relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />

                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-900/20 rounded-full border border-blue-500/30">
                        <Shield className="w-12 h-12 text-blue-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                    Help Keep AI Ethical
                </h2>

                <p className="text-gray-400 mb-8 leading-relaxed max-w-lg mx-auto">
                    Your votes and feedback directly train our trust models.
                    By participating, you're helping ensure AI remains safe, alignment-focused, and transparent.
                </p>

                <div className="space-y-4 max-w-md mx-auto">
                    {!isLoggedIn && (
                        <button
                            onClick={() => router.push('/login')} // Assuming login route exists or triggers auth modal
                            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                            <Star className="w-5 h-5 fill-current" />
                            Sign Up to Track RepID
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Next Debate
                    </button>

                    <button
                        onClick={() => window.open('https://discord.gg/aidebate', '_blank')}
                        className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-indigo-500/20"
                    >
                        <Users className="w-5 h-5" />
                        Join the Community
                    </button>
                </div>

                <p className="mt-8 text-xs text-gray-500">
                    A project by DealAppSeo
                </p>
            </motion.div>
        </div>
    )
}
