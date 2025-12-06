import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch session
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
}

// POST - Create new session
export async function POST(request: Request) {
    const body = await request.json()
    const { session_id } = body

    const { data, error } = await supabase
        .from('user_sessions')
        .insert([{ session_id }])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
}

// PATCH - Update session
export async function PATCH(request: Request) {
    const body = await request.json()
    const { session_id, ...updates } = body

    const { data, error } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('session_id', session_id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
}
