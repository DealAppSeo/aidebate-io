
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// NEW MALE VOICES
// Bill (American, Deep, Narration) causes "Bill"
// Charlie (Australian, Conversational)
// Drew (News, American)
// Clyde (Deep, Well-rounded)

// MAPPING
// GPT-4o -> Bill (pqHfZKP75CvOlQylNhV4)
// Grok -> Drew (29vD33N1CtxCmqQRPOHJ)
// Claude -> Adam (pNInz6obpgDQGcFmaJgB) - Keep (Male)
// Gemini -> Josh (TxGEqnHWrfWFTfGW9XjX) - Keep (Male)

const NEW_VOICES: Record<string, string> = {
    'Bill': 'pqHfZKP75CvOlQylNhV4', // GPT-4o
    'Drew': '29vD33N1CtxCmqQRPOHJ', // Grok
}

// Map AI Name to NEW Voice Actor Name
const AI_VOICE_UPDATE: Record<string, string> = {
    'GPT-4o': 'Bill',
    'Grok': 'Drew'
}

async function generateAndUpload(text: string, voiceName: string, filename: string): Promise<string | null> {
    const voiceId = NEW_VOICES[voiceName]
    if (!voiceId) {
        console.error(`Voice ID not found for ${voiceName}`)
        return null
    }

    console.log(`Generating ${filename} (${voiceName})...`)
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8
                }
            })
        })

        if (!response.ok) {
            console.error(`ElevenLabs Error: ${response.statusData}`)
            return null
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload (Overwrite)
        const { error: uploadError } = await supabase.storage
            .from('debate-audio')
            .upload(filename, buffer, {
                contentType: 'audio/mpeg',
                upsert: true
            })

        if (uploadError) {
            console.error(`Upload error for ${filename}:`, uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('debate-audio')
            .getPublicUrl(filename)

        return publicUrl // + `?t=${Date.now()}` // Bust cache?

    } catch (e) {
        console.error(`Exception generating ${filename}:`, e)
        return null
    }
}

async function main() {
    console.log('Fixing Voices (GPT-4o -> Bill, Grok -> Drew)...')

    // Fetch debates containing these AIs
    const { data: debates, error } = await supabase
        .from('debates')
        .select('*')
        .or('ai_a_name.eq.GPT-4o,ai_b_name.eq.GPT-4o,ai_a_name.eq.Grok,ai_b_name.eq.Grok')

    if (error || !debates) {
        console.error('Error fetching debates:', error)
        return
    }

    console.log(`Found ${debates.length} debates to update.`)

    for (const debate of debates) {
        console.log(`\nProcessing Debate ${debate.id}: ${debate.topic} (${debate.ai_a_name} vs ${debate.ai_b_name})`)

        let roundsModified = false
        const newRounds = [...debate.rounds]

        for (let i = 0; i < newRounds.length; i++) {
            const round = newRounds[i]

            // Check if speaker needs update
            // Format check: round.speaker
            const speakerName = round.speaker

            if (AI_VOICE_UPDATE[speakerName]) {
                const newVoiceActor = AI_VOICE_UPDATE[speakerName]

                // Construct filename (same pattern as fix_missing)
                // debate{id}_{safeSpeaker}_{type}.mp3
                let safeSpeaker = speakerName.toLowerCase().replace(/[^a-z0-9]/g, '')
                if (safeSpeaker === 'gpt4o') safeSpeaker = 'gpt'

                const filename = `debate${debate.id}_${safeSpeaker}_${round.type}.mp3`

                // Regenerate
                const newUrl = await generateAndUpload(round.content, newVoiceActor, filename)

                if (newUrl) {
                    // Update URL (cache busting usually handled by browser but URL stays same)
                    // We might need to append query param to URL in DB to force player reload?
                    // Or just ensure upload overwritten.
                    newRounds[i].audio_url = newUrl
                    roundsModified = true
                }
            }
        }

        if (roundsModified) {
            console.log(`Updating DB for Debate ${debate.id}...`)
            const { error: updateError } = await supabase
                .from('debates')
                .update({ rounds: newRounds })
                .eq('id', debate.id)

            if (updateError) {
                console.error('Update failed:', updateError)
            } else {
                console.log('Success.')
            }
        } else {
            console.log('No segments needed update.')
        }
    }
    console.log('VOICE FIX COMPLETE.')
}

main().catch(console.error)
