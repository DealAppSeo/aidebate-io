
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Fetching sample debate...')
    // specificially checking one of the new ones, e.g. Debate 12
    const { data, error } = await supabase
        .from('debates')
        .select('*')
        .eq('topic', 'Should AI Diagnose Your Kid or Talk Them Off a Ledge?')
        .single()

    if (error) {
        console.error('Error fetching debate:', error)
        return
    }

    console.log(`Debate: ${data.topic}`)
    console.log('Rounds Data Sample:')
    if (data.rounds && data.rounds.length > 0) {
        console.log(JSON.stringify(data.rounds[0], null, 2))
    } else {
        console.log('No rounds found or empty array.')
    }

    console.log('\nChecking Debate 1 (re-generated old one):')
    const { data: d1 } = await supabase.from('debates').select('*').eq('topic', 'Will AI Take My Job Forever?').single()
    if (d1?.rounds?.[0]) {
        console.log(JSON.stringify(d1.rounds[0], null, 2))
    }
}

main().catch(console.error)
