import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { type, data } = body

        // Mapping events to DB updates
        // We assume 'debate_started' creates a new row or we use upsert with a generated ID?
        // Actually, for simplicity, 'debate_started' returns an ID tracking ID?
        // Or we just insert events? The schema has 'debate_engagement' as a session-level record.

        // Strategy:
        // 1. debate_started: Insert row, return ID.
        // 2. round_completed: Update row.
        // 3. vote_cast: Update row.
        // 4. debate_abandoned: Update row.

        // But to update, we need the engagement ID.
        // Just handling simple inserts for now or ignoring managing ID on client.
        // Wait, efficient tracking needs the ID.

        // Let's simplify: client sends session_id and debate_id. We find the *most recent* open engagement for that pair?
        // Or client stores the engagement ID?

        // For V1, let's just log 'debate_started' as a new row.
        // And updates... we need to identify the row.
        // Ideally the client gets an ID back.

        if (type === 'debate_started') {
            const { data: row, error } = await supabase
                .from('debate_engagement')
                .insert({
                    session_id: data.session_id,
                    debate_id: data.debate_id,
                    intro_variant: data.intro_variant,
                    started_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, id: row.id })
        }

        if (body.engagement_id) {
            const updateData: any = {}
            if (type === 'round_completed') {
                updateData.rounds_completed = data.round
            }
            if (type === 'vote_cast') {
                updateData.vote_cast = true
                updateData.postvote_heard = true // assumption
                updateData.rounds_completed = 6
            }
            if (type === 'debate_abandoned') {
                updateData.dropped_off_at_round = data.dropped_at_round
            }

            if (Object.keys(updateData).length > 0) {
                await supabase
                    .from('debate_engagement')
                    .update(updateData)
                    .eq('id', body.engagement_id)
            }
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Engagement API Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
