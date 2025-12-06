# Content Generation Workflow

This guide explains how to generate debate content for AIDebate.io.

## Prerequisites

1. **Environment Variables** - Create `.env.local` with:
   ```
   ANTHROPIC_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

2. **Database Setup** - Run `schema.sql` in Supabase SQL Editor

3. **Storage Bucket** - Create `debate-audio` bucket in Supabase Storage (public)

## Generation Steps

### 1. Generate Debate Content

```bash
npm run generate-debates
```

This will:
- Call Claude and GPT-4o APIs
- Generate 6-round debates (opening, counter, rebuttals, closings)
- Save to `./debates/*.json`
- Log all API calls to console

### 2. Generate TTS Audio

```bash
npm run generate-audio
```

This will:
- Read debate JSON files
- Call ElevenLabs API for each round
- Upload MP3 files to Supabase Storage
- Update JSON files with audio URLs

### 3. Seed to Database

```bash
npm run seed-debates
```

This will:
- Read debate JSON files (with audio URLs)
- Insert into Supabase `debates` table
- Return debate IDs

### All-in-One

```bash
npm run setup-content
```

Runs all three steps in sequence.

## Debate Structure

Each debate has:
- `title` - Short question
- `topic` - Full debate prompt
- `category` - Philosophy, Technology, Ethics, etc.
- `ai1_name`, `ai1_model` - First AI (e.g., Claude)
- `ai2_name`, `ai2_model` - Second AI (e.g., GPT-4o)
- `rounds` - Array of 6 rounds:
  ```json
  {
    "round_number": 1,
    "speaker": "ai1",
    "content": "...",
    "word_count": 65,
    "audio_url": "debates/..."
  }
  ```
- `facilitator_intro` - NPR-style intro
- `facilitator_outro` - Closing statement
- `total_duration_seconds` - Estimated duration

## Voice Mapping

- **Claude** → Adam (thoughtful, measured)
- **GPT-4o** → Antoni (confident, articulate)
- **Grok** → Arnold (bold, energetic)
- **Gemini** → Rachel (balanced, clear)
- **Facilitator** → Elli (neutral, NPR-style)

## Adding New Debates

Edit `scripts/generate-debates.ts` and add to `DEBATE_TOPICS`:

```typescript
{
  title: 'Your Question?',
  topic: 'Full debate prompt...',
  category: 'Technology',
  ai1: { name: 'Claude', model: 'claude-3-opus-20240229' },
  ai2: { name: 'GPT-4o', model: 'gpt-4o' },
}
```

Then run the generation workflow.

## Troubleshooting

**"API key not found"** - Check `.env.local` exists and has correct keys

**"Table does not exist"** - Run `schema.sql` in Supabase

**"Storage bucket not found"** - Create `debate-audio` bucket in Supabase Storage

**"Rate limit exceeded"** - Add delays between API calls or use cached debates
