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

// --- CONFIGURATION ---

const VOICE_IDS: Record<string, string> = {
    'Aria': 'EXAVITQu4vr4xnSDxMaL',
    'Claude': '21m00Tcm4TlvDq8ikWAM',
    'GPT-4o': 'AZnzlk1XvdvUeBnXmlld',
    'Grok': 'VR6AewLTigWG4xSOukaG',
    'Gemini': 'N2lVS1w4EtoT3dr4eOWO'
};

const VOICE_SETTINGS = {
    stability: 0.45,
    similarity_boost: 0.95,
    style: 0.2,
    use_speaker_boost: true
};

async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    // Basic rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
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
                    model_id: 'eleven_multilingual_v2', // or v1, v2 is standard now
                    voice_settings: VOICE_SETTINGS,
                }),
            }
        )

        if (!response.ok) {
            if (response.status === 429) {
                console.warn('  ⚠️ Rate limited, waiting 5s...')
                await new Promise(resolve => setTimeout(resolve, 5000))
                return generateSpeech(text, voiceId)
            }
            throw new Error(`ElevenLabs API error: ${response.statusText} (${response.status})`)
        }
        return response.arrayBuffer()
    } catch (error) {
        throw error
    }
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
    console.log(`\n🎙️  Processing Debate ${debate.id}: ${debate.title}...`)

    let roundsUpdated = false
    const newRounds = [...debate.rounds]; // clone

    for (let i = 0; i < newRounds.length; i++) {
        const round = newRounds[i];

        if (!round.content) {
            console.warn(`    Skipping round ${round.round} (no content)`);
            continue;
        }

        const voiceId = VOICE_IDS[round.speaker];
        if (!voiceId) {
            console.warn(`    ⚠️ Unknown speaker: ${round.speaker}, skipping audio.`);
            continue;
        }

        console.log(`    Generating Round ${round.round} (${round.speaker})...`)

        try {
            const audioBuffer = await generateSpeech(round.content, voiceId);

            // Filename: debateID_roundIndex_speaker.mp3
            // Sanitize speaker name
            const safeSpeaker = round.speaker.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const filename = `debate_${debate.id}_r${round.round}_${safeSpeaker}.mp3`;

            const url = await uploadAudio(audioBuffer, filename);

            round.audio_url = url;
            roundsUpdated = true;
            console.log(`      ✅ URL: ${url}`);

        } catch (e: any) {
            console.error(`      ❌ Error: ${e.message}`);
        }
    }

    if (roundsUpdated) {
        const { error } = await supabase
            .from('debates')
            .update({ rounds: newRounds })
            .eq('id', debate.id);

        if (error) console.error(`    ❌ DB Update Error: ${error.message}`);
        else console.log('    💾 Updated rounds in DB with audio URLs');
    }
}

async function main() {
    console.log('🚀 Starting Debate Audio Generation (Overhaul)...')

    const { data: debates, error } = await supabase.from('debates').select('*').order('id', { ascending: true });

    if (error) {
        console.error("Failed to fetch debates", error);
        return;
    }
    console.log(`Debug: Fetched ${debates?.length} debates from DB.`);

    // PROCESS ALL DEBATES
    console.log("DEBUG: REALLY PROCESSING ALL DEBATES NOW");
    const filteredDebates = debates;

    console.log(`Found ${filteredDebates.length} debates to process.`);

    for (const debate of filteredDebates) {
        await processDebate(debate);
    }

    console.log('\n✅ All audio generation completed!')
}

main().catch(console.error)
