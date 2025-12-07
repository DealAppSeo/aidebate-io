'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import DebatePlayer from '@/components/debates/DebatePlayer'
import PredictionModal from '@/components/modals/PredictionModal'
import VoteModal from '@/components/modals/VoteModal'
import ResultsModal from '@/components/modals/ResultsModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import HallucinationModal from '@/components/modals/HallucinationModal'
import { ShareModal } from '@/components/modals/ShareModal'
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
    const [showShareModal, setShowShareModal] = useState(false)

    const searchParams = useSearchParams()
    const isChallenge = searchParams.get('challenge') === 'true'
    const referrer = searchParams.get('ref')
    const [challengeData, setChallengeData] = useState<any>(null)

    const [hasVoted, setHasVoted] = useState(false)
    const [voteData, setVoteData] = useState<any>(null)
    const [prediction, setPrediction] = useState<'ai_a' | 'ai_b' | 'tie' | null>(null)
    const [wagered, setWagered] = useState(false)
    const [vote, setVote] = useState<'ai_a' | 'ai_b' | 'tie' | null>(null)
    const [repidEarned, setRepidEarned] = useState<RepIDBreakdown | null>(null)
    const [newStreak, setNewStreak] = useState(0)
    const [predictionCorrect, setPredictionCorrect] = useState<boolean | null>(null)

    useEffect(() => {
        fetchDebate()
        if (isChallenge && referrer) {
            fetchChallengerVote(referrer, params.id as string)
            trackReferral(referrer)
        }
    }, [params.id, isChallenge, referrer])

    async function fetchChallengerVote(sessionId: string, debateId: string) {
        try {
            const response = await fetch(`/api/challenge-data?session=${sessionId}&debate=${debateId}`)
            const data = await response.json()
            setChallengeData(data)
        } catch (e) {
            console.error("Error fetching challenge data", e)
        }
    }

    async function trackReferral(referrerId: string) {
        try {
            const currentSession = localStorage.getItem('aidebate_session_id')
            if (!currentSession) return // Wait for session init?

            await fetch('/api/track-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referrer_id: referrerId,
                    referred_session: currentSession,
                    debate_id: params.id
                })
            })
        } catch (e) {
            console.error("Referral track error", e)
        }
    }

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

    function handlePredict(pred: 'ai_a' | 'ai_b' | 'tie' | null, isWagered: boolean) {
        setPrediction(pred)
        setWagered(isWagered)
        setShowPrediction(false)
    }

    function handleDebateComplete() {
        setShowVote(true)
    }

    async function handleVote(selectedVote: 'ai_a' | 'ai_b' | 'tie') {
        if (!session || hasVoted) return

        setVote(selectedVote)

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: session.session_id,
                    debate_id: params.id,
                    vote: selectedVote,
                    prediction,
                    wagered
                }),
            })

            const data = await response.json()
            if (data.success) {
                setHasVoted(true)
                setRepidEarned(data.repid)
                setNewStreak(data.new_streak)
                setPredictionCorrect(data.prediction_correct)
                setShowVote(false)
                setShowResults(true)

                // Refresh session and debate
                if (updateSession) {
                    await updateSession({})
                }
                fetchDebate()
            }
        } catch (error) {
            console.error('Vote failed:', error)
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

    const winnerName = vote === 'ai_a' ? debate.ai_a_name : vote === 'ai_b' ? debate.ai_b_name : 'Tie'

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
                        {debate.topic}
                    </h1>
                </div>

                {/* Challenge Banner */}
                {isChallenge && challengeData && (
                    <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 p-4 text-center rounded-xl mb-6 border border-purple-500/50 shadow-lg animate-in fade-in slide-in-from-top-4">
                        <p className="text-white font-bold text-lg mb-1">
                            🎯 You&apos;ve Been Challenged!
                        </p>
                        <p className="text-purple-200">
                            Your friend voted for <strong className="text-white">{challengeData.voterChoice}</strong>.
                            Do you agree?
                        </p>
                    </div>
                )}

                {/* Player */}
                {!showPrediction && !showVote && !showResults && (
                    <DebatePlayer
                        debateId={debate.id}
                        rounds={debate.rounds}
                        ai1Name={debate.ai_a_name}
                        ai2Name={debate.ai_b_name}
                        topic={debate.topic}
                        session={session}
                        onComplete={handleDebateComplete}
                    />
                )}

                {/* Share Buttons (after results) */}
                {showResults && repidEarned && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                        <ShareButtons
                            debateTitle={debate.topic}
                            winner={winnerName}
                            repidEarned={repidEarned.total}
                        />
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        >
                            Challenge a Friend (+25 RepID)
                        </button>
                    </div>
                )}

                {/* Modals */}
                <PredictionModal
                    isOpen={showPrediction}
                    onClose={() => setShowPrediction(false)}
                    onPredict={handlePredict}
                    ai1Name={debate.ai_a_name}
                    ai2Name={debate.ai_b_name}
                    canWager={session ? session.current_streak >= 2 : false}
                    currentStreak={session?.current_streak || 0}
                />

                <VoteModal
                    isOpen={showVote}
                    onClose={() => setShowVote(false)}
                    onVote={handleVote}
                    ai1Name={debate.ai_a_name}
                    ai2Name={debate.ai_b_name}
                />

                {repidEarned && (
                    <ResultsModal
                        isOpen={showResults}
                        onClose={handleResultsClose}
                        repidEarned={repidEarned}
                        newStreak={newStreak}
                        predictionCorrect={predictionCorrect}
                        vote={vote}
                        ai1Name={debate.ai_a_name}
                        ai2Name={debate.ai_b_name}
                        ai1Votes={debate.ai_a_votes}
                        ai2Votes={debate.ai_b_votes}
                        topic={debate.topic}
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
                    ai1Name={debate.ai_a_name}
                    ai2Name={debate.ai_b_name}
                />

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    debate={debate}
                    userVote={vote || undefined}
                    voteResults={debate ? { ai_a: debate.ai_a_votes, ai_b: debate.ai_b_votes } : undefined}
                />
            </main>
        </div>
    )
}
