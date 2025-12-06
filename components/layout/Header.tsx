'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useSession } from '@/hooks/useSession'

export default function Header() {
    const { session } = useSession()

    return (
        <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#0a0a0a]/90 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                    <span className="text-xl font-bold">AIDebate.io</span>
                </Link>

                <div className="flex items-center gap-6">
                    {/* RepID Score */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">RepID</span>
                        <span className="font-mono text-lg font-bold text-[#fbbf24]">
                            {session?.repid_score || 0}
                        </span>
                    </div>

                    {/* Streak */}
                    {session && session.current_streak > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Streak</span>
                            <span className="font-mono text-lg font-bold text-[#f97316]">
                                {session.current_streak} 🔥
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
