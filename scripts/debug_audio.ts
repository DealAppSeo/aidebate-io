
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectAudio() {
    const { data: debates, error } = await supabase
        .from('debates')
        .select('id, topic, rounds')
        .limit(3);

    if (error) {
        console.error('Error fetching debates:', error);
        return;
    }

    debates.forEach(debate => {
        console.log(`\nDebate ID: ${debate.id}`);
        console.log(`Topic: ${debate.topic}`);
        if (debate.rounds && debate.rounds.length > 0) {
            console.log('First Round Audio URL:', debate.rounds[0].audio_url);
        } else {
            console.log('No rounds found.');
        }
    });
}

inspectAudio();
