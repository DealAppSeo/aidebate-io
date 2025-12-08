
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    const { data, error } = await supabase
        .from('debates')
        .select('topic')
        .order('topic')

    if (error) {
        console.error(error)
        return
    }

    console.log('--- DB TOPICS ---')
    data.forEach(d => console.log(`"${d.topic}"`))
    console.log('-----------------')
}

main().catch(console.error)
