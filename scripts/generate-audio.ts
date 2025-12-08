import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { AI_VOICES, getVoiceForModel } from '../lib/voiceConfig'

dotenv.config({ path: '.env.local' })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ELEVENLABS_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ARIA Voice (Bella)
const ARIA_VOICE_ID = AI_VOICES.aria.voiceId

// --- ARIA SCRIPTS ---

const INTRO_SCRIPTS: Record<string, string> = {
    A: "Welcome to AI Debate — I'm Aria. Today's big question: {topic}. In one corner, {ai_a_name}, arguing {ai_a_position_short}. In the other, {ai_b_name}, who says {ai_b_position_short}. Six rounds. Two AIs. You decide who wins. Let's go.",
    B: "Hey, welcome to AI Debate. I'm Aria, your guide. Today we're asking: {topic}. You'll hear from {ai_a_name} and {ai_b_name} — two very different takes. Listen close, because at the end, you're the judge. {ai_a_name}, take it away.",
    C: "Some questions don't have easy answers. Today: {topic}. Two of the world's most capable AIs make their case. {ai_a_name} argues {ai_a_position_short}. {ai_b_name} disagrees. I'm Aria. Let's begin."
}

const PREVOTE_SCRIPTS: Record<string, string> = {
    A: "That's the debate. Two strong arguments — now it's your call. Who convinced you?",
    B: "Six rounds, two perspectives, one winner. The winner is whoever you choose. Cast your vote.",
    C: "Alright, they've made their case. Time for the only opinion that matters — yours. Who won?"
}

// Nested: Variant -> VoteOption -> Script
const POSTVOTE_TEMPLATES: Record<string, Record<string, string>> = {
    A: {
        ai_a: "You backed {ai_a_name}! {acknowledgment}. That's {repid} RepID. Let's keep this energy — another debate?",
        ai_b: "You backed {ai_b_name}! {acknowledgment}. That's {repid} RepID. Let's keep this energy — another debate?",
        tie: "A tie? {acknowledgment}. {repid} RepID earned. Tough call. Ready for the next one?"
    },
    B: {
        ai_a: "You went with {ai_a_name}. {acknowledgment}. {repid} RepID earned. Ready for another, or want to share this with someone who'd disagree?",
        ai_b: "You went with {ai_b_name}. {acknowledgment}. {repid} RepID earned. Ready for another, or want to share this with someone who'd disagree?",
        tie: "Couldn't pick a side? {acknowledgment}. {repid} RepID earned. Let's see if the next one is clearer."
    },
    C: {
        ai_a: "{ai_a_name} earned your vote. {acknowledgment}. {repid} RepID added. Continue your evaluation — next debate awaits.",
        ai_b: "{ai_b_name} earned your vote. {acknowledgment}. {repid} RepID added. Continue your evaluation — next debate awaits.",
        tie: "A deadlock. {acknowledgment}. {repid} RepID added. Continue your evaluation — next debate awaits."
    }
}

const TRANSITION_SCRIPTS: Record<string, string[]> = {
    round_1_options: ["{ai_b_name}, your response.", "Strong opener. Let's hear the other side.", "First argument on the table. {ai_b_name}?"],
    round_2_options: ["And the counter. Back to {ai_a_name}.", "Rebuttal time.", "Shots fired. {ai_a_name}, defend."],
    round_3_options: ["Cross-examination. This gets interesting.", "Now they go direct.", "Time to poke holes."],
    round_4_options: ["Tables turned.", "{ai_a_name} in the hot seat.", "Your turn to answer."],
    round_5_options: ["Last rebuttals.", "Final chance to land a point.", "Almost there. Bring it home."],
    round_6_options: ["Closing arguments.", "Final words. Make them count.", "Last chance to convince."]
}

// Helper to get positions for known topics
function getPositions(topic: string) {
    const t = topic.toLowerCase()
    if (t.includes('consciousness')) return { a: 'it is possible', b: 'it is just simulation' }
    if (t.includes('software engineers')) return { a: 'AI will replace them', b: 'humans will adapt' }
    if (t.includes('legal rights')) return { a: 'they deserve rights', b: 'they are tools' }
    return { a: 'the affirmative', b: 'the negative' } // Fallback
}

