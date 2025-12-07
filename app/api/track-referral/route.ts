import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    try {
        await limiter.check(10, ip)
    } catch {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { referrer_id, referred_session, debate_id } = await request.json()

    // Server-side client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if already referred
    const { data: existing } = await supabase
        .from('referral_events')
        .select('id')
        .eq('referred_session', referred_session)
        .single()

    if (existing) return NextResponse.json({ already_referred: true })

    // Create referral event
    await supabase.from('referral_events').insert({
        referrer_session: referrer_id,
        referred_session,
        debate_id
    })

    // Update referred user's record
    await supabase
        .from('user_sessions')
        .update({ referred_by: referrer_id })
        .eq('session_id', referred_session)

    return NextResponse.json({ success: true })
}
