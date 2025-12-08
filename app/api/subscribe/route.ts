import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, source } = body

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscribers')
            .select('id')
            .eq('email', email)
            .single()

        if (existing) {
            return NextResponse.json({ message: 'Already subscribed', success: true })
        }

        // Insert new subscriber
        const { error } = await supabase
            .from('subscribers')
            .insert([{
                email,
                source,
                subscribed_at: new Date().toISOString(),
                preferences: { weekly_digest: true, vote_alerts: true }
            }])

        if (error) {
            console.error('Subscription error:', error)
            // Handle unique constraint if race condition
            if (error.code === '23505') {
                return NextResponse.json({ message: 'Already subscribed', success: true })
            }
            throw error
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Subscribe API Error:', error)
        return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
}
