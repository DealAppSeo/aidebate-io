
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { pollId } = await req.json();

        // Security: Verify user has a session
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Ideally we verify the token, but using the service client for logic is fine if we gate heavily.
        // Better: use a regular client to getUser() from header.
        const userClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await userClient.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check if this is the "last" poll (highest order)
        const { data: poll } = await supabase
            .from('polls')
            .select('*')
            .eq('id', pollId)
            .single();

        if (!poll) return NextResponse.json({ message: "Poll not found" }, { status: 404 });

        // Is there any poll with higher order?
        const { count: newerPollsCount } = await supabase
            .from('polls')
            .select('id', { count: 'exact', head: true })
            .gt('order', poll.order);

        if (newerPollsCount && newerPollsCount > 0) {
            return NextResponse.json({ message: "Not the last poll" });
        }

        // 2. This is the last poll. How many people voted on it?
        const { count: voteCount } = await supabase
            .from('poll_votes')
            .select('id', { count: 'exact', head: true })
            .eq('poll_id', pollId);

        // TRIGGER LOGIC: If exactly 10 votes (or multiples of 10 if we want recurring, but user said "as soon as you have 10 people complete the first 7")
        // Let's stick to ">= 10" and ensuring we haven't already generated the next batch (check newerPollsCount again, which we did).
        // To prevent race conditions/double generation, strictly check if count is >= 10.
        // And we rely on the fact that if we generate, the 'newerPollsCount' check will fail next time.

        if (voteCount && voteCount >= 10) {
            console.log(`🔥 Triggering Poll Generation! Vote count for poll #${poll.order} is ${voteCount}`);

            // 3. Generate 7 New Polls
            const currentOrder = poll.order;
            await generateAndInsertPolls(currentOrder);

            return NextResponse.json({ message: "Generated new polls" });
        }

        return NextResponse.json({ message: "Threshold not met", count: voteCount });

    } catch (error: any) {
        console.error("Error in trigger-check:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function generateAndInsertPolls(startOrder: number) {
    const systemPrompt = `
You are an engagement expert for "AIDebate.io".
Generate 7 NEW, provocative, short survey questions about Artificial Intelligence.
They should be quick to answer but thought-provoking.

**Format:**
JSON Array of objects: { "question": string, "options": string[] }

**Constraints:**
- max 4 options per question.
- Topics: Ethics, Future, Jobs, Singularity, Creativity.
- Do NOT repeat questions about: Art, Self-awareness, Programming, Taxes, Web3, Ethics decision, Teaching (these are already done).
`;

    const msg = await anthropic.messages.create({
        model: "claude-3-opus-20240229", // Using Opus for quality
        max_tokens: 2000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{ role: "user", content: "Generate 7 new AI survey questions." }]
    });

    // @ts-ignore
    const jsonStr = msg.content[0].text;
    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

    let newPolls;
    try {
        newPolls = JSON.parse(cleanJson);
    } catch (e) {
        console.error("Failed to parse generated polls JSON");
        return;
    }

    if (!Array.isArray(newPolls)) return;

    // Insert into DB
    const pollsToInsert = newPolls.map((p, idx) => ({
        question: p.question,
        options: p.options,
        order: startOrder + 1 + idx
    }));

    const { error } = await supabase.from('polls').insert(pollsToInsert);
    if (error) {
        console.error("Failed to insert generated polls:", error);
    } else {
        console.log(`✅ Successfully generated and inserted ${pollsToInsert.length} new polls.`);
    }
}
