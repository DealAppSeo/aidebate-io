import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!)

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Aria

const SOUNDS = [
    { name: 'transition_soft', text: 'Next point.' },
    { name: 'transition_chime', text: 'Ding!' },
    { name: 'results_reveal', text: 'The results are in.' },
    { name: 'vote_pop', text: 'Vote cast.' },
    { name: 'badge_unlock', text: 'Badge earned!' }
];

async function generate() {
    console.log("Generating Placeholder UI Sounds...");
    for (const s of SOUNDS) {
        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY!,
                    },
                    body: JSON.stringify({
                        text: s.text,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
                    }),
                }
            )
            const buffer = await response.arrayBuffer()
            const filename = `ui/${s.name}.mp3`
            const { error } = await supabase.storage.from('debate-audio').upload(filename, buffer, { upsert: true, contentType: 'audio/mpeg' })
            if (error) console.error(error.message)
            else console.log(`✅ Uploaded ${filename}`)
        } catch (e) {
            console.error(e)
        }
    }
}
generate();
