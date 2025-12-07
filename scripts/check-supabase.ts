import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
    console.log('Checking Supabase connection...')
    console.log('URL:', url)

    // Check Debates
    const { count, error } = await supabase.from('debates').select('*', { count: 'exact', head: true })
    if (error) {
        console.error('Error checking debates:', error.message)
    } else {
        console.log(`Debates count: ${count}`)
    }

    // Check Tables
    const tables = ['debates', 'votes', 'user_sessions', 'referral_events', 'push_subscriptions', 'audio_analytics']
    console.log('\nChecking tables existence:')
    for (const t of tables) {
        const { error } = await supabase.from(t).select('*').limit(1)
        if (error) {
            console.log(`❌ ${t}: ${error.message}`)
        } else {
            console.log(`✅ ${t}`)
        }
    }
}

run()
