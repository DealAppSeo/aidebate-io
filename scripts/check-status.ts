import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStatus() {
    const { count: debateCount } = await supabase.from('debates').select('*', { count: 'exact', head: true })

    const { data: debates } = await supabase.from('debates').select('id, rounds')

    let debatesWithAudio = 0
    let totalRounds = 0
    let roundsWithAudio = 0

    if (debates) {
        for (const d of debates) {
            const hasAudio = d.rounds.some((r: any) => r.audio_url)
            if (hasAudio) debatesWithAudio++

            totalRounds += d.rounds.length
            roundsWithAudio += d.rounds.filter((r: any) => r.audio_url).length
        }
    }

    // Check for Aria Intros in Storage (sampling one)
    const { data: storageData } = await supabase.storage.from('debate-audio').list()
    // This only lists root. If many files, might be paginated or limited.
    // Just count approximate files ?
    const fileCount = storageData ? storageData.length : 0

    // Check for a specific aria intro
    const { data } = supabase.storage.from('debate-audio').getPublicUrl('debate_1_intro.mp3') // Hypothetical check

    console.log(`Debates in DB: ${debateCount}`)
    console.log(`Debates with at least one audio URL: ${debatesWithAudio}`)
    console.log(`Total Rounds: ${totalRounds}`)
    console.log(`Rounds with Audio: ${roundsWithAudio}`)
    console.log(`Storage File Count (Page 1): ${fileCount}`)
}

checkStatus()
