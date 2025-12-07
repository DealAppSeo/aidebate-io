const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectAudio() {
  console.log('Searching for debate with rounds...');
  const { data: debates, error } = await supabase
    .from('debates')
    .select('id, topic, rounds')
    .not('rounds', 'is', null)
    .limit(1);

  if (error) {
    console.error('Error fetching debates:', error);
    return;
  }

  if (!debates || debates.length === 0) {
      console.log('NO DEBATES WITH ROUNDS FOUND.');
      return;
  }

  debates.forEach(debate => {
    console.log('\nFOUND DEBATE WITH ROUNDS:');
    console.log('Debate ID:', debate.id);
    console.log('Topic:', debate.topic);
    if (debate.rounds && debate.rounds.length > 0) {
      console.log('First Round Audio URL:', debate.rounds[0].audio_url || debate.rounds[0].ai_a_audio_url || 'N/A');
    } else {
      console.log('Rounds array is empty (but not null).');
    }
  });
}

inspectAudio();
