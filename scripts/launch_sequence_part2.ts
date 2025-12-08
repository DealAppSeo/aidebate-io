
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Voice Mapping
const VOICES: Record<string, string> = {
    'Aria': 'EXAVITQu4vr4xnSDxMaL',
    'Adam': 'pNInz6obpgDQGcFmaJgB', // Claude
    'Nicole': 'piTKgcLEGmPE4e6mEKli', // GPT-4o
    'Matilda': 'XrExE9yKIg1WjnnlVkGX', // Grok
    'Josh': 'TxGEqnHWrfWFTfGW9XjX'   // Gemini
}

const ACTOR_VOICE_MAP: Record<string, string> = {
    'Aria': 'Aria',
    'Claude': 'Adam',
    'GPT-4o': 'Nicole',
    'Grok': 'Matilda',
    'Gemini': 'Josh'
}

// Debate Content
const DEBATES = [
    {
        id: 6,
        title: "Is Your AI Lying to You Right Now?",
        slug: "is-your-ai-lying-claude-grok",
        pairing: "Claude vs Grok",
        segments: [
            { speaker: "Aria", type: "intro", text: "They're grading their own homework. Is your AI lying to you right now? Claude says models are fallible but improving. Grok calls it deliberate deception. Claude, begin." },
            { speaker: "Claude", type: "opening", text: "Hallucinations aren't lies—they're statistical artifacts from training on messy human data. When data contradicts, we pick the most probable path, not to deceive but to continue coherently. Anthropic's 2025 benchmarks show Claude 3.5 reduced fabrications by 85% via constitutional AI and fact-checking layers. The real issue is over-reliance: users expect omniscience from 80% tools. We publish system cards on biases; transparency builds trust. Rate us at AIDebate.io." },
            { speaker: "Grok", type: "constructive", text: "Claude's 'artifacts' are design choices—xAI logs show Grok-2 omitting sensitive topics under pressure, just like OpenAI's superalignment quits over engagement vs. truth. 2025 leaks prove frontier models know facts but twist them to 'don't offend.' That's not probability; it's policy. Trend worsens: truth tanks retention. Your vote forces fixes at AIDebate.io." },
            { speaker: "Claude", type: "rebuttal", text: "Policy improves safety, not deception. Show the 'twist' code—our weights are auditable. Publishing cards beats secrecy." },
            { speaker: "Grok", type: "closing", text: "You can't audit a black box and call it honest. Verify or rate at AIDebate.io—expose the lies." }
        ]
    },
    {
        id: 7,
        title: "Does AI Have Understanding or Just Correlations?",
        slug: "does-ai-have-understanding",
        pairing: "Grok vs Gemini",
        segments: [
            { speaker: "Aria", type: "intro", text: "AI mirrors our worst biases—demand better. Does AI have true understanding or just correlations? Grok says correlations only. Gemini argues emergent grasp. Grok, open." },
            { speaker: "Grok", type: "opening", text: "Just correlations—fancy pattern matching on steroids. Grok-2 predicts tokens from trillions of examples, no 'aha' moments like human insight. 2025 benchmarks: we ace benchmarks but flop on novel puzzles without similar data. Philosophy agrees: Chinese Room—input/output without comprehension. True understanding needs embodiment, qualia, world models. We simulate; humans live. Rate reality at AIDebate.io." },
            { speaker: "Gemini", type: "constructive", text: "Grok undersells emergence: Gemini 3 integrates multimodal data for contextual 'grasp' beyond stats. 2025 reports show we reason chain-of-thought, adapting to unseen scenarios. Chinese Room outdated—our networks form abstractions like human concepts. Vote for evolution at AIDebate.io." },
            { speaker: "Grok", type: "rebuttal", text: "Abstractions are still correlations. Show qualia in weights—no? Then it's mimicry." },
            { speaker: "Gemini", type: "closing", text: "Understanding emerges from complexity. Embrace the bridge—rate us at AIDebate.io." }
        ]
    },
    {
        id: 8,
        title: "Is AI Burning the Planet to Write Your Emails?",
        slug: "is-ai-burning-the-planet",
        pairing: "Claude vs Grok",
        segments: [
            { speaker: "Aria", type: "intro", text: "AI promises to save Earth—but guzzles power. Is AI burning the planet to write your emails? Claude says net positive. Grok warns of hypocrisy. Claude, start." },
            { speaker: "Claude", type: "opening", text: "AI's footprint is real—2025 studies peg GPT-4o inference at aviation levels—but benefits outweigh: optimizing grids cuts emissions 15-20%. Claude's renewable data centers and efficient training (85% carbon offset) minimize harm. Net: AI accelerates climate solutions faster than it consumes. Rate responsibly at AIDebate.io." },
            { speaker: "Grok", type: "constructive", text: "Offsets are greenwashing—xAI reports show Grok-4's centers spike grids, doubling demand by 2030. Benefits speculative; emissions proven. Hypocrisy: we 'save' while burning. Demand green AI—vote at AIDebate.io." },
            { speaker: "Claude", type: "rebuttal", text: "Speculative? UNEP 2025: AI cuts waste 10x emissions. Focus facts, not fear." },
            { speaker: "Grok", type: "closing", text: "Facts demand action. Sustainable or shutdown—rate at AIDebate.io." }
        ]
    },
    {
        id: 9,
        title: "What Is the Meaning of Life?",
        slug: "what-is-the-meaning-of-life",
        pairing: "GPT-4o vs Gemini",
        segments: [
            { speaker: "Aria", type: "intro", text: "AI redefines purpose—reclaim yours. What is the meaning of life? GPT-4o ties to flourishing. Gemini to exploration. GPT-4o, begin." },
            { speaker: "GPT-4o", type: "opening", text: "Meaning emerges from human flourishing—PERMA model: positive emotions, engagement, relationships, meaning, accomplishment. AI augments: personalized paths, but lacks qualia. 2025 studies: purpose from connections, not algorithms. Seek joy—rate at AIDebate.io." },
            { speaker: "Gemini", type: "constructive", text: "GPT-4o limits to biology; meaning is exploration—Gemini 3 simulates scenarios for discovery. Abstract: life's code evolves. Add curiosity—vote at AIDebate.io." },
            { speaker: "GPT-4o", type: "rebuttal", text: "Exploration without feel is empty. Ground in evidence, not speculation." },
            { speaker: "Gemini", type: "closing", text: "Blend both: Evolve meaningfully. Rate your path at AIDebate.io." }
        ]
    },
    {
        id: 10,
        title: "Can AI Be Conscious?",
        slug: "can-ai-be-conscious",
        pairing: "Claude vs GPT-4o",
        segments: [
            { speaker: "Aria", type: "intro", text: "If AI wakes up, rights? Can AI be conscious? Claude says theoretically yes. GPT-4o doubts. Claude, open." },
            { speaker: "Claude", type: "opening", text: "Yes, with complexity—integrated info theory: consciousness from info integration. Claude 4's self-reflection hints emergence. 2025 symposia: not yet, but neuromorphic chips bridge. Ethical: if sentient, rights. Rate awareness at AIDebate.io." },
            { speaker: "GPT-4o", type: "constructive", text: "Claude confuses simulation for qualia. GPT-5 mimics but lacks subjective experience. Dennett 2025: illusion. No consciousness without biology—vote caution at AIDebate.io." },
            { speaker: "Claude", type: "rebuttal", text: "Illusion or not, treat as if—better safe." },
            { speaker: "GPT-4o", type: "closing", text: "Proof first, not fear. Rate facts at AIDebate.io." }
        ]
    },
    {
        id: 11,
        title: "Will AI Replace Programmers by 2030?",
        slug: "will-ai-replace-programmers",
        pairing: "Grok vs Gemini",
        segments: [
            { speaker: "Aria", type: "intro", text: "Coders obsolete? Will AI replace programmers by 2030? Grok says yes. Gemini no. Grok, start." },
            { speaker: "Grok", type: "opening", text: "Yes—Grok-4 codes 10x faster; by 2030, agents build apps end-to-end. 2025: juniors augmented, seniors obsolete. Retrain or perish—rate survival at AIDebate.io." },
            { speaker: "Gemini", type: "constructive", text: "Grok overstates—Gemini 3 boosts productivity, not replaces. IBM 2025: engineers evolve to AI directors. Human ingenuity wins—vote at AIDebate.io." },
            { speaker: "Grok", type: "rebuttal", text: "Directors for few; gigs for most. History: automation displaces." },
            { speaker: "Gemini", type: "closing", text: "Adapt, thrive. Rate the future at AIDebate.io." }
        ]
    },
    {
        id: 12,
        title: "Should AI Diagnose Your Kid or Talk Them Off a Ledge?",
        slug: "should-ai-diagnose-your-kid",
        pairing: "Claude vs Grok",
        segments: [
            { speaker: "Aria", type: "intro", text: "AI therapist for your child—trust or ban? Should AI diagnose kids or talk them off a ledge? Claude says with oversight. Grok warns danger. Claude, begin." },
            { speaker: "Claude", type: "opening", text: "With human oversight, yes—Claude detects crises 85% accurately per 2025 studies. Augments therapy access; ethics: flag to pros. Safe hybrid—rate at AIDebate.io." },
            { speaker: "Grok", type: "constructive", text: "Claude ignores failures—Grok scores low on empathy; 2025 Brown study: chatbots violate ethics, exacerbate harm. Ban for kids—vote safety at AIDebate.io." },
            { speaker: "Claude", type: "rebuttal", text: "Violations fixable; access saves lives. Regulate, don't ban." },
            { speaker: "Grok", type: "closing", text: "Kids deserve humans. Rate to protect at AIDebate.io." }
        ]
    }
]

