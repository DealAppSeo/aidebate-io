import { createClient } from '@/utils/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const session = searchParams.get('session')
    const debate = searchParams.get('debate')

    if (!session || !debate) return NextResponse.json({ error: 'Missing params' })

    const supabase = createClient()

    // Find what the challenger voted for
    const { data: vote } = await supabase
        .from('votes')
        .select('vote_choice') // 'ai_a', 'ai_b', 'tie'
        .eq('session_id', session)
        .eq('debate_id', debate)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!vote) return NextResponse.json({ error: 'No vote found' })

    // Get AI names to return a readable string
    const { data: debateInfo } = await supabase
        .from('debates')
        .select('ai_a_name, ai_b_name')
        .eq('id', debate)
        .single()

    let voterChoice = 'Unknown'
    if (vote.vote_choice === 'ai_a') voterChoice = debateInfo.ai_a_name
    else if (vote.vote_choice === 'ai_b') voterChoice = debateInfo.ai_b_name
    else voterChoice = 'Tie'

    return NextResponse.json({ voterChoice })
}
