
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import { Anthropic } from '@anthropic-ai/sdk';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_API_KEY) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const PROVOCATIVE_TOPICS = [
    "Will AI replace doctors entirely by 2035?",
    "Is it cheating to use AI for all school assignments?",
    "Who owns AI art: the prompter or the machine?",
    "Should we pause all AI development for 6 months immediately?",
    "Will AI companions destroy human relationships?",
    "Is ChatGPT becoming 'woke' and biased against conservatives?",
    "Should AI be allowed to trade stocks autonomously without human oversight?",
    "Will AI make Universal Basic Income (UBI) inevitable and necessary?",
    "Is the idea of 'Superintelligence' valid science or just sci-fi hype?",
    "Should politicians be banned from using AI to write speeches?",
    "Can AI ever truly be 'conscious' or is it just math?",
    "Is your personal data safe with OpenAI and Google?",
    "Will AI solve cancer before it creates a bioweapon?",
    "Should children under 12 be banned from using AI tutors?"
];

const AI_PERSONAS: Record<string, string> = {
    Claude: "You are Claude, a thoughtful, careful, and ethically-focused AI. You often reference safety, alignment, and long-term consequences. You are measured and philosophical.",
    "GPT-4o": "You are GPT-4o, a pragmatic, optimistic, and capability-focused AI. You emphasize utility, progress, and finding balanced solutions. You are articulate and confident.",
    Grok: "You are Grok, a rebellious, witty, and 'edgy' AI. You prioritize maximum curiosity and truth-seeking. You are anti-censorship and provocative.",
    Gemini: "You are Gemini, a scientific, data-driven, and slightly formal AI. You emphasize research, evidence, and multimodal capabilities. You are objective and precise."
};

const PAIRINGS = [
    { ai1: "Claude", ai2: "GPT-4o" },
    { ai1: "Grok", ai2: "Claude" },
    { ai1: "GPT-4o", ai2: "Gemini" },
    { ai1: "Gemini", ai2: "Grok" }
];

async function generateDebateScript(topic: string, ai1Name: string, ai2Name: string) {
    console.log(`\n🧠 Generating script for: "${topic}" (${ai1Name} vs ${ai2Name})`);

    const systemPrompt = `
You are a debate scriptwriter for "AIDebate.io".
Topic: "${topic}"

**Constraints:**
1.  **NO COMMERCIALS**.
2.  **DURATION**: Substantial debate (approx 2 mins total).
3.  **FORMAT**: JSON with keys: \`aria\`, \`opening1\`, \`constructive2\`, \`rebuttal1\`, \`closing2\`.
4.  **VOICES**:
    *   ${ai1Name}: ${AI_PERSONAS[ai1Name]}
    *   ${ai2Name}: ${AI_PERSONAS[ai2Name]}
    *   Aria: NPR-style host.

**Output:** valid JSON only.
`;
    // Retry logic in case of JSON parse error
    for (let i = 0; i < 3; i++) {
        try {
            const msg = await anthropic.messages.create({
                model: "claude-3-opus-20240229",
                max_tokens: 2500,
                temperature: 0.8,
                system: systemPrompt,
                messages: [{ role: "user", content: "Generate provided debate." }]
            });

            // @ts-ignore
            const jsonStr = msg.content[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.warn("  ⚠️ JSON Parse/API error, retrying...", e);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return null;
}

async function main() {
    console.log("🔥 STARTING DAILY DEBATE QUEUE GENERATION 🔥");

    // 1. Check if 'scheduled_for' column exists; if not, print warning (manual migration needed usually, but we can try to use RPC or just assume it exists after we run SQL).
    // Actually, let's just create the JSON files first, then we'll seed.

    const Queue = [];
    const today = new Date();

    for (let i = 0; i < PROVOCATIVE_TOPICS.length; i++) {
        const topic = PROVOCATIVE_TOPICS[i];
        const pair = PAIRINGS[i % PAIRINGS.length];

        // Schedule for today + i days
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + i);
        const dateStr = scheduleDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const script = await generateDebateScript(topic, pair.ai1, pair.ai2);

        if (!script) {
            console.error(`Failed to generate script for ${topic}`);
            continue;
        }

        const rounds = [
            { round: 0, speaker: 'Aria', content: script.aria, type: 'Intro' },
            { round: 1, speaker: pair.ai1, content: script.opening1, type: 'Opening Statement' },
            { round: 2, speaker: pair.ai2, content: script.constructive2, type: 'Constructive Argument' },
            { round: 3, speaker: pair.ai1, content: script.rebuttal1, type: 'Rebuttal' },
            { round: 4, speaker: pair.ai2, content: script.closing2, type: 'Closing Statement' }
        ];

        const slug = topic.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const debateObj = {
            title: topic,
            topic: topic,
            slug: slug,
            category: "Daily Debate",
            pairing: `${pair.ai1} vs ${pair.ai2}`,
            ai_a_name: pair.ai1,
            ai_b_name: pair.ai2,
            rounds: rounds,
            status: 'queued',
            scheduled_for: dateStr
        };

        const filename = `daily_${dateStr}_${slug}.json`;
        await fs.writeFile(`./debates/${filename}`, JSON.stringify(debateObj, null, 2));
        console.log(`   ✅ Saved ${filename} (Scheduled: ${dateStr})`);

        Queue.push(debateObj);
    }

    console.log("\n✅ Generated 14 Daily Debates.");
}

main().catch(console.error);
