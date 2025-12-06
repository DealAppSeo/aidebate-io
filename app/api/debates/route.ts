import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all debates or single debate
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
        // Fetch single debate
        const { data, error } = await supabase
            .from('debates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ debate: data })
    } else {
        // Fetch all active debates
        const { data, error } = await supabase
            .from('debates')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ debates: data })
    }
}

// POST - Create new debate (for admin/generation script)
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from('debates')
        .insert([body])
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ debate: data })
}
