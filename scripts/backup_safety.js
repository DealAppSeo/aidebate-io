
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

async function backupDB() {
    console.log('Starting DB Backup...');
    const tables = ['debates', 'profiles']; // Add other critical tables if known
    const dbData = {};

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.warn(`Warning: Could not backup table ${table}:`, error.message);
        } else {
            dbData[table] = data;
            console.log(`  - Backed up ${data.length} rows from ${table}`);
        }
    }

    const dbFile = path.join(BACKUP_DIR, `aidebate-db-dump-${TIMESTAMP}.json`);
    fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
    console.log(`Database dump created: ${dbFile}`);
}

async function backupStorage() {
    console.log('Starting Storage Backup...');
    const BUCKET = 'debate-audio';
    const localAudioDir = path.join(BACKUP_DIR, `storage-audio-${TIMESTAMP}`);

    if (!fs.existsSync(localAudioDir)) fs.mkdirSync(localAudioDir, { recursive: true });

    const { data: files, error } = await supabase.storage.from(BUCKET).list();

    if (error) {
        console.error('Error listing storage bucket:', error.message);
        return;
    }

    if (!files || files.length === 0) {
        console.log('Storage bucket is empty or no files found at root.');
        return;
    }

    console.log(`Found ${files.length} files in ${BUCKET}. Downloading...`);

    for (const file of files) {
        const { data, error: dlError } = await supabase.storage.from(BUCKET).download(file.name);
        if (dlError) {
            console.error(`  Failed to download ${file.name}:`, dlError.message);
            continue;
        }
        const buffer = Buffer.from(await data.arrayBuffer());
        fs.writeFileSync(path.join(localAudioDir, file.name), buffer);
        console.log(`  - Downloaded ${file.name}`);
    }
    console.log(`Storage bucket backed up to ${localAudioDir}`);
}

async function run() {
    try {
        await backupDB();
        await backupStorage();
        console.log('BACKUP COMPLETE.');
    } catch (err) {
        console.error('Backup Failed:', err);
        process.exit(1);
    }
}

run();
