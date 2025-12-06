// Generate TTS audio for debates and upload to Supabase
// Run with: tsx scripts/generate-audio.ts

import { createClient } from '@supabase/supabase-js'
import { generateSpeech, getVoiceIdForAI, VOICE_IDS } from '../lib/elevenlabs'
import fs from 'fs/promises'
import path from 'path'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function generateAndUploadAudio(debateFile: string) {
    console.log(`\n🎙️  Processing: ${debateFile}`)

    const content = await fs.readFile(`./debates/${debateFile}`, 'utf-8')
    const debate = JSON.parse(content)

    // Generate facilitator intro
    console.log('  Generating facilitator intro...')
    const introAudio = await generateSpeech(
        debate.facilitator_intro,
        VOICE_IDS.facilitator
    )
    const introPath = `debates/${debate.title.replace(/[^a-z0-9]/gi, '_')}/intro.mp3`
    await uploadAudio(introAudio, introPath)

    // Generate each round
    for (const round of debate.rounds) {
        console.log(`  Generating round ${round.round_number} (${round.speaker})...`)

        const voiceId = round.speaker === 'ai1'
            ? getVoiceIdForAI(debate.ai1_name)
            : getVoiceIdForAI(debate.ai2_name)

        const audio = await generateSpeech(round.content, voiceId)
        const audioPath = `debates/${debate.title.replace(/[^a-z0-9]/gi, '_')}/round_${round.round_number}.mp3`

        await uploadAudio(audio, audioPath)
        round.audio_url = audioPath
    }

    // Generate facilitator outro
    console.log('  Generating facilitator outro...')
    const outroAudio = await generateSpeech(
        debate.facilitator_outro,
        VOICE_IDS.facilitator
    )
    const outroPath = `debates/${debate.title.replace(/[^a-z0-9]/gi, '_')}/outro.mp3`
    await uploadAudio(outroAudio, outroPath)

    // Save updated debate with audio URLs
    await fs.writeFile(
        `./debates/${debateFile}`,
        JSON.stringify(debate, null, 2)
    )

    console.log(`  ✅ Audio generated and uploaded`)
    return debate
}

async function uploadAudio(audioBuffer: ArrayBuffer, path: string) {
    const { data, error } = await supabase.storage
        .from('debate-audio')
        .upload(path, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true,
        })

    if (error) {
        console.error(`  ❌ Upload failed: ${error.message}`)
        throw error
    }

    return data
}

async function main() {
    console.log('🎙️  Starting TTS generation...\n')

    const files = await fs.readdir('./debates')
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    for (const file of jsonFiles) {
        await generateAndUploadAudio(file)
    }

    console.log('\n✅ All audio generated!')
}

main().catch(console.error)
