# AIDebate.io - Voice Battle Royale MVP

**"Where humanity decides which AI to trust."**

A gamified platform where users predict, watch, and vote on AI debates with voice playback, earning RepID through a loot-box psychology reward system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env.local` with your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### 3. Database Setup
Run `schema.sql` in your Supabase SQL Editor

### 4. Storage Setup
Create a `debate-audio` bucket in Supabase Storage (make it public)

### 5. Generate Content
```bash
npm run setup-content
```

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎮 Features

- **Predict** → **Watch** → **Vote** → **Results** → **Share**
- RepID system with variable rewards
- Streak tracking and wagering
- Voice-powered debates (ElevenLabs TTS)
- Feedback and hallucination flagging

## 📁 Key Files

- `app/page.tsx` - Homepage
- `app/debate/[id]/page.tsx` - Debate page
- `app/api/vote/route.ts` - Vote + RepID calculation
- `lib/repid.ts` - RepID logic
- `scripts/generate-debates.ts` - Content generation

## 🚢 Deployment

```bash
vercel --prod
```

See `CONTENT_GENERATION.md` for detailed workflow.

---

**Launch:** December 8, 2025 🚀
