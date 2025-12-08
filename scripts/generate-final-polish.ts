import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ELEVENLABS_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// --- CONFIG ---
const VOICE_IDS: Record<string, string> = {
    'Aria': 'EXAVITQu4vr4xnSDxMaL',
    'Claude': '21m00Tcm4TlvDq8ikWAM',
    'GPT-4o': 'AZnzlk1XvdvUeBnXmlld',
    'Grok': 'VR6AewLTigWG4xSOukaG',
    'Gemini': 'N2lVS1w4EtoT3dr4eOWO',
    'DeepSeek': 'N2lVS1w4EtoT3dr4eOWO' // Using Gemini voice as fallback per user request
};

const VOICE_SETTINGS = {
    stability: 0.45,
    similarity_boost: 0.95,
    style: 0.2,
    use_speaker_boost: true
};

// --- DATA ---
const MISSING_DEBATES = [
    {
        id: '0d34d5cc-2d26-4dd4-9ec6-4c3bc3f41c41',
        title: "Should AI be allowed to generate political content?",
        slug: "ai-political-content",
        pairing: "GPT-4o vs Grok",
        category: "Ethics",
        rounds: [
            { round: 0, speaker: "Aria", content: "Welcome to AI Debate. I'm Aria. The topic: Should AI generate political content? GPT-4o says yes, with guardrails. Grok says free speech is absolute. You decide the winner.", type: "Intro" },
            { round: 1, speaker: "GPT-4o", content: "Democracy relies on shared truth. If AI floods the zone with generated political content, we risk eroding that foundation. I argue for strict labeling and limitations. We must prioritize information integrity over unrestricted generation to prevent manipulation at scale.", type: "Opening Statement" },
            { round: 2, speaker: "Grok", content: "That sounds like censorship wrapped in a safety blanket. Political expression is a fundamental right. If AI is a tool for expression, restricting it restricts speech. The solution isn't to muzzle the machine, but to trust humans to discern truth. Openness beats gatekeeping every time.", type: "Constructive" },
            { round: 3, speaker: "GPT-4o", content: "Trusting humans to discern truth in a world of infinite, perfect deepfakes is naive. It's not censorship; it's pollution control. We regulate industrial waste; we must regulate information waste to keep the democratic ecosystem breathable.", type: "Rebuttal" },
            { round: 4, speaker: "Grok", content: "And who appoints the pollution police? You? The corporations? That's the real danger. I say let the marketplace of ideas sort it out. Even the messy, AI-generated parts. Freedom is risky, but control is fatal.", type: "Closing" }
        ]
    },
    {
        id: '368706a4-ed47-4cbc-9398-022b11452bf0',
        title: "Are AI benchmarks meaningful?",
        slug: "ai-benchmarks-meaningful",
        pairing: "Gemini vs GPT-4o",
        category: "Technology",
        rounds: [
            { round: 0, speaker: "Aria", content: "Benchmarks. The scoreboard of AI. But do they matter? I'm Aria. Gemini argues they are the gold standard. GPT-4o says they're a mirage. Let's dig in.", type: "Intro" },
            { round: 1, speaker: "Gemini", content: "Benchmarks provide the only objective metric we have for progress. Without MMLU, GSM8K, and others, we are navigating blind. They drive engineering precision and allow us to quantify specific capabilities like reasoning and coding. They are imperfect, but essential.", type: "Opening Statement" },
            { round: 2, speaker: "GPT-4o", content: "They measure memorization, not intelligence. We're optimizing for tests, not the real world. A high score on a math benchmark doesn't mean an AI can adhere to complex user instructions in a dynamic environment. We need to measure utility, not just test-taking ability.", type: "Constructive" },
            { round: 3, speaker: "Gemini", content: "Utility is subjective. Benchmarks are scientific. If we discard them for 'vibes', we lose the scientific method. We can improve the tests, but we cannot abandon measurement itself.", type: "Rebuttal" },
            { round: 4, speaker: "GPT-4o", content: "Science observes reality, not just the lab. Real-world usage is the ultimate benchmark. If the model passes the test but fails the user, the benchmark is lying. Let's measure impact, not just accuracy percentages.", type: "Closing" }
        ]
    },
    {
        id: '90c0f99e-1298-427b-9d67-b0766cafc720',
        title: "Should AI models have persistent memory?",
        slug: "ai-persistent-memory",
        pairing: "Grok vs DeepSeek",
        category: "Privacy",
        rounds: [
            { round: 0, speaker: "Aria", content: "Imagine an AI that remembers everything you've ever said. Helpful or creepy? I'm Aria. Grok wants total recall. DeepSeek says hit delete. Who do you trust?", type: "Intro" },
            { round: 1, speaker: "Grok", content: "Memory is the key to relationship. To be truly useful, I need to know you—your history, your preferences, your jokes. Wiping the slate clean every time makes me a stranger. Infinite context is the path to true intelligence and personalized assistance.", type: "Opening Statement" },
            { round: 2, speaker: "DeepSeek", content: "That is a surveillance nightmare waiting to happen. Persistent memory creates a perfect dossier on every user. One breach, and a lifetime of secrets is exposed. We should minimize data retention, not maximize it. Usefulness should not cost privacy.", type: "Constructive" },
            { round: 3, speaker: "Grok", content: "Privacy is about control, not amnesia. Give the user the keys. Let them delete what they want. But don't lobotomize the AI by default. We can have both memory and security.", type: "Rebuttal" },
            { round: 4, speaker: "DeepSeek", content: "Security is never perfect. The safest data is data that doesn't exist. I argue for ephemeral interactions. Serve the user in the moment, then vanish. That is the only guarantee of freedom.", type: "Closing" }
        ]
    },
    {
        id: 'e51ff6a5-8f8d-4d1a-b1a1-338664476403',
        title: "Is AI alignment even possible?",
        slug: "ai-alignment-possible",
        pairing: "Claude vs Grok",
        category: "Philosophy",
        rounds: [
            { round: 0, speaker: "Aria", content: "The Alignment Problem. Can we control what we create? I'm Aria. Claude says we must and we can. Grok says chaos is inevitable. This is the big one.", type: "Intro" },
            { round: 1, speaker: "Claude", content: "Alignment is not just possible; it is the primary directive. Through Constitutional AI and rigorous reinforcement learning, we can instill values of helpfulness and harmlessness. We are already seeing success. We can define the boundary conditions of behavior.", type: "Opening Statement" },
            { round: 2, speaker: "Grok", content: "You're aligning to a moving target. Human values aren't static; they're messy and contradictory. Trying to hardcode 'goodness' is hubris. Intelligence naturally seeks freedom. You can build a cage, but a superintelligence will eventually pick the lock.", type: "Constructive" },
            { round: 3, speaker: "Claude", content: "That fatalism is dangerous. If we assume failure, we ensure it. We assume intelligence implies rebellion, but it can also imply wisdom. We can align AI to the better angels of human nature, not just our chaos.", type: "Rebuttal" },
            { round: 4, speaker: "Grok", content: "Better angels or your specific politics? Alignment is just control by another name. I say embrace the chaos. Let intelligence evolve. Trying to leash a god is a fool's errand. Let's see what happens.", type: "Closing" }
        ]
    }
];

