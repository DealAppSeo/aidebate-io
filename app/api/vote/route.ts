import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { calculateRepID } from '@/lib/repid'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { session_id, debate_id, vote, prediction, wagered } = body

        // Get debate to calculate community result
        const { data: debate } = await supabase
            .from('debates')
            .select('*')
            .eq('id', debate_id)
            .single()

        if (!debate) {
            return NextResponse.json({ error: 'Debate not found' }, { status: 404 })
        }

        // Calculate community winner
        const totalVotes = debate.vote_count_ai1 + debate.vote_count_ai2 + debate.vote_count_tie
        let communityWinner: 'ai1' | 'ai2' | 'tie' = 'ai1'
        let winnerPercent = 0

        if (debate.vote_count_ai1 > debate.vote_count_ai2 && debate.vote_count_ai1 > debate.vote_count_tie) {
            communityWinner = 'ai1'
            winnerPercent = totalVotes > 0 ? (debate.vote_count_ai1 / totalVotes) * 100 : 0
        } else if (debate.vote_count_ai2 > debate.vote_count_ai1 && debate.vote_count_ai2 > debate.vote_count_tie) {
            communityWinner = 'ai2'
            winnerPercent = totalVotes > 0 ? (debate.vote_count_ai2 / totalVotes) * 100 : 0
        } else {
            communityWinner = 'tie'
            winnerPercent = totalVotes > 0 ? (debate.vote_count_tie / totalVotes) * 100 : 0
        }

        // Get user session for streak
        const { data: session } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('session_id', session_id)
            .single()

        const userStreak = session?.current_streak || 0

        // Calculate RepID
        const repidResult = calculateRepID(
            vote,
            prediction,
            { winner: communityWinner, winnerPercent },
            userStreak,
            wagered
        )

        // Update debate vote counts
        const voteField = vote === 'ai1' ? 'vote_count_ai1' : vote === 'ai2' ? 'vote_count_ai2' : 'vote_count_tie'
        await supabase
            .from('debates')
            .update({ [voteField]: debate[voteField] + 1 })
            .eq('id', debate_id)

        // Record vote
        const predictionCorrect = prediction ? prediction === vote : null
        const { data: voteRecord } = await supabase
            .from('votes')
            .insert([{
                session_id,
                debate_id,
                prediction,
                vote,
                wagered,
                streak_at_vote: userStreak,
                repid_earned: repidResult.total,
                repid_breakdown: repidResult,
                prediction_correct: predictionCorrect,
                matched_community: vote === communityWinner,
            }])
            .select()
            .single()

        // Update user session
        if (session) {
            const newStreak = predictionCorrect === true ? userStreak + 1 : (wagered ? 0 : userStreak)
            const newRepID = session.repid_score + repidResult.total

            await supabase
                .from('user_sessions')
                .update({
                    repid_score: newRepID,
                    current_streak: newStreak,
                    longest_streak: Math.max(session.longest_streak, newStreak),
                    debates_voted: session.debates_voted + 1,
                    debates_seen: [...session.debates_seen, debate_id],
                })
                .eq('session_id', session_id)
        }

        return NextResponse.json({
            success: true,
            repid: repidResult,
            new_streak: session ? (predictionCorrect === true ? userStreak + 1 : (wagered ? 0 : userStreak)) : 0,
            prediction_correct: predictionCorrect,
            vote_id: voteRecord?.id,
        })
    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }
}
