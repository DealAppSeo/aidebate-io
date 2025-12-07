import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:support@aidebate.io',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
    )
}

export async function POST(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { session_id, title, body, url } = await request.json()

    // Get subscription
    const { data: sub } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('session_id', session_id)
        .single()

    if (!sub) {
        return NextResponse.json({ error: 'No subscription' }, { status: 404 })
    }

    try {
        await webpush.sendNotification(
            {
                endpoint: sub.endpoint,
                keys: sub.keys
            },
            JSON.stringify({ title, body, url })
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Push send error:", error)
        return NextResponse.json({ error: 'Send failed' }, { status: 500 })
    }
}
