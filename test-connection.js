const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ajpxpmkgkcaomqblkkme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcHhwbWtna2Nhb21xYmxra21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTU4MzksImV4cCI6MjA4MDQzMTgzOX0.YVY1zwia_NH9-R8auH5uPAS9jhI0mfSCtjd8YPRwxaM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase.from('ai_models').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            if (error.code === '42P01') {
                console.log('Table "ai_models" does not exist. You need to run the schema migration.');
            }
        } else {
            console.log('Connection successful!');
            console.log('Table "ai_models" exists.');

            // Check if data exists
            const { data: rows } = await supabase.from('ai_models').select('*').limit(5);
            console.log(`Found ${rows.length} rows in ai_models.`);
            if (rows.length > 0) {
                console.log('Sample data:', rows[0].name);
            } else {
                console.log('Table is empty. You might need to seed the data.');
            }
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

testConnection();
