'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import DebatePlayer from '@/components/debates/DebatePlayer'
import PredictionModal from '@/components/modals/PredictionModal'
import VoteModal from '@/components/modals/VoteModal'
import ResultsModal from '@/components/modals/ResultsModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import HallucinationModal from '@/components/modals/HallucinationModal'
import ShareButtons from '@/components/gamification/ShareButtons'
import { useSession } from '@/hooks/useSession'
import { RepIDBreakdown } from '@/lib/repid'

export default function DebatePage() {
    const params = useParams()
    const router = useRouter()
    const { session, updateSession } = useSession()

    const [debate, setDebate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showPrediction, setShowPrediction] = useState(true)
    const [showVote, setShowVote] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [showHallucination, setShowHallucination] = useState(false)

    const [prediction, setPrediction] = useState<'ai1' | 'ai2' | null>(null)
    const [wagered, setWagered] = useState(false)
    const [vote, setVote] = useState<'ai1' | 'ai2' | 'tie' | null>(null)
    const [repidEarned, setRepidEarned] = useState<RepIDBreakdown | null>(null)
    const [newStreak, setNewStreak] = useState(0)
    const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null)

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

    async function handleVote(selectedVote: 'ai1' | 'ai2' | 'tie') {
        setVote(selectedVote)

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: session?.session_id,
                    debate_id: params.id,
                    vote: selectedVote,
                    prediction,
                    wagered,
                }),
            })

            const data = await response.json()

            setRepidEarned(data.repid)
            setNewStreak(data.new_streak)
            setPredictionCorrect(data.prediction_correct)
            setShowVote(false)
            setShowResults(true)

            // Refresh session
            if (updateSession) {
                await updateSession({})
            }
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    function handleResultsClose() {
        setShowResults(false)

        // 40% chance to show feedback modal
        if (Math.random() < 0.4) {
            setShowFeedback(true)
        } else if (session && session.debates_voted % 3 === 0) {
            // Every 3rd vote, show hallucination check
            setShowHallucination(true)
        } else {
            router.push('/')
        }
    }

    async function handleFeedbackSubmit(reasons: string[], otherText: string) {
        // TODO: Save feedback to database
        console.log('Feedback:', reasons, otherText)

        // Check if should show hallucination modal
        if (session && session.debates_voted % 3 === 0) {
            setShowFeedback(false)
            setShowHallucination(true)
        } else {
            router.push('/')
        }
    }

    async function handleHallucinationSubmit(roundNumber: number, aiName: string, claim: string, report: string) {
        // TODO: Save hallucination flag to database
        console.log('Hallucination flag:', { roundNumber, aiName, claim, report })
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

    const winnerName = vote === 'ai1' ? debate.ai1_name : vote === 'ai2' ? debate.ai2_name : 'Tie'

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
                {!showPrediction && !showVote && !showResults && (
                    <DebatePlayer
                        rounds={debate.rounds}
                        ai1Name={debate.ai1_name}
                        ai2Name={debate.ai2_name}
                        facilitatorIntro={debate.facilitator_intro}
                        facilitatorOutro={debate.facilitator_outro}
                        onComplete={handleDebateComplete}
                    />
                )}

                {/* Share Buttons (after results) */}
                {showResults && repidEarned && (
                    <div className="mt-6">
                        <ShareButtons
                            debateTitle={debate.title}
                            winner={winnerName}
                            repidEarned={repidEarned.total}
                        />
                    </div>
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

                {repidEarned && (
                    <ResultsModal
                        isOpen={showResults}
                        onClose={handleResultsClose}
                        repidEarned={repidEarned}
                        newStreak={newStreak}
                        predictionCorrect={predictionCorrect}
                    />
                )}

                <FeedbackModal
                    isOpen={showFeedback}
                    onClose={() => router.push('/')}
                    onSubmit={handleFeedbackSubmit}
                    winnerName={winnerName}
                />

                <HallucinationModal
                    isOpen={showHallucination}
                    onClose={() => router.push('/')}
                    onSubmit={handleHallucinationSubmit}
                    rounds={debate.rounds}
                    ai1Name={debate.ai1_name}
                    ai2Name={debate.ai2_name}
                />
            </main>
        </div>
    )
}
