'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import DebatePlayer from '@/components/debates/DebatePlayer'
import { VoteScreen } from '@/components/debates/VoteScreen'
import { ResultsScreen } from '@/components/debates/ResultsScreen'
import MissionScreen from '@/components/debates/MissionScreen'
import { PredictionScreen } from '@/components/PredictionScreen'
import PredictionModal from '@/components/modals/PredictionModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import HallucinationModal from '@/components/modals/HallucinationModal'
import { ShareModal } from '@/components/modals/ShareModal'
import { useSession } from '@/hooks/useSession'
import { RepIDBreakdown } from '@/lib/repid'

export default function DebatePage() {
    const params = useParams()
    const router = useRouter()
    const { session, updateSession } = useSession()

    const [debate, setDebate] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // View State Management
    // 'prediction' -> 'player' -> 'vote' -> 'results' -> 'mission'
    const [viewMode, setViewMode] = useState<'prediction' | 'player' | 'vote' | 'results' | 'mission'>('prediction')
    const [showShareModal, setShowShareModal] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [showHallucination, setShowHallucination] = useState(false)

    // Voting State
    const [prediction, setPrediction] = useState<'ai_a' | 'ai_b' | 'tie' | null>(null)
    const [voteStartTime, setVoteStartTime] = useState<number>(0)
    const [hasVoted, setHasVoted] = useState(false)
    const [vote, setVote] = useState<'ai_a' | 'ai_b' | 'tie' | null>(null)

    // Results
    const [repidEarned, setRepidEarned] = useState<number>(0)
    const [newStreak, setNewStreak] = useState(0)
    const [predictionCorrect, setPredictionCorrect] = useState<boolean>(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    function handlePrediction(speakerId: string) {
        setPrediction(speakerId as any)
        setViewMode('player')
    }

    function handleSkipPrediction() {
        setPrediction(null)
        setViewMode('player')
    }

    function handleDebateComplete() {
        setVoteStartTime(Date.now())
        setViewMode('vote')
    }

    async function handleVote(selectedVote: string) {
        if (!session || hasVoted || isSubmitting) return
        setIsSubmitting(true)
        setVote(selectedVote as any)

        const timeTaken = Date.now() - voteStartTime

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: session.session_id,
                    debate_id: params.id,
                    vote: selectedVote,
                    prediction,
                    time_taken: timeTaken
                }),
            })

            const data = await response.json()
            if (data.success) {
                setHasVoted(true)
                setRepidEarned(data.repid.total) // Use total from breakdown
                setNewStreak(data.new_streak)
                setPredictionCorrect(data.prediction_correct)
                setViewMode('results')

                if (updateSession) updateSession({})
                fetchDebate() // Refresh stats
            }
        } catch (error) {
            console.error('Vote failed:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>
    if (!debate) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Debate not found</div>

    const speakers = [
        { id: 'ai_a', name: debate.ai_a_name, color: '#9333ea' },
        { id: 'ai_b', name: debate.ai_b_name, color: '#f59e0b' }
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Title context always visible mostly */}
                <div className="text-center mb-6">
                    <span className="text-sm uppercase tracking-wide text-gray-400">{debate.category}</span>
                    <h1 className="text-2xl md:text-3xl font-bold mt-1 text-white">{debate.topic}</h1>
                </div>

                <div className="min-h-[500px] flex flex-col justify-center">
                    {viewMode === 'prediction' && (
                        <PredictionScreen
                            speakers={speakers}
                            onPredict={handlePrediction}
                            onSkip={handleSkipPrediction}
                        />
                    )}

                    {viewMode === 'player' && (
                        <DebatePlayer
                            debateId={debate.id}
                            rounds={debate.rounds}
                            ai1Name={debate.ai_a_name}
                            ai2Name={debate.ai_b_name}
                            topic={debate.topic}
                            session={session}
                            prediction={prediction || undefined}
                            onComplete={handleDebateComplete}
                        />
                    )}

                    {viewMode === 'vote' && (
                        <VoteScreen
                            speakers={speakers}
                            prediction={prediction === 'ai_a' ? debate.ai_a_name : (prediction === 'ai_b' ? debate.ai_b_name : undefined)}
                            onVote={handleVote}
                            onSkip={() => setViewMode('results')} // Or skip vote completely?
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {viewMode === 'results' && (
                        <ResultsScreen
                            debateId={debate.id}
                            topic={debate.topic}
                            results={{
                                ai_a: debate.ai_a_votes,
                                ai_b: debate.ai_b_votes
                            }}
                            speakers={speakers}
                            userVote={vote || ''}
                            prediction={prediction || undefined}
                            totalVotes={debate.ai_a_votes + debate.ai_b_votes}
                            currentRepId={session?.repid_score || 0}
                            streak={newStreak}
                        />
                    )}

                    {viewMode === 'mission' && (
                        <MissionScreen isLoggedIn={!!session} />
                    )}
                </div>
            </main>
        </div>
    )
}
