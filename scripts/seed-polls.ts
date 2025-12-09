
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INITIAL_POLLS = [
    {
        question: "What's the best AI for Art?",
        options: ["Midjourney", "DALL-E 3", "Stable Diffusion", "Adobe Firefly"],
        order: 1
    },
    {
        question: "Will AI ever become self-aware?",
        options: ["Yes", "No", "It already is", "Only simulates it"],
        order: 2
    },
    {
        question: "What's the best AI for programming?",
        options: ["Claude 3.5 Sonnet", "GPT-4o", "DeepSeek Coder", "Github Copilot"],
        order: 3
    },
    {
        question: "When AI Agents start making money, should they have to pay taxes?",
        options: ["Yes", "No", "Their owners should", "Only if they want to collect it"],
        order: 4
    },
    {
        question: "What will be the impact of the convergence of AI and Web 3?",
        options: ["Little to no impact", "The automation of trust", "Agents can make income", "Greater than we can Imagine"],
        order: 5
    },
    {
        question: "Who should decide what ethical AI is?",
        options: ["Their creators", "AI itself", "Popular vote", "Government"],
        order: 6
    },
    {
        question: "Should AI be allowed to replace human teachers entirely?",
        options: ["Yes, for authorized subjects", "No, never", "Only as assistants", "Yes, it's better"],
        order: 7
    }
];

async function main() {
    console.log("🌱 Seeding Initial Polls...");

    // Can delete existing to ensure clean slate or upsert. Let's just upsert based on question match or just insert if empty.
    // For simplicity, let's check count first.

    // Actually, let's iterate and insert.
    for (const poll of INITIAL_POLLS) {
        const { data: existing } = await supabase
            .from('polls')
            .select('id')
            .eq('question', poll.question)
            .single();

        if (!existing) {
            const { error } = await supabase
                .from('polls')
                .insert([{
                    question: poll.question,
                    options: poll.options,
                    order: poll.order
                }]);

            if (error) console.error(`   ❌ Error inserting "${poll.question}":`, error.message);
            else console.log(`   ✅ Inserted: "${poll.question}"`);
        } else {
            console.log(`   ℹ️ Already exists: "${poll.question}"`);
        }
    }
    console.log("✨ Poll seeding complete.");
}

main();
