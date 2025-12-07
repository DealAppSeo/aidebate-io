import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { session_id, subscription } = await request.json()

    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            session_id,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            created_at: new Date().toISOString()
        }, { onConflict: 'session_id' })

    if (error) {
        console.error('Subscription error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
