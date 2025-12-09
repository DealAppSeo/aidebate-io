
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

const NEW_CLAUDE_VOICE_ID = 'Cwh3Epv47UyEOtLVzCnb'; // Roger (Confident Male)
const VOICE_SETTINGS = {
    stability: 0.45,
    similarity_boost: 0.95,
    style: 0.2,
    use_speaker_boost: true
};

async function generateSpeech(text: string, voiceId: string): Promise<ArrayBuffer> {
    await new Promise(resolve => setTimeout(resolve, 500))
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
}

async function uploadAudio(audioBuffer: ArrayBuffer, filePath: string) {
    const { error } = await supabase.storage
        .from('debate-audio')
        .upload(filePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('debate-audio').getPublicUrl(filePath)
    return data.publicUrl
}

async function main() {
    console.log("🔥 FIXING TARGETED DEBATE AUDIO (ROBUST) 🔥")

    // Fetch all debates
    const { data: allDebates } = await supabase.from('debates').select('*');

    if (!allDebates || allDebates.length === 0) {
        console.error("❌ No debates found in DB!");
        return;
    }

    console.log(`Found ${allDebates.length} debates.`);

    // Loose match with safety check
    const debate = allDebates.find(d => {
        if (!d.title) return false;
        const t = d.title.toLowerCase();
        return t.includes("diagnose your kid") || t.includes("diagnose") || t.includes("kid");
    });

    if (!debate) {
        console.error("❌ Target debate NOT found after robust search!");
        // Debug: list first 5 titles
        console.log("Sample titles:", allDebates.slice(0, 5).map(d => d.title).join(", "));
        return;
    }

    console.log(`\n✅ TARGET MATCHED: ${debate.title} (${debate.id})`);

    let changed = false;
    const rounds = debate.rounds || [];

    for (const round of rounds) {
        const speaker = round.speaker?.trim();
        const isClaude = speaker && speaker.toLowerCase() === 'claude';

        console.log(`Checking Round ${round.round}: Speaker=${speaker}, isClaude=${isClaude}`);

        if (isClaude) {
            console.log(`   🎙️ Regenerating audio for Round ${round.round} (Claude -> Roger)...`)

            try {
                const audio = await generateSpeech(round.content, NEW_CLAUDE_VOICE_ID);
                const safeSpeaker = round.speaker.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filename = `debate_${debate.id}_r${round.round}_${safeSpeaker}_rog_v3.mp3`;

                const url = await uploadAudio(audio, filename);
                round.audio_url = url;
                console.log(`      ✅ New Audio: ${url}`);
                changed = true;
            } catch (e: any) {
                console.error(`      ❌ Failed: ${e.message}`);
            }
        }
    }

    if (changed) {
        console.log(`   💾 Saving changes...`);
        const { error } = await supabase
            .from('debates')
            .update({ rounds: rounds })
            .eq('id', debate.id);

        if (error) console.error(`   ❌ Save Failed: ${error.message}`);
        else console.log(`   ✅ Saved.`);
    } else {
        console.log("   No Claude rounds processed.");
    }
}

main().catch(console.error);
