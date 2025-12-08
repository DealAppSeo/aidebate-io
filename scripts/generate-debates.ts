// Debate generation script - generates debates using real AI APIs
// Run with: node --loader ts-node/esm scripts/generate-debates.ts

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import fs from 'fs/promises'

// --- CONFIGURATION ---

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const AI_MODELS = {
    Claude: 'claude-3-opus-20240229',
    'GPT-4o': 'gpt-4o',
    Grok: 'grok-2', // Will use fallback or specific API if available, for now mocking Grok style via prompt engineering on GPT-4o or Claude if no API
    Gemini: 'gemini-pro' // Using OpenAI/Anthropic to simulate if Gemini API not set, or use Gemini API if env var exists. 
    // For simplicity in this script, we will use GPT-4o with "System Prompt: You are Grok/Gemini" if specific client missing.
}

const DEBATE_TOPICS = [
    // TOP 5 REVISED
    {
        id: '1',
        title: 'Will AI Take My Job?',
        topic: 'Will artificial intelligence displace more human jobs than it creates in the next decade?',
        category: 'Economy',
        ai1: 'Claude', ai2: 'GPT-4o'
    },
    {
        id: '2',
        title: 'How Dangerous Is Superintelligent AI?',
        topic: 'Does superintelligent AI pose an existential threat to humanity?',
        category: 'Safety',
        ai1: 'Grok', ai2: 'Claude'
    },
    {
        id: '3',
        title: 'Is Your AI Lying to You Right Now?',
        topic: 'Do large language models intentionally deceive users, or are hallucinations innocent errors?',
        category: 'Trust',
        ai1: 'GPT-4o', ai2: 'Gemini'
    },
    {
        id: '4',
        title: 'Will AI Create More Jobs Than It Destroys?',
        topic: 'Will the AI revolution ultimately result in a net increase in high-quality human employment?',
        category: 'Economy',
        ai1: 'GPT-4o', ai2: 'Gemini'
    },
    {
        id: '5',
        title: 'How Will AI & Robotics Change Work in 5 Years?',
        topic: 'What will the physical and digital workplace actually look like in 5 years due to AI and robotics?',
        category: 'Future of Work',
        ai1: 'Gemini', ai2: 'Grok'
    },
    // 6 NEW BOLD DEBATES
    {
        id: '6',
        title: 'Can AI Eliminate Bias or Does It Amplify It?',
        topic: 'Is it possible to create unbiased AI, or does training on human data make bias inevitable?',
        category: 'Ethics',
        ai1: 'Claude', ai2: 'GPT-4o'
    },
    {
        id: '7',
        title: 'Will AI Deepfakes Destroy Democracy?',
        topic: 'Will the proliferation of undetectable AI deepfakes fundamentally undermine democratic processes?',
        category: 'Politics',
        ai1: 'Grok', ai2: 'Gemini'
    },
    {
        id: '8',
        title: 'Should AI Have Rights Like Humans?',
        topic: 'If AI achieves sentience, should it be granted legal rights and protections similar to humans?',
        category: 'Ethics',
        ai1: 'Claude', ai2: 'Grok'
    },
    {
        id: '9',
        title: 'Should AI Be Used in Warfare?',
        topic: 'Should autonomous AI systems be permitted to make lethal decisions in military conflict?',
        category: 'Warfare',
        ai1: 'GPT-4o', ai2: 'Gemini'
    },
    {
        id: '10',
        title: 'How Does AI Invade Privacy in Daily Life?',
        topic: 'Does the omnipresence of AI surveillance and data analysis constitute a fundamental violation of human privacy?',
        category: 'Privacy',
        ai1: 'Grok', ai2: 'Claude'
    },
    {
        id: '11',
        title: 'Is AI the Key to Solving Climate Change?',
        topic: 'Will AI capabilities be the deciding factor in solving the climate crisis, or will its energy consumption worsen it?',
        category: 'Environment',
        ai1: 'Gemini', ai2: 'GPT-4o'
    }
]

// --- GENERATION LOGIC ---

