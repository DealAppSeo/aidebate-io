import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabase = createClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Check if user exists
        const { data: existingUser } = await (supabase
            .from('aidebate_users') as any)
            .select('id, repid_balance, tier')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({
                success: true,
                user: existingUser,
                message: 'Welcome back!'
            });
        }

        // Create new user
        const { data: newUser, error: createError } = await (supabase
            .from('aidebate_users') as any)
            .insert({
                email,
                display_name: email.split('@')[0], // Default display name
                repid_balance: 0,
                tier: 'observer'
            } as any)
            .select()
            .single();

        if (createError) {
            console.error('Create user error:', createError);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: newUser,
            message: 'Account created successfully'
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
