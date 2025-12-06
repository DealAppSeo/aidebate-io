import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase';

export async function GET(req: Request) {
    try {
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch AI Leaderboard
        const { data: aiLeaderboard, error: aiError } = await supabase
            .from('ai_leaderboard')
            .select('*')
            .limit(10);

        if (aiError) {
            throw aiError;
        }

        // Fetch User Leaderboard (Top 10)
        // Note: user_leaderboard view might not exist yet if not run in SQL
        // Fallback to raw query if needed
        const { data: userLeaderboard, error: userError } = await supabase
            .from('aidebate_users')
            .select('id, display_name, repid_balance, tier, avatar_url, total_votes')
            .order('repid_balance', { ascending: false })
            .limit(10);
        if (userError) {
            throw userError;
        }

        return NextResponse.json({
            ai: aiLeaderboard,
            users: userLeaderboard.map((u: any, index: number) => ({
                rank: index + 1,
                ...u
            }))
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
