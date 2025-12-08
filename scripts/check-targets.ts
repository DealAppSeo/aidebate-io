import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TARGET_IDS = [
    '0d34d5cc-2d26-4dd4-9ec6-4c3bc3f41c41',
    '368706a4-ed47-4cbc-9398-022b11452bf0',
    '90c0f99e-1298-427b-9d67-b0766cafc720',
    'e51ff6a5-8f8d-4d1a-b1a1-338664476403'
]

async function checkDebates() {
    const { data: debates, error } = await supabase
        .from('debates')
        .select('*')
        .in('id', TARGET_IDS)

    if (error) {
        console.error('Error fetching debates:', error)
        return
    }

    console.log(`Found ${debates?.length} of 4 target debates.`)
    debates?.forEach(d => {
        const roundCount = d.rounds ? d.rounds.length : 0
        const hasContent = d.rounds?.every((r: any) => r.content && r.content.length > 0)
        console.log(`- ${d.id}: ${d.title} (${roundCount} rounds, Content OK: ${hasContent})`)
    })
}

checkDebates()
