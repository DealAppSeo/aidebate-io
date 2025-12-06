import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data: models, error } = await supabase
            .from('ai_models')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}