function getAcknowledgment(topic: string, vote: 'ai_a' | 'ai_b' | 'tie'): string {
    if (vote === 'tie') return "Both sides made strong points."

    // Generic context-aware fallback
    const pos = getPositions(topic)
    const positionText = vote === 'ai_a' ? pos.a : pos.b

    if (positionText.includes('replace')) return "The disruption argument resonated."
    if (positionText.includes('adapt') || positionText.includes('assist')) return "The collaboration angle made sense."
    if (positionText.includes('risk') || positionText.includes('danger')) return "Safety first makes sense."
    if (positionText.includes('possible') || positionText.includes('rights')) return "A forward-looking stance."

    return "That perspective landed for you."
}


async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit delay

    // Memoize/check existence? (Ideally yes, but simplified here)
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY!,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    use_speaker_boost: true
                },
            }),
        }
    )

    if (!response.ok) {
        if (response.status === 429) {
            console.warn('  ⚠️ Rate limited, waiting 5s...')
            await new Promise(resolve => setTimeout(resolve, 5000))
            return generateSpeech(text, voiceId)
        }
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }
    return response.arrayBuffer()
}

async function uploadAudio(audioBuffer: ArrayBuffer, filePath: string) {
    const { error } = await supabase.storage
        .from('debate-audio')
        .upload(filePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const { data } = supabase.storage.from('debate-audio').getPublicUrl(filePath)
    return data.publicUrl
}

async function processDebate(debate: any) {
    console.log(`\n🎙️  Processing: ${debate.topic.substring(0, 30)}...`)

    // 1. Standard Round Audio (Existing Logic)
    let roundsUpdated = false
    for (const round of debate.rounds) {
        // AI A
        if (round.ai_a_text && !round.ai_a_audio_url) {
            console.log(`    Round ${round.round} AI A (${debate.ai_a_name})...`)
            try {
                // Use new central config logic
                const voice = getVoiceForModel(debate.ai_a_name)
                const audio = await generateSpeech(round.ai_a_text, voice)
                const url = await uploadAudio(audio, `${debate.id}_${round.round}_a.mp3`)
                round.ai_a_audio_url = url
                roundsUpdated = true
            } catch (e: any) { console.error(`    ❌ Error: ${e.message}`) }
        }
        // AI B
        if (round.ai_b_text && !round.ai_b_audio_url) {
            console.log(`    Round ${round.round} AI B (${debate.ai_b_name})...`)
            try {
                const voice = getVoiceForModel(debate.ai_b_name)
                const audio = await generateSpeech(round.ai_b_text, voice)
                const url = await uploadAudio(audio, `${debate.id}_${round.round}_b.mp3`)
                round.ai_b_audio_url = url
                roundsUpdated = true
            } catch (e: any) { console.error(`    ❌ Error: ${e.message}`) }
        }
    }

    if (roundsUpdated) {
        await supabase.from('debates').update({ rounds: debate.rounds }).eq('id', debate.id)
        console.log('    💾 Updated rounds in DB')
    }

    // 2. ARIA VARIANTS
    const positions = getPositions(debate.topic)

    // Intros
    for (const v of ['A', 'B', 'C']) {
        const path = `${debate.id}_aria_intro_${v}.mp3`
        // Check if exists? (Skipping check for speed of writing, assuming we just overwrite or skip if optimizing)
        // Optimization: checking public URL existence is hard without HEAD request. We'll generate.
        // User warning: "Generate all".

        console.log(`    Aria Intro ${v}...`)
        const text = INTRO_SCRIPTS[v]
            .replace('{topic}', debate.topic)
            .replace('{ai_a_name}', debate.ai_a_name)
            .replace('{ai_b_name}', debate.ai_b_name)
            .replace('{ai_a_position_short}', positions.a)
            .replace('{ai_b_position_short}', positions.b)

        try {
            const audio = await generateSpeech(text, ARIA_VOICE_ID)
            await uploadAudio(audio, path)
        } catch (e: any) { console.error(`    ❌ Error Intro ${v}: ${e.message}`) }
    }

    // Prevotes
    for (const v of ['A', 'B', 'C']) {
        console.log(`    Aria Prevote ${v}...`)
        const text = PREVOTE_SCRIPTS[v]
        try {
            const audio = await generateSpeech(text, ARIA_VOICE_ID)
            await uploadAudio(audio, `${debate.id}_aria_prevote_${v}.mp3`)
        } catch (e: any) { console.error(`    ❌ Error Prevote ${v}: ${e.message}`) }
    }

    // Postvotes (9 files)
    const options: ('ai_a' | 'ai_b' | 'tie')[] = ['ai_a', 'ai_b', 'tie']
    for (const v of ['A', 'B', 'C']) {
        for (const opt of options) {
            // console.log(`    Aria Postvote ${v} - ${opt}...`) // too noisy?
            const template = POSTVOTE_TEMPLATES[v][opt]
            const ack = getAcknowledgment(debate.topic, opt)
            const text = template
                .replace('{ai_a_name}', debate.ai_a_name)
                .replace('{ai_b_name}', debate.ai_b_name)
                .replace('{acknowledgment}', ack)
                .replace('{repid}', '10')

            try {
                const audio = await generateSpeech(text, ARIA_VOICE_ID)
                await uploadAudio(audio, `${debate.id}_aria_postvote_${v}_${opt}.mp3`)
            } catch (e: any) { console.error(`    ❌ Error Postvote ${v}/${opt}: ${e.message}`) }
        }
    }

    // Transitions (6 files)
    for (let r = 1; r <= 6; r++) {
        const opts = TRANSITION_SCRIPTS[`round_${r}_options`]
        const text = opts[0] // Pick first one for consistency or random?
        // User asked: "Generate ONE random option per round"
        // Since this script runs ONCE per debate, picking a random one means that debate gets ONE specific transition audio.
        // That is fine. 
        const randomText = opts[Math.floor(Math.random() * opts.length)]
            .replace('{ai_a_name}', debate.ai_a_name)
            .replace('{ai_b_name}', debate.ai_b_name)

        console.log(`    Aria Transition Round ${r}...`)
        try {
            const audio = await generateSpeech(randomText, ARIA_VOICE_ID)
            await uploadAudio(audio, `${debate.id}_aria_transition_r${r}.mp3`)
        } catch (e: any) { console.error(`    ❌ Error Transition R${r}: ${e.message}`) }
    }
}

async function main() {
    console.log('🚀 Starting Aria Audio Generation...')
    const { data: debates } = await supabase.from('debates').select('*')
    if (!debates) return

    for (const debate of debates) {
        await processDebate(debate)
    }

    // Generate Welcome Message
    await generateAriaWelcome()

    console.log('\n✅ All Aria audio generation completed!')
}

async function generateAriaWelcome() {
    console.log('Generating Aria Welcome...')
    const script = "Welcome to AI Debate... where the world's smartest AIs go head to head, and YOU decide who wins."
    // ARIA_VOICE_ID is already defined globally from config


    const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio')
    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR, { recursive: true })
    }

    const filePath = path.join(AUDIO_DIR, 'aria-welcome.mp3')
    if (fs.existsSync(filePath)) {
        console.log('Skipping existing aria-welcome.mp3')
        return
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ARIA_VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY!,
                },
                body: JSON.stringify({
                    text: script,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.6,
                        similarity_boost: 0.8,
                        style: 0.3,
                        use_speaker_boost: true
                    },
                }),
            }
        )

        if (!response.ok) throw new Error(response.statusText)

        const buffer = Buffer.from(await response.arrayBuffer())
        fs.writeFileSync(filePath, buffer)

        console.log('✓ Created aria-welcome.mp3')
    } catch (error) {
        console.error('Error generating welcome:', error)
    }
}

main().catch(console.error)
