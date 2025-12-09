import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

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
const NEW_CLAUDE_VOICE_ID = 'Cwh3Epv47UyEOtLVzCnb'; // Roger (Confident Male)
const ARIA_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const VOICE_SETTINGS = {
    stability: 0.45,
    similarity_boost: 0.95,
    style: 0.2,
    use_speaker_boost: true
};

// --- HELPERS ---

async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    await new Promise(resolve => setTimeout(resolve, 500)) // Rate limit
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
    console.log("🔥 STARTING CONTENT & VOICE CORRECTION 🔥")

    // 1. Fetch ALL debates
    const { data: debates, error } = await supabase
        .from('debates')
        .select('*')

    if (error) {
        console.error("Failed to fetch debates:", error);
        return;
    }

    console.log(`Scanning ${debates.length} debates...`)

    for (const debate of debates) {
        let changed = false;
        const rounds = debate.rounds || [];

        console.log(`\nChecking Debate: ${debate.title}`)

        for (const round of rounds) {
            let roundChanged = false;

            // CHECK 1: Remove "AIDebate.io" or "commercial" text
            // Regex to match case insensitive "aidebate.io"
            if (round.content && /aidebate\.io/i.test(round.content)) {
                console.log(`   🔸 Found promotional text in Round ${round.round} (${round.speaker}): "${round.content.substring(0, 50)}..."`)

                const newContent = round.content.replace(/aidebate\.io/gi, "AI Debate");
                round.content = newContent;
                roundChanged = true;
                changed = true;

                console.log(`      ✨ Fixed content: "${newContent.substring(0, 50)}..."`)
            }

            // CHECK 2: Fix Claude's Voice
            // If speaker is Claude, we MUST regenerate with new voice ID
            // OR if we just changed the content, we MUST regenerate
            const isClaude = round.speaker?.trim().toLowerCase() === 'claude';

            if (roundChanged || isClaude) {
                console.log(`   🎙️ Regenerating audio for Round ${round.round}...`)

                let voiceId = '';
                if (isClaude) voiceId = NEW_CLAUDE_VOICE_ID;
                else if (round.speaker === 'Aria') voiceId = ARIA_VOICE_ID;
                // Add others if needed, but primarily we are fixing Claude and Aria promos
                else {
                    // Need access to other IDs?
                    // Assuming other speakers don't have promotional text usually, but if they do:
                    // We need a map.
                    const map: any = {
                        'GPT-4o': 'AZnzlk1XvdvUeBnXmlld',
                        'Grok': 'VR6AewLTigWG4xSOukaG',
                        'Gemini': 'N2lVS1w4EtoT3dr4eOWO',
                        'DeepSeek': 'N2lVS1w4EtoT3dr4eOWO'
                    };
                    voiceId = map[round.speaker];
                }

                if (voiceId) {
                    try {
                        const audio = await generateSpeech(round.content, voiceId);
                        const safeSpeaker = round.speaker.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                        // Add timestamp to ensure cache bust? Or just overwrite.
                        // Overwrite is cleaner for DB, but maybe cache issues.
                        // We'll overwrite.
                        const filename = `debate_${debate.id}_r${round.round}_${safeSpeaker}.mp3`;
                        const url = await uploadAudio(audio, filename);
                        round.audio_url = url;
                        console.log(`      ✅ New Audio: ${url}`);
                        changed = true;
                    } catch (e: any) {
                        console.error(`      ❌ Audio Gen Failed: ${e.message}`);
                    }
                } else {
                    console.warn(`      ⚠️ No voice ID for ${round.speaker} - cannot regenerate.`);
                }
            }
        }

        if (changed) {
            console.log(`   💾 Saving changes to DB...`);
            const { error: updateError } = await supabase
                .from('debates')
                .update({ rounds: rounds })
                .eq('id', debate.id);

            if (updateError) console.error(`   ❌ Save Failed: ${updateError.message}`);
            else console.log(`   ✅ Saved.`);
        }
    }

    console.log("\n✨ CORRECTION COMPLETE ✨");
}

main().catch(console.error);
