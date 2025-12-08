
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Attempting Debug Insert...')

    const { data, error } = await supabase
        .from('debates')
        .insert({
            topic: "DEBUG INSERT ROW",
            description: "Test description",
            // slug: "test-slug", // Commented out to test if this causes failure
            status: 'active',
            rounds: [],
            created_at: new Date().toISOString()
        })
        .select() // FORCE return of data

    if (error) {
        console.error('INSERT FAILED:', error)
    } else {
        console.log('INSERT SUCCESS:', data)
    }
}

main().catch(console.error)
