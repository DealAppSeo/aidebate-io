
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
    console.log('Checking for user_sessions table...')

    // Try to select from the table
    const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting from user_sessions:', error)
    } else {
        console.log('Table exists. Sample data:', data)
    }

    // List all tables (hacky way via private API or just infer from failure)
    // Actually, error message usually says "relation does not exist"
}

main().catch(console.error)
