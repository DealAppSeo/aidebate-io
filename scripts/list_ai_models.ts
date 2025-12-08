
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    const { data, error } = await supabase
        .from('ai_models')
        .select('*')

    if (error) {
        console.error('Error fetching ai_models:', error.message)
    } else {
        data.forEach(m => console.log(`${m.name}: ${m.id}`))
    }
}

main().catch(console.error)
