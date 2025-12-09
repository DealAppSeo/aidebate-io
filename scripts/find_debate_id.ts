
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
    const { data: debates } = await supabase
        .from('debates')
        .select('id, title, ai1_name, ai2_name')
        .ilike('title', '%Diagnose Your Kid%')

    console.log(JSON.stringify(debates, null, 2));
}

main();
