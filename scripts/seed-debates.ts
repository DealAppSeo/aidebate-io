// Seed debates to Supabase database
// Run with: tsx scripts/seed-debates.ts

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDebate(debateFile: string) {
    console.log(`\n📝 Seeding: ${debateFile}`)

    const content = await fs.readFile(`./debates/${debateFile}`, 'utf-8')
    const debate = JSON.parse(content)

    const { data, error } = await supabase
        .from('debates')
        .insert([debate])
        .select()
        .single()

    if (error) {
        console.error(`  ❌ Error: ${error.message}`)
        throw error
    }

    console.log(`  ✅ Seeded debate: ${data.id}`)
    return data
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