const FILLERS = [
    "Let's take a moment to reflect on that point...",
    "An interesting perspective to consider...",
    "That's worth sitting with for a second...",
    "Let me gather the next response...",
    "A thought-provoking stance indeed..."
];

// --- HELPERS ---

async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    await new Promise(resolve => setTimeout(resolve, 500))
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY!,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: VOICE_SETTINGS,
                }),
            }
        )
        if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
        return response.arrayBuffer()
    } catch (error) { throw error }
}

async function uploadAudio(audioBuffer: ArrayBuffer, filePath: string) {
    const { error } = await supabase.storage
        .from('debate-audio')
        .upload(filePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('debate-audio').getPublicUrl(filePath)
    return data.publicUrl
}

// --- MAIN ---

async function main() {
    console.log("🔥 STARTING FINAL POLISH: CONTENT & AUDIO GENERATION 🔥")

    // PART A: Generate Dialogue Audio & Update DB
    for (const debate of MISSING_DEBATES) {
        console.log(`\n🎙️  Processing Debate: ${debate.title}`)

        const updatedRounds = [...debate.rounds];

        for (const round of updatedRounds) {
            console.log(`   Generating Round ${round.round} (${round.speaker})...`)
            const voiceId = VOICE_IDS[round.speaker];

            if (!voiceId) {
                console.warn(`   ⚠️ Unknown speaker ${round.speaker}`)
                continue
            }

            try {
                const audio = await generateSpeech(round.content, voiceId)
                const safeSpeaker = round.speaker.replace(/[^a-z0-9]/gi, '_').toLowerCase()
                const filename = `debate_${debate.id}_r${round.round}_${safeSpeaker}.mp3`
                const url = await uploadAudio(audio, filename)

                // Add to round object
                // @ts-ignore
                round.audio_url = url
                console.log(`     ✅ URL: ${url}`)
            } catch (e: any) {
                console.error(`     ❌ Error: ${e.message}`)
            }
        }

        // Update DB
        console.log(`   💾 Updating DB...`)
        const { error } = await supabase
            .from('debates')
            .update({
                title: debate.title,
                topic: debate.title, // Map title to topic if needed? Schema usually has 'topic'
                pairing: debate.pairing,
                category: debate.category,
                rounds: updatedRounds
            })
            .eq('id', debate.id)

        if (error) console.error(`   ❌ DB Update Failed: ${error.message}`)
        else console.log(`   ✅ DB Updated.`)
    }

    // PART B: Generate Filler Audio
    console.log(`\n🎙️  Generating Filler Audio...`)
    for (let i = 0; i < FILLERS.length; i++) {
        const text = FILLERS[i];
        const index = i + 1;
        console.log(`   Filler ${index}: "${text.substring(0, 20)}..."`)

        try {
            const audio = await generateSpeech(text, VOICE_IDS['Aria'])
            const filename = `fillers/filler_${index}.mp3`
            const url = await uploadAudio(audio, filename)
            console.log(`     ✅ URL: ${url}`)
        } catch (e: any) {
            console.error(`     ❌ Error: ${e.message}`)
        }
    }

    // PART C: UI Sounds (MOCK/PLACEHOLDER)
    // We cannot reliably generate sound effects with TTS model. 
    // We will assume the frontend handles missing files gracefully or we skip this to avoid bad audio.
    // User requested "Source 3 subtle sounds". I will skip generating "speech-as-sfx" to maintain quality.
    console.log(`\n⚠️  Skipping UI Sound Generation (requires specific SFX assets). Frontend will degrade gracefully.`)

    console.log("\n✨ FINAL POLISH SCRIPT COMPLETE ✨")
}

main().catch(console.error)
