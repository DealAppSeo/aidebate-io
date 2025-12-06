// Debate generation script - generates debates using real AI APIs
// Run with: node --loader ts-node/esm scripts/generate-debates.ts

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface DebateRound {
    round_number: number
    speaker: 'ai1' | 'ai2' | 'facilitator'
    content: string
    word_count: number
    audio_url?: string
}

const DEBATE_TOPICS = [
    {
        title: 'Is AI consciousness possible?',
        topic: 'Can artificial intelligence systems achieve genuine consciousness, or are they merely sophisticated pattern matchers?',
        category: 'Philosophy',
        ai1: { name: 'Claude', model: 'claude-3-opus-20240229' },
        ai2: { name: 'GPT-4o', model: 'gpt-4o' },
    },
    {
        title: 'Will AI replace software engineers by 2030?',
        topic: 'Will AI coding assistants and autonomous programming systems make human software engineers obsolete within the next 5 years?',
        category: 'Technology',
        ai1: { name: 'Claude', model: 'claude-3-opus-20240229' },
        ai2: { name: 'GPT-4o', model: 'gpt-4o' },
    },
    {
        title: 'Should AI systems have legal rights?',
        topic: 'As AI becomes more sophisticated, should we grant legal personhood and rights to AI systems?',
        category: 'Ethics',
        ai1: { name: 'Grok', model: 'grok-2' },
        ai2: { name: 'Gemini', model: 'gemini-pro' },
    },
]

async function generateDebateResponse(
    aiName: string,
    model: string,
    topic: string,
    position: 'for' | 'against' | 'rebuttal' | 'closing',
    opponentResponse?: string,
    wordLimit: number = 70
): Promise<string> {
    const prompts = {
        for: `You are ${aiName} in a debate. Topic: "${topic}". 
    
Argue FOR this position in ${wordLimit} words or less. Be direct, logical, and compelling. No preamble.`,

        against: `You are ${aiName} in a debate. Topic: "${topic}". 
    
Argue AGAINST this position in ${wordLimit} words or less. Be direct, logical, and compelling. No preamble.`,

        rebuttal: `You are ${aiName} in a debate. Topic: "${topic}".

Your opponent said: "${opponentResponse}"

Rebut their argument in ${wordLimit} words or less. Be sharp and focused. No preamble.`,

        closing: `You are ${aiName} in a debate. Topic: "${topic}".

Your opponent said: "${opponentResponse}"

Give your closing statement in ${wordLimit} words or less. Summarize why your position wins. No preamble.`,
    }

    const prompt = prompts[position]

    try {
        if (model.includes('claude')) {
            const response = await anthropic.messages.create({
                model,
                max_tokens: 200,
                messages: [{ role: 'user', content: prompt }],
            })
            return response.content[0].type === 'text' ? response.content[0].text : ''
        } else if (model.includes('gpt')) {
            const response = await openai.chat.completions.create({
                model,
                max_tokens: 200,
                messages: [{ role: 'user', content: prompt }],
            })
            return response.choices[0]?.message?.content || ''
        }
    } catch (error) {
        console.error(`Error generating response for ${aiName}:`, error)
        return `[Error generating response for ${aiName}]`
    }

    return ''
}

