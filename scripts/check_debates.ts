
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkDebates() {
    console.log('Checking debates in DB...')
    const { data, error } = await supabase
        .from('debates')
        .select('id, topic, status')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Debates found count:', data?.length || 0)
    if (data && data.length > 0) {
        console.log(JSON.stringify(data, null, 2))
    } else {
        console.log('No debates found in table.')
    }
}

checkDebates()
