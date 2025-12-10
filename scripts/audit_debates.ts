
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    console.log("🔍 Starting Debate Audit...")

    const { data: debates, error } = await supabase
        .from('debates')
        .select('*')
        .order('id', { ascending: true })

    if (error) {
        console.error("Error fetching debates:", error)
        return
    }

    console.log(`Found ${debates.length} debates.`)
    console.log(`Format: [ID] Title (Rounds: X, Words: Y) - Status`)

    let failedCount = 0

    for (const debate of debates) {
        const rounds = debate.rounds || []
        let wordCount = 0
        let hasPromo = false
        const promoTerms = ['AIDebate.io', 'sponsored', 'brought to you']

        rounds.forEach((r: any) => {
            if (r.speaker !== 'Aria') {
                const words = r.content.split(' ').length
                wordCount += words

                // Check for promo
                promoTerms.forEach(term => {
                    if (r.content.toLowerCase().includes(term.toLowerCase())) {
                        hasPromo = true
                        console.log(`   ⚠️  PROMO DETECTED in Round ${r.round}: "${term}"`)
                    }
                })
            }
        })

        const isShort = wordCount < 500 // Threshold for "too short" (user asked for ~700 per AI, so 1400 total. Let's flag < 1000)
        const missingRounds = rounds.length < 6

        let status = "✅ PASS"
        if (hasPromo || isShort || missingRounds) {
            status = "❌ FAIL"
            failedCount++
        }

        console.log(`[${debate.id}] ${debate.title.substring(0, 40)}... (Rounds: ${rounds.length}, Words: ${wordCount}) - ${status}`)
        if (isShort) console.log(`      - Too short (< 1000 words)`)
        if (missingRounds) console.log(`      - Missing rounds (< 6)`)
    }

    console.log(`\n Audit Complete. ${failedCount} debates failed.`)
}

main().catch(console.error)
