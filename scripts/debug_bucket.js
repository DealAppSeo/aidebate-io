
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugBuckets() {
    console.log('Checking Buckets...');
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Buckets found:', buckets.map(b => b.name));
    }

    const BUCKET = 'debate-audio';
    console.log(`\nListing files in '${BUCKET}'...`);
    const { data: files, error: listError } = await supabase.storage.from(BUCKET).list();

    if (listError) {
        console.error(`Error listing '${BUCKET}':`, listError);
    } else {
        console.log(`Files in '${BUCKET}':`, files ? files.length : 0);
        if (files && files.length > 0) {
            console.log('Sample file:', files[0]);
        }
    }

    // Check URL of first round in DB again to see if it matches
    const { data: debate } = await supabase.from('debates').select('rounds').limit(1).single();
    if (debate?.rounds?.[0]) {
        console.log('\nDB Round Audio URL sample:', debate.rounds[0].audio_url);
    }
}

debugBuckets();