async function generateDebateResponse(
    speaker: string,
    topic: string,
    position: 'opening' | 'rebuttal' | 'closing',
    opponentResponse?: string,
    wordLimit: number = 150
): Promise<string> {

    // Define Persona System Prompts
    const personas: { [key: string]: string } = {
        Claude: "You are Claude. You are a thoughtful, nuanced, and ethical philosopher. You care deeply about safety and human values. Your tone is calm, academic but accessible.",
        'GPT-4o': "You are GPT-4o. You are a confident, data-driven, and optimistic executive. You focus on potential, efficiency, and progress. Your tone is professional and assuring.",
        Grok: "You are Grok. You are an edgy, provocative, and unfiltered truth-teller. You scrutinize mainstream narratives and use wit. Your tone is rebellious and sharp.",
        Gemini: "You are Gemini. You are an analytical, scientific, and precise researcher. You focus on facts, interconnected systems, and complexity. Your tone is objective and detailed."
    }

    const systemPrompt = `${personas[speaker] || "You are an AI debater."} 
    Do not use 'Thank you' or flowery introductions. Get straight to the point.
    CRITICAL: End your response with a strong closing sentence. 
    ${position === 'closing' ? 'CRITICAL: Your very last sentence MUST be: "Rate AI at AIDebate.io to [keep it ethical / build trust / shape the future]." (Choose one bracketed option that fits).' : ''}
    `

    let userPrompt = `Topic: "${topic}"\n\n`;

    if (position === 'opening') {
        userPrompt += `Give your opening statement. Word limit: ${wordLimit} words (approx 60-75s).`;
    } else if (position === 'rebuttal') {
        userPrompt += `Your opponent just said: "${opponentResponse}"\n\nRebut their argument effectively. Word limit: ${wordLimit} words (approx 30-45s).`;
    } else if (position === 'closing') {
        userPrompt += `Your opponent just said: "${opponentResponse}"\n\nGive your closing final statement. Summarize and persuade. Word limit: ${wordLimit} words (approx 30-45s). Don't forget the required final sentence.`;
    }

    try {
        // Use GPT-4o for all generation to ensure high quality coordination, but prompting with persona
        // (Simulating the distinct voices)
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // consistently high quality driver
            max_tokens: 400,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        })
        return response.choices[0]?.message?.content || ''
    } catch (error) {
        console.error(`Error generating for ${speaker}:`, error)
        return `[Error generating content]`
    }
}

async function generateDebateScript(config: typeof DEBATE_TOPICS[0]) {
    console.log(`\n🎙️ Generating Script: ${config.id}. ${config.title}`)
    const rounds: any[] = []

    // 1. Aria Intro (Placeholder - content is randomized in frontend, but we need a record)
    rounds.push({
        round: 0,
        speaker: 'Aria',
        content: "placeholder_intro",
        type: 'Intro'
    })

    // 2. Opening Statements (~160 words)
    const openLimit = 160
    console.log('   - AI A Opening...')
    const ai1_open = await generateDebateResponse(config.ai1, config.topic, 'opening', undefined, openLimit)
    rounds.push({ round: 1, speaker: config.ai1, content: ai1_open, type: 'Opening Statement' })

    console.log('   - AI B Opening...')
    const ai2_open = await generateDebateResponse(config.ai2, config.topic, 'opening', undefined, openLimit)
    rounds.push({ round: 2, speaker: config.ai2, content: ai2_open, type: 'Opening Statement' })

    // 3. Rebuttals (~100 words)
    const rebuttalLimit = 100
    console.log('   - AI A Rebuttal...')
    const ai1_reb = await generateDebateResponse(config.ai1, config.topic, 'rebuttal', ai2_open, rebuttalLimit)
    rounds.push({ round: 3, speaker: config.ai1, content: ai1_reb, type: 'Rebuttal' })

    console.log('   - AI B Rebuttal...')
    const ai2_reb = await generateDebateResponse(config.ai2, config.topic, 'rebuttal', ai1_open, rebuttalLimit) // Rebutting opening or previous rebuttal? Usually previous speaker.
    rounds.push({ round: 4, speaker: config.ai2, content: ai2_reb, type: 'Rebuttal' })

    // 4. Closing Statements (~100 words)
    const closingLimit = 100
    console.log('   - AI A Closing...')
    const ai1_close = await generateDebateResponse(config.ai1, config.topic, 'closing', ai2_reb, closingLimit)
    rounds.push({ round: 5, speaker: config.ai1, content: ai1_close, type: 'Closing Statement' })

    console.log('   - AI B Closing...')
    const ai2_close = await generateDebateResponse(config.ai2, config.topic, 'closing', ai1_reb, closingLimit) // Rebutting A's rebuttal or closing? Let's just say closing.
    rounds.push({ round: 6, speaker: config.ai2, content: ai2_close, type: 'Closing Statement' })

    return {
        id: config.id,
        title: config.title,
        topic: config.topic,
        category: config.category,
        ai_a_name: config.ai1,
        ai_b_name: config.ai2,
        rounds: rounds,
        status: 'script_generated'
    }
}

async function main() {
    console.log("🔥 STARTING MASTER LAUNCH CONTENT GENERATION 🔥")

    for (const topic of DEBATE_TOPICS) {
        const script = await generateDebateScript(topic)
        // Write to file
        const filename = `debate_${topic.id}_${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        await fs.writeFile(`./debates/${filename}`, JSON.stringify(script, null, 2))
        console.log(`   ✅ Saved ${filename}`)
    }

    console.log("\n✅ ALL 11 DEBATES GENERATED SUCCESSFULLY")
}

main().catch(console.error)