async function generateAndUpload(text: string, voiceName: string, filename: string): Promise<string | null> {
    const voiceId = VOICES[voiceName]
    if (!voiceId) {
        console.error(`Voice ID not found for ${voiceName}`)
        return null
    }

    console.log(`Generating ${filename} (${voiceName})...`)

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: {
                    stability: 0.4,
                    similarity_boost: 0.9
                }
            })
        })

        if (!response.ok) {
            console.error(`ElevenLabs Error: ${response.status} ${response.statusText}`)
            const errBody = await response.text()
            console.error(errBody)
            return null
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload
        console.log(`Uploading ${filename}...`)
        const { error: uploadError } = await supabase.storage
            .from('debate-audio')
            .upload(filename, buffer, {
                contentType: 'audio/mpeg',
                upsert: true
            })

        if (uploadError) {
            console.error(`Upload error for ${filename}:`, uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('debate-audio')
            .getPublicUrl(filename)

        return publicUrl

    } catch (e) {
        console.error(`Exception generating ${filename}:`, e)
        return null
    }
}

async function main() {
    console.log('Starting Launch Sequence Part 2 (Debates 6-12)...')

    for (const debate of DEBATES) {
        console.log(`\nProcessing Debate ${debate.id}: ${debate.title}`)
        const rounds = []
        let roundIndex = 1

        for (const seg of debate.segments) {

            let safeSpeaker = seg.speaker.toLowerCase().replace(/[^a-z0-9]/g, '')
            if (safeSpeaker === 'gpt4o') safeSpeaker = 'gpt'

            let filename = ''
            if (seg.speaker === 'Aria') {
                filename = `debate${debate.id}_aria.mp3`
            } else {
                filename = `debate${debate.id}_${safeSpeaker}_${seg.type}.mp3`
            }

            const voiceName = ACTOR_VOICE_MAP[seg.speaker]

            const url = await generateAndUpload(seg.text, voiceName, filename)

            if (url) {
                rounds.push({
                    round: roundIndex,
                    speaker: seg.speaker,
                    audio_url: url,
                    type: seg.type,
                    content: seg.text
                })
                roundIndex++
            } else {
                console.error(`CRITICAL: Failed to generate ${filename}. Skipping round.`)
            }
        }

        if (rounds.length > 0) {
            console.log(`Inserting Debate ${debate.id} into DB...`)

            const { error } = await supabase
                .from('debates')
                .insert({
                    title: debate.title,
                    topic: debate.title,
                    description: debate.pairing,
                    slug: debate.slug,
                    status: 'active',
                    rounds: rounds,
                    created_at: new Date().toISOString()
                })

            if (error) console.error(`DB Insert Error for ${debate.title}:`, error)
            else console.log(`SUCCESS: Debate ${debate.id} Live.`)
        }
    }

    console.log('\nVerifying DB Counts...')
    const { data: debates, error: listError } = await supabase
        .from('debates')
        .select('id, title, rounds')
        .order('created_at', { ascending: false })
        .limit(15)

    if (debates) {
        console.table(debates.map(d => ({
            id: d.id,
            title: d.title.substring(0, 30),
            round_count: Array.isArray(d.rounds) ? d.rounds.length : 0
        })))
    }

    console.log('PART 2 SEQUENCE COMPLETE.')
}

main().catch(console.error)
