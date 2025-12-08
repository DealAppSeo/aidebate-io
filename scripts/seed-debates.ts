// Seed debates to Supabase database
// Run with: tsx scripts/seed-debates.ts

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDebate(debateFile: string) {
    console.log(`\n📝 Seeding: ${debateFile}`)

    const content = await fs.readFile(`./debates/${debateFile}`, 'utf-8')
    const debate = JSON.parse(content)

    // Lookup by slug
    const { data: existing } = await supabase
        .from('debates')
        .select('id')
        .eq('slug', debate.slug)
        .single()

    let result;
    if (existing) {
        console.log(`   Detailed: Updating existing debate ${existing.id} (${debate.slug})`)
        // Remove id from debate object to avoid conflict/error if it differs
        const { id, ...updatePayload } = debate;
        const { data, error } = await supabase
            .from('debates')
            .update(updatePayload)
            .eq('id', existing.id)
            .select()
            .single()

        if (error) throw error
        result = data
    } else {
        console.log(`   Detailed: Inserting new debate (${debate.slug})`)
        const { id, ...insertPayload } = debate; // let DB generate ID
        const { data, error } = await supabase
            .from('debates')
            .insert([insertPayload])
            .select()
            .single()

        if (error) throw error
        result = data
    }

    console.log(`  ✅ Seeded debate: ${result.id}`)
    return result
}

async function main() {
    console.log('📊 Starting database seeding...\n')

    const files = await fs.readdir('./debates')
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    for (const file of jsonFiles) {
        await seedDebate(file)
    }

    console.log('\n✅ All debates seeded!')
    console.log('\n🎉 Setup complete! Visit http://localhost:3000 to see your debates.')
}

main().catch(console.error)
