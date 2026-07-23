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

import { AI_VOICES, getVoiceForModel } from '../lib/voiceConfig';

// Map legacy names to config if needed, or just use the helper
// We will use the helper function `getVoiceForModel` in the loop instead of this map
// But to keep existing logic structure minimal change:
const VOICE_IDS: Record<string, string> = {
    'Aria': AI_VOICES.aria.voiceId,
    'Claude': AI_VOICES.claude.voiceId,
    'GPT-4o': AI_VOICES.gpt4o.voiceId,
    'Grok': AI_VOICES.grok.voiceId,
    'Gemini': AI_VOICES.gemini.voiceId,
    'DeepSeek': AI_VOICES.gemini.voiceId // Using Rachel for DeepSeek
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
    console.log(`\n🎙️  Processing Debate ${debate.id}: ${debate.topic || debate.title}...`)

    const srcRounds: any[] = Array.isArray(debate.rounds) ? debate.rounds : [];
    if (srcRounds.length === 0) {
        console.log('    ⏭️  No rounds — nothing to voice, skipping.');
        return;
    }

    // Some debates use a two-sided round shape (ai_a_content / ai_b_content with
    // an empty `content` and no `speaker`) that the player + transcript don't
    // read. Normalize those into sequential single-speaker rounds so the EXISTING
    // player handles them — no player rewrite. Single-speaker debates pass through.
    const isTwoSided = srcRounds.some(
        (r) => (!r.content || !String(r.content).trim()) && (r.ai_a_content || r.ai_b_content)
    );

    let newRounds: any[];
    if (isTwoSided) {
        newRounds = [];
        let seq = 1;
        for (const r of srcRounds) {
            const cTxt = String(r.content || '').trim();
            const aTxt = String(r.ai_a_content || '').trim();
            const bTxt = String(r.ai_b_content || '').trim();
            if (cTxt) {
                newRounds.push({ ...r, round: seq++ });
                continue;
            }
            if (aTxt) newRounds.push({ round: seq++, type: r.type || 'argument', title: r.title, speaker: debate.ai_a_name, content: aTxt });
            if (bTxt) newRounds.push({ round: seq++, type: r.type || 'argument', title: r.title, speaker: debate.ai_b_name, content: bTxt });
        }
        console.log(`    ↳ two-sided: normalized ${srcRounds.length} rounds → ${newRounds.length} single-speaker rounds`);
    } else {
        newRounds = srcRounds.map((r) => ({ ...r }));
    }

    let roundsUpdated = false

    for (let i = 0; i < newRounds.length; i++) {
        const round = newRounds[i];

        // Idempotent + credit-safe: never re-TTS a round that already has audio.
        if (round.audio_url) {
            continue;
        }

        if (!round.content || !String(round.content).trim()) {
            console.warn(`    Skipping round ${round.round} (no content)`);
            continue;
        }

        // Resolve voice by exact speaker name, then fall back to model matching.
        const voiceId = VOICE_IDS[round.speaker] || getVoiceForModel(String(round.speaker || ''));
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

    // Write back when we added audio, OR when we normalized a two-sided debate
    // (so its content/speaker populate and the transcript/player render even if
    // an audio call failed).
    if (roundsUpdated || isTwoSided) {
        const { error } = await supabase
            .from('debates')
            .update({ rounds: newRounds })
            .eq('id', debate.id);

        if (error) console.error(`    ❌ DB Update Error: ${error.message}`);
        else console.log(`    💾 Updated rounds in DB (${newRounds.filter((r: any) => r.audio_url).length}/${newRounds.length} with audio)`);
    } else {
        console.log('    ✓ Already voiced — no changes.');
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
