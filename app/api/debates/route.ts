import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            // Get single debate
            const { data: debate, error: debateError } = await (supabase
                .from('debates') as any)
                .select('*')
                .eq('id', id)
                .single();

            if (debateError) throw debateError;

            return NextResponse.json({ debate });
        } else {
            // Get all active debates
            const { data: debates, error: debatesError } = await (supabase
                .from('debates') as any)
                .select('*')
                .eq('status', 'active')
                .order('started_at', { ascending: false });

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
        const { topic, description, category, ai_a_id, ai_a_name, ai_b_id, ai_b_name } = body;

        const { data, error } = await (supabase
            .from('debates') as any)
            .insert([
                {
                    topic,
                    description,
                    category,
                    ai_a_id,
                    ai_a_name,
                    ai_b_id,
                    ai_b_name,
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
