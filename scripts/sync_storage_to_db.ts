
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Syncing Storage to DB...')

    // 1. List all files
    const { data: files, error } = await supabase.storage.from('debate-audio').list('', { limit: 1000 })
    if (error) {
        console.error('Error listing files:', error)
        return
    }

    // 2. Group by Debate ID
    const debates: Record<string, any[]> = {}

    files.forEach(f => {
        const name = f.name
        // Match: UUID_round_speaker.mp3
        const match = name.match(/^([0-9a-f-]+)_(\d+)_([ab])\.mp3$/i)
        if (match) {
            const [_, id, roundNum, speaker] = match
            if (!debates[id]) debates[id] = []

            const r = parseInt(roundNum)
            const s = speaker.toLowerCase() === 'a' ? 'AI A' : 'AI B'
            const url = `${SUPABASE_URL}/storage/v1/object/public/debate-audio/${name}`

            debates[id].push({
                round: r,
                speaker: s,
                audio_url: url,
                type: 'Debate Round',
                content: '(Audio recovered from storage)'
            })
        }
    })

    console.log(`Found ${Object.keys(debates).length} debates with audio files.`)

    // 3. Update DB
    for (const [id, rounds] of Object.entries(debates)) {
        // Sort: Round 1 A, Round 1 B, Round 2 A...
        rounds.sort((a, b) => {
            if (a.round !== b.round) return a.round - b.round
            return a.speaker === 'AI A' ? -1 : 1
        })

        console.log(`Updating debate ${id} with ${rounds.length} speech segments...`)

        const { error: updateError } = await supabase
            .from('debates')
            .update({ rounds: rounds })
            .eq('id', id)

        if (updateError) console.error(`Failed to update ${id}:`, updateError)
        else console.log(`✓ Updated ${id}`)
    }
}

main().catch(console.error)
