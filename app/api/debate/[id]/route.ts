import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const debateId = params.id;

        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch debate details with topic info
        const { data: debate, error: debateError } = await supabase
            .from('debates')
            .select(`
        *,
        topic:aidebate_topics(*)
      `)
            .eq('id', debateId)
            .single();

        if (debateError || !debate) {
            return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
        }

        // Cast to any to avoid complex type issues with joins
        const debateData = debate as any;

        // Fetch participants (AI models) info
        const participants = [
            debateData.topic.model_a,
            debateData.topic.model_b,
            debateData.topic.model_c
        ].filter(Boolean);

        const { data: models } = await supabase
            .from('ai_models')
            .select('*')
            .in('name', participants);

        // Construct response
        const response = {
            id: debateData.id,
            topic: debateData.topic.title,
            status: debateData.status,
            participants: models?.map(m => ({
                name: m.name,
                provider: m.provider,
                score: m.overall_repid,
                avatar: m.avatar_url
            })),
            votes: {
                [debateData.topic.model_a]: debateData.model_a_votes,
                [debateData.topic.model_b]: debateData.model_b_votes,
                ...(debateData.topic.model_c ? { [debateData.topic.model_c]: debateData.model_c_votes } : {})
            },
            endTime: debateData.voting_ends_at
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
