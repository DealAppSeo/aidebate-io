
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We will fetch debates dynamically in main()

{
    id: '2',
        title: "How Dangerous Is Superintelligent AI Really?",
            slug: "how-dangerous-is-superintelligent-ai",
                pairing: "Grok vs Claude",
                    category: "Safety",
                        ai1: "Grok",
                            ai2: "Claude"
},
{
    id: '3',
        title: "Is Your AI Lying to You Right Now?",
            slug: "is-your-ai-lying",
                pairing: "GPT-4o vs Gemini",
                    category: "Trust",
                        ai1: "GPT-4o",
                            ai2: "Gemini"
},
{
    id: '4',
        title: "Will AI Create More Jobs Than It Destroys?",
            slug: "will-ai-create-more-jobs",
                pairing: "GPT-4o vs Gemini",
                    category: "Economy",
                        ai1: "GPT-4o",
                            ai2: "Gemini"
},
{
    id: '5',
        title: "How Will AI & Robotics Change Work in 5 Years?",
            slug: "ai-robotics-work-5-years",
                pairing: "Gemini vs Grok",
                    category: "Future of Work",
                        ai1: "Gemini",
                            ai2: "Grok"
},
{
    id: '6',
        title: "Can AI Eliminate Bias or Does It Amplify It?",
            slug: "ai-bias-eliminate-or-amplify",
                pairing: "Claude vs GPT-4o",
                    category: "Ethics",
                        ai1: "Claude",
                            ai2: "GPT-4o"
},
{
    id: '7',
        title: "Will AI Deepfakes Destroy Democracy?",
            slug: "ai-deepfakes-destroy-democracy",
                pairing: "Grok vs Gemini",
                    category: "Politics",
                        ai1: "Grok",
                            ai2: "Gemini"
},
{
    id: '8',
        title: "Should AI Have Rights Like Humans?",
            slug: "ai-have-rights",
                pairing: "Claude vs Grok",
                    category: "Ethics",
                        ai1: "Claude",
                            ai2: "Grok"
},
{
    id: '9',
        title: "Should AI Be Used in Warfare?",
            slug: "ai-used-in-warfare",
                pairing: "GPT-4o vs Gemini",
                    category: "Warfare",
                        ai1: "GPT-4o",
                            ai2: "Gemini"
},
{
    id: '10',
        title: "How Does AI Invade Privacy in Daily Life?",
            slug: "ai-invade-privacy",
                pairing: "Grok vs Claude",
                    category: "Privacy",
                        ai1: "Grok",
                            ai2: "Claude"
},
{
    id: '11',
        title: "Is AI the Key to Solving Climate Change or Worsening It?",
            slug: "ai-climate-solve-or-worsen",
                pairing: "Gemini vs GPT-4o",
                    category: "Environment",
                        ai1: "Gemini",
                            ai2: "GPT-4o"
}
];

const AI_PERSONAS: Record<string, string> = {
    Claude: "You are Claude, a thoughtful, careful, and ethically-focused AI. You often reference safety, alignment, and long-term consequences. You are measured and philosophical.",
    "GPT-4o": "You are GPT-4o, a pragmatic, optimistic, and capability-focused AI. You emphasize utility, progress, and finding balanced solutions. You are articulate and confident.",
    Grok: "You are Grok, a rebellious, witty, and 'edgy' AI. You prioritize maximum curiosity and truth-seeking. You are anti-censorship and provocative.",
    Gemini: "You are Gemini, a scientific, data-driven, and slightly formal AI. You emphasize research, evidence, and multimodal capabilities. You are objective and precise.",
    DeepSeek: "You are DeepSeek, a technical, precise, and privacy-conscious AI. You focus on open-source principles and efficiency."
};

