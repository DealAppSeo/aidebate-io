'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import DebatePlayer from '@/components/debates/DebatePlayer'
import PredictionModal from '@/components/modals/PredictionModal'
import VoteModal from '@/components/modals/VoteModal'
import { useSession } from '@/hooks/useSession'

export default function DebatePage() {
    const params = useParams()
    const router = useRouter()
    const { session, updateSession } = useSession()

    const [debate, setDebate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showPrediction, setShowPrediction] = useState(true)
    const [showVote, setShowVote] = useState(false)
    const [prediction, setPrediction] = useState<'ai1' | 'ai2' | null>(null)
    const [wagered, setWagered] = useState(false)

    useEffect(() => {
        fetchDebate()
    }, [params.id])

    async function fetchDebate() {
        try {
            const response = await fetch(`/api/debates?id=${params.id}`)
            const data = await response.json()
            setDebate(data.debate)
        } catch (error) {
            console.error('Error fetching debate:', error)
        } finally {
            setLoading(false)
        }
    }

    function handlePredict(pred: 'ai1' | 'ai2' | null, wager: boolean) {
        setPrediction(pred)
        setWagered(wager)
        setShowPrediction(false)
    }

    function handleDebateComplete() {
        setShowVote(true)
    }

    async function handleVote(vote: 'ai1' | 'ai2' | 'tie') {
        // Calculate RepID and update session
        // This will be implemented in Block 2

        // For now, just navigate back
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        )
    }

    if (!debate) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-400">Debate not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Title */}
                <div className="text-center mb-8">
                    <span className="text-sm uppercase tracking-wide text-gray-400">
                        {debate.category}
                    </span>
                    <h1 className="text-3xl font-bold mt-2 mb-4">
                        {debate.title}
                    </h1>
                </div>

                {/* Player */}
                {!showPrediction && !showVote && (
                    <DebatePlayer
                        rounds={debate.rounds}
                        ai1Name={debate.ai1_name}
                        ai2Name={debate.ai2_name}
                        facilitatorIntro={debate.facilitator_intro}
                        facilitatorOutro={debate.facilitator_outro}
                        onComplete={handleDebateComplete}
                    />
                )}

                {/* Modals */}
                <PredictionModal
                    isOpen={showPrediction}
                    onClose={() => setShowPrediction(false)}
                    onPredict={handlePredict}
                    ai1Name={debate.ai1_name}
                    ai2Name={debate.ai2_name}
                    canWager={session ? session.current_streak >= 2 : false}
                    currentStreak={session?.current_streak || 0}
                />

                <VoteModal
                    isOpen={showVote}
                    onClose={() => setShowVote(false)}
                    onVote={handleVote}
                    ai1Name={debate.ai1_name}
                    ai2Name={debate.ai2_name}
                />
            </main>
        </div>
    )
}
