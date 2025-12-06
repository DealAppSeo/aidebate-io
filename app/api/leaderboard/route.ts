import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { data, error } = await (supabase.from('ai_models') as any)
            .select('*')
            .order('overall_score', { ascending: false });

        if (error) {
            console.error('Leaderboard error:', error);
            return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
        }

        return NextResponse.json({ leaderboard: data });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