async function generateDebate(debateConfig: typeof DEBATE_TOPICS[0]) {
    console.log(`\n🎭 Generating debate: ${debateConfig.title}`)

    const rounds: DebateRound[] = []

    // Facilitator intro
    const intro = `Welcome to AI Debate. Today's question: ${debateConfig.topic}. In the blue corner, ${debateConfig.ai1.name}. In the red corner, ${debateConfig.ai2.name}. Let the debate begin.`

    // Round 1: AI1 opening (FOR)
    console.log('  Round 1: AI1 opening...')
    const ai1_opening = await generateDebateResponse(
        debateConfig.ai1.name,
        debateConfig.ai1.model,
        debateConfig.topic,
        'for',
        undefined,
        70
    )
    rounds.push({
        round_number: 1,
        speaker: 'ai1',
        content: ai1_opening,
        word_count: ai1_opening.split(' ').length,
    })

    // Round 2: AI2 counter (AGAINST)
    console.log('  Round 2: AI2 counter...')
    const ai2_counter = await generateDebateResponse(
        debateConfig.ai2.name,
        debateConfig.ai2.model,
        debateConfig.topic,
        'against',
        undefined,
        70
    )
    rounds.push({
        round_number: 2,
        speaker: 'ai2',
        content: ai2_counter,
        word_count: ai2_counter.split(' ').length,
    })

    // Round 3: AI1 rebuttal
    console.log('  Round 3: AI1 rebuttal...')
    const ai1_rebuttal = await generateDebateResponse(
        debateConfig.ai1.name,
        debateConfig.ai1.model,
        debateConfig.topic,
        'rebuttal',
        ai2_counter,
        60
    )
    rounds.push({
        round_number: 3,
        speaker: 'ai1',
        content: ai1_rebuttal,
        word_count: ai1_rebuttal.split(' ').length,
    })

    // Round 4: AI2 rebuttal
    console.log('  Round 4: AI2 rebuttal...')
    const ai2_rebuttal = await generateDebateResponse(
        debateConfig.ai2.name,
        debateConfig.ai2.model,
        debateConfig.topic,
        'rebuttal',
        ai1_opening,
        60
    )
    rounds.push({
        round_number: 4,
        speaker: 'ai2',
        content: ai2_rebuttal,
        word_count: ai2_rebuttal.split(' ').length,
    })

    // Round 5: AI1 closing
    console.log('  Round 5: AI1 closing...')
    const ai1_closing = await generateDebateResponse(
        debateConfig.ai1.name,
        debateConfig.ai1.model,
        debateConfig.topic,
        'closing',
        ai2_rebuttal,
        50
    )
    rounds.push({
        round_number: 5,
        speaker: 'ai1',
        content: ai1_closing,
        word_count: ai1_closing.split(' ').length,
    })

    // Round 6: AI2 closing
    console.log('  Round 6: AI2 closing...')
    const ai2_closing = await generateDebateResponse(
        debateConfig.ai2.name,
        debateConfig.ai2.model,
        debateConfig.topic,
        'closing',
        ai1_rebuttal,
        50
    )
    rounds.push({
        round_number: 6,
        speaker: 'ai2',
        content: ai2_closing,
        word_count: ai2_closing.split(' ').length,
    })

    const outro = `That's the debate. Now it's your turn. Cast your verdict.`

    // Estimate duration (150 words per minute average speaking)
    const totalWords = rounds.reduce((sum, r) => sum + r.word_count, 0)
    const totalDuration = Math.round((totalWords / 150) * 60) + 30 // +30s for intro/outro

    const debate = {
        title: debateConfig.title,
        topic: debateConfig.topic,
        category: debateConfig.category,
        ai1_name: debateConfig.ai1.name,
        ai1_model: debateConfig.ai1.model,
        ai2_name: debateConfig.ai2.name,
        ai2_model: debateConfig.ai2.model,
        rounds,
        facilitator_intro: intro,
        facilitator_outro: outro,
        total_duration_seconds: totalDuration,
        vote_count_ai1: 0,
        vote_count_ai2: 0,
        vote_count_tie: 0,
        featured: false,
        status: 'active',
    }

    console.log(`  ✅ Generated ${rounds.length} rounds, ~${totalDuration}s duration`)
    return debate
}

async function main() {
    console.log('🚀 Starting debate generation...\n')

    const debates = []

    for (const config of DEBATE_TOPICS.slice(0, 3)) {
        const debate = await generateDebate(config)
        debates.push(debate)

        // Save to JSON file
        const fs = await import('fs/promises')
        await fs.writeFile(
            `./debates/${debate.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`,
            JSON.stringify(debate, null, 2)
        )
    }

    console.log(`\n✅ Generated ${debates.length} debates!`)
    console.log('\nNext steps:')
    console.log('1. Generate TTS audio with ElevenLabs')
    console.log('2. Upload audio to Supabase Storage')
    console.log('3. Seed debates to Supabase database')
}

main().catch(console.error)
