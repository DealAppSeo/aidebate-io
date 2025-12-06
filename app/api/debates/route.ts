import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            // Get single debate with topic and models
            const { data: debate, error: debateError } = await supabase
                .from('debates')
                .select(`
          *,
          aidebate_topics (*)
        `)
                .eq('id', id)
                .single();

            if (debateError) throw debateError;

            return NextResponse.json({ debate });
        } else {
            // Get all active debates with topics
            const { data: debates, error: debatesError } = await supabase
                .from('debates')
                .select(`
          *,
          aidebate_topics (*)
        `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (debatesError) throw debatesError;

            return NextResponse.json({ debates });
        }
    } catch (error) {
        console.error('Error fetching debates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch debates' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topic_id, model_a_response, model_b_response, model_c_response } = body;

        const { data, error } = await supabase
            .from('debates')
            .insert([
                {
                    topic_id,
                    model_a_response,
                    model_b_response,
                    model_c_response,
                    status: 'active',
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ debate: data });
    } catch (error) {
        console.error('Error creating debate:', error);
        return NextResponse.json(
            { error: 'Failed to create debate' },
            { status: 500 }
        );
    }
}
