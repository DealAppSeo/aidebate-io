import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: debateId } = await params;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: debate, error: debateError } = await supabase
            .from('debates')
            .select('*, topic:aidebate_topics(*)')
            .eq('id', debateId)
            .single();

        if (debateError || !debate) {
            return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
        }

        const debateData = debate as any;

        const participants = [
            debateData.topic?.model_a,
            debateData.topic?.model_b,
            debateData.topic?.model_c
        ].filter(Boolean);

        const { data: models } = await supabase
            .from('ai_models')
            .select('*')
            .in('name', participants);

        const modelList = (models || []) as any[];

        const response = {
            id: debateData.id,
            topic: debateData.topic?.title,
            status: debateData.status,
            participants: modelList.map((m: any) => ({
                name: m.name,
                provider: m.provider,
                score: m.overall_repid,
                avatar: m.avatar_url
            })),
            votes: {
                [debateData.topic?.model_a]: debateData.model_a_votes,
                [debateData.topic?.model_b]: debateData.model_b_votes,
                ...(debateData.topic?.model_c ? { [debateData.topic.model_c]: debateData.model_c_votes } : {})
            },
            endTime: debateData.voting_ends_at
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
