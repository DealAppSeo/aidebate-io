import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { data, error } = await (supabase.from('debates') as any).select('*');

        if (error) {
            console.error('Debates error:', error);
            return NextResponse.json({ error: 'Failed to fetch debates' }, { status: 500 });
        }

        return NextResponse.json({ debates: data });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
