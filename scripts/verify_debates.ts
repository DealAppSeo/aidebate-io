
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Verifying Debates in DB...')

    // Check columns by selecting one row
    const { data: sample, error: sampleError } = await supabase
        .from('debates')
        .select('*')
        .limit(1)

    if (sampleError) {
        console.error('Error selecting *:', sampleError)
    } else {
        console.log('Sample row columns:', sample && sample[0] ? Object.keys(sample[0]) : 'No rows found')
    }

    const { data, error } = await supabase
        .from('debates')
        .select('id, topic, created_at, rounds')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error listing debates:', error)
        return
    }

    const topics = data.map(d => d.topic).filter(Boolean)
    console.log('JSON_START')
    console.log(JSON.stringify(topics))
    console.log('JSON_END')
}

main().catch(console.error)
