import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { calculateRepID } from '@/lib/repid'
import { rateLimit } from '@/lib/rate-limit'

// 10 votes per minute per IP
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    try {
        await limiter.check(10, ip)
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

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
        // Calculate community winner
        const voteCountA = debate.ai_a_votes || 0
        const voteCountB = debate.ai_b_votes || 0
        const totalVotes = voteCountA + voteCountB

        let communityWinner: 'ai_a' | 'ai_b' | 'tie' = 'ai_a'
        let winnerPercent = 0

        if (voteCountA > voteCountB) {
            communityWinner = 'ai_a'
            winnerPercent = totalVotes > 0 ? (voteCountA / totalVotes) * 100 : 0
        } else if (voteCountB > voteCountA) {
            communityWinner = 'ai_b'
            winnerPercent = totalVotes > 0 ? (voteCountB / totalVotes) * 100 : 0
        } else {
            communityWinner = 'tie'
            winnerPercent = 0 // Tie has 0% winner dominance technically, or split
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
        // Note: vote_count_tie was removed from schema, so we only update ai_a/ai_b counts
        if (vote === 'ai_a' || vote === 'ai_b') {
            const voteField = vote === 'ai_a' ? 'ai_a_votes' : 'ai_b_votes'
            await supabase
                .from('debates')
                .update({ [voteField]: debate[voteField] + 1 })
                .eq('id', debate_id)
        }

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

        // --- REFERRAL LOGIC START ---
        try {
            if (session?.referred_by) {
                // Check if this is their first vote (or if referral event exists and not completed)
                const { data: referralEvent } = await supabase
                    .from('referral_events')
                    .select('*')
                    .eq('referred_session', session_id)
                    .eq('referred_voted', false)
                    .single()

                if (referralEvent) {
                    const REFERRAL_BONUS = 25

                    // Award bonus to referrer
                    const { data: refUser } = await supabase
                        .from('user_sessions')
                        .select('repid_score, referral_count, referral_repid_earned')
                        .eq('session_id', session.referred_by)
                        .single()

                    if (refUser) {
                        await supabase
                            .from('user_sessions')
                            .update({
                                repid_score: (refUser.repid_score || 0) + REFERRAL_BONUS,
                                referral_count: (refUser.referral_count || 0) + 1,
                                referral_repid_earned: (refUser.referral_repid_earned || 0) + REFERRAL_BONUS
                            })
                            .eq('session_id', session.referred_by)
                    }

                    // Mark referral as converted
                    await supabase
                        .from('referral_events')
                        .update({ referred_voted: true, repid_awarded: REFERRAL_BONUS })
                        .eq('id', referralEvent.id)
                }
            }
        } catch (e) {
            console.error("Referral Error:", e)
        }
        // --- REFERRAL LOGIC END ---

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
