import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { debate_id, voted_for, user_email } = await req.json();

        if (!debate_id || !voted_for || !user_email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Supabase client (server-side)
        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Get User ID from email
        const { data: userData, error: userError } = await supabase
            .from('aidebate_users')
            .select('id')
            .eq('email', user_email)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user_id = userData.id;

        // 2. Check if already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('id')
            .eq('user_id', user_id)
            .eq('debate_id', debate_id)
            .single();

        if (existingVote) {
            return NextResponse.json({ error: 'Already voted in this debate' }, { status: 400 });
        }

        // 3. Insert Vote (Trigger will handle RepID and AI score updates)
        const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .insert({
                user_id,
                debate_id: parseInt(debate_id),
                voted_for,
            })
            .select()
            .single();

        if (voteError) {
            console.error('Vote error:', voteError);
            return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            repid_earned: voteData.repid_earned,
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
