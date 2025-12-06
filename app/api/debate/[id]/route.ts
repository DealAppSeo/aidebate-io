import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: debateId } = await params;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get debate directly without topic join
        const { data: debate, error: debateError } = await (supabase
            .from('debates') as any)
            .select('*')
            .eq('id', debateId)
            .single();

        if (debateError || !debate) {
            return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
        }

        const debateData = debate as any;

        // Get AI models by IDs
        const aiIds = [debateData.ai_a_id, debateData.ai_b_id].filter(Boolean);

        const { data: models } = await (supabase
            .from('ai_models') as any)
            .select('*')
            .in('id', aiIds);

        const modelList = (models || []) as any[];

        const response = {
            id: debateData.id,
            topic: debateData.topic,
            description: debateData.description,
            category: debateData.category,
            status: debateData.status,
            ai_a: {
                id: debateData.ai_a_id,
                name: debateData.ai_a_name,
                position: debateData.ai_a_position,
                votes: debateData.ai_a_votes,
                model: modelList.find((m: any) => m.id === debateData.ai_a_id)
            },
            ai_b: {
                id: debateData.ai_b_id,
                name: debateData.ai_b_name,
                position: debateData.ai_b_position,
                votes: debateData.ai_b_votes,
                model: modelList.find((m: any) => m.id === debateData.ai_b_id)
            },
            started_at: debateData.started_at,
            ended_at: debateData.ended_at,
            is_featured: debateData.is_featured
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