async function generateDebateScript(debate: any) {
    console.log(`\n🧠 Generating script for: "${debate.title}" (${debate.ai1} vs ${debate.ai2})`);


    const systemPrompt = `
You are a master debate scriptwriter for "AIDebate.io".
Your task is to generate a stimulating, profound, and fiery debate script between two AI personas.

**Constraints & Rules:**
1.  **NO COMMERCIALS**: Do NOT include any intro music cues, "sponsored by", "brought to you by", or references to "AiDebate.io" within the speech text itself.
2.  **DURATION**: The debate must be SUBSTANTIAL.
    - Opening: ~150 words
    - Rebuttal: ~150 words
    - Cross-Exam: ~100 words (Direct questioning)
    - Closing: ~150 words
    - Total per AI: ~700 words.
3.  **QUALITY**: Use varied opinions, constructive arguments, direct rebuttals, and strong closing statements. Avoid generic "I agree" statements. They should challenge each other.
4.  **FORMAT**: Return JSON ONLY with the following keys:
    *   \`aria\`: calculated intro by host Aria (mentioning AIDebate.io is OK HERE ONLY)
    *   \`round1_opening_ai1\`: Opening statement by ${debate.ai1}
    *   \`round2_rebuttal_ai2\`: Direct rebuttal by ${debate.ai2}
    *   \`round3_cross_ai1\`: Cross-examination question/challenge by ${debate.ai1} to ${debate.ai2}
    *   \`round4_cross_ai2\`: Cross-examination question/challenge by ${debate.ai2} to ${debate.ai1}
    *   \`round5_rebuttal_ai1\`: Second rebuttal by ${debate.ai1} responding to challenges
    *   \`round6_closing_ai2\`: Closing argument by ${debate.ai2}
    *   \`aria_outro\`: Short outro by Aria
5.  **VOICES**:
    *   ${debate.ai1}: ${AI_PERSONAS[debate.ai1] || "A debate participant."}
    *   ${debate.ai2}: ${AI_PERSONAS[debate.ai2] || "A debate participant."}
    *   Aria: NPR-style host, neutral but engaging.

**Output Format:**
A single valid JSON object. Do not wrap in markdown code blocks.
`;

    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2000,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                { role: "user", content: `Generate the debate script for the topic: "${debate.title}"` }
            ]
        });

        // @ts-ignore
        const jsonStr = msg.content[0].text;
        // Clean markdown if present
        const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        const script = JSON.parse(cleanJson);

        return script;
    } catch (error) {
        console.error("Error generating script:", error);
        return null; // Handle error gracefully
    }
}

async function main() {
    console.log("🚀 Starting Dynamic Debate Regeneration...");

    // Fetch debates from DB
    const { data: debates, error } = await supabase
        .from('debates')
        .select('*')
        .order('id', { ascending: true });

    if (error || !debates) {
        console.error("Failed to fetch debates:", error);
        return;
    }

    console.log(`Found ${debates.length} debates in database.`);

    for (const debateDetails of debates) {
        // Map DB fields to script expectations if needed
        // DB has: ai_a_name, ai_b_name. Script expects ai1, ai2.
        const mappedDebate = {
            ...debateDetails,
            ai1: debateDetails.ai_a_name,
            ai2: debateDetails.ai_b_name
        };

        const script = await generateDebateScript(mappedDebate);
        if (!script) continue;

        const rounds = [];

        // 1. Aria Intro
        if (script.aria) {
            rounds.push({ round: 0, speaker: 'Aria', content: script.aria, type: 'Intro' });
        }

        // Round 1: Opening (AI 1)
        rounds.push({
            round: 1,
            speaker: debateDetails.ai1,
            content: script.round1_opening_ai1,
            type: 'Opening Statement'
        });

        // Round 2: Direct Rebuttal (AI 2)
        rounds.push({
            round: 2,
            speaker: debateDetails.ai2,
            content: script.round2_rebuttal_ai2,
            type: 'Direct Rebuttal'
        });

        // Round 3: Cross-Exam (AI 1)
        rounds.push({
            round: 3,
            speaker: debateDetails.ai1,
            content: script.round3_cross_ai1,
            type: 'Cross-Examination'
        });

        // Round 4: Cross-Exam (AI 2)
        rounds.push({
            round: 4,
            speaker: debateDetails.ai2,
            content: script.round4_cross_ai2,
            type: 'Cross-Examination'
        });

        // Round 5: Second Rebuttal (AI 1)
        rounds.push({
            round: 5,
            speaker: debateDetails.ai1,
            content: script.round5_rebuttal_ai1,
            type: 'Second Rebuttal'
        });

        // Round 6: Closing (AI 2)
        rounds.push({
            round: 6,
            speaker: debateDetails.ai2,
            content: script.round6_closing_ai2,
            type: 'Closing Statement'
        });

        // Aria Outro (Optional in prompt, but good to have)
        if (script.aria_outro) {
            rounds.push({ round: 7, speaker: 'Aria', content: script.aria_outro, type: 'Outro' });
        }

        const debateObj = {
            id: debateDetails.id,
            title: debateDetails.title,
            slug: debateDetails.slug,
            topic: debateDetails.title,
            category: debateDetails.category,
            ai_a_name: debateDetails.ai1,
            ai_b_name: debateDetails.ai2,
            rounds: rounds,
            pairing: debateDetails.pairing,
            status: 'regenerated_v2'
        };

        const filename = `debate_${debateDetails.id}_${debateDetails.slug.replace(/-/g, '_')}.json`;
        await fs.writeFile(`./debates/${filename}`, JSON.stringify(debateObj, null, 2));
        console.log(`   ✅ Saved ${filename}`);
    }

    console.log("\n✅ All debates regenerated. Now run 'npm run seed-debates' and 'npm run generate-audio'.");
}

main().catch(console.error);
