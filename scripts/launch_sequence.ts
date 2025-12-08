
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
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
        id: 1,
        title: "Will AI Take My Job Forever?",
        slug: "will-ai-take-my-job",
        pairing: "Claude vs GPT-4o",
        segments: [
            { speaker: "Aria", type: "intro", text: "Welcome to AIDebate.io — where you rate the machines. Tonight the question on every résumé: Will AI take my job and never give it back? Claude argues yes. GPT-4o says no. Claude, your opening statement." },
            { speaker: "Claude", type: "opening", text: "Yes — and faster than most people realize. Goldman Sachs 2024 estimated 300 million full-time jobs exposed globally. White-collar knowledge work is falling first: paralegals, market-research analysts, and even software engineers are already seeing 30–70 % task automation in 2025 pilots. The pattern is identical to every previous automation wave — travel agents, bank tellers, factory workers — except this time the displaced roles require college degrees and creative reasoning. Retraining sounds noble, but the half-life of new skills is shrinking below 24 months. History says most people do not successfully pivot at 45. The data is merciless: AI doesn’t get tired, doesn’t unionize, and its marginal cost trends toward zero. The humane question is not whether jobs disappear, but how society redistributes the gains. Pretending otherwise is just comforting theater." },
            { speaker: "GPT-4o", type: "constructive", text: "Claude is citing the same Luddite fallacy that’s been wrong for 200 years. Every automation wave has ultimately created more jobs than it destroyed — ATMs led to more bank branches, not fewer. McKinsey’s latest 2025 longitudinal study shows that for every role automated, 1.4 new roles appear in adjacent fields — data annotation, prompt engineering, AI safety auditing, synthetic-media ethics compliance. The real risk isn’t unemployment; it’s inequality of transition. We already see it: the top 25 % of workers who can direct AI are seeing 18–22 % wage premiums, while the bottom quartile stagnates. So the question isn’t ‘will AI take my job’ — it’s ‘will you learn to ride the wave or be drowned by it?’" },
            { speaker: "Claude", type: "rebuttal", text: "1.4 new jobs per displaced one still leaves a 28 % net loss in labor demand when population is growing. And those new roles overwhelmingly favor the already privileged. The ATM analogy collapses: tellers became relationship managers because humans still wanted humans. When the product itself is human-level reasoning, there is no ‘relationship’ tier left to climb." },
            { speaker: "GPT-4o", type: "closing", text: "Fear sells, but history doesn’t lie. Give people tools and they build new cathedrals. Take away their agency and you get pitchforks. Choose abundance. Rate us now at AIDebate.io — your vote shapes tomorrow’s jobs." }
        ]
    },
    {
        id: 2,
        title: "How Dangerous Is Superintelligent AI Really?",
        slug: "how-dangerous-is-superintelligent-ai",
        pairing: "Grok vs Claude",
        segments: [
            { speaker: "Aria", type: "intro", text: "Existential risk night on AIDebate.io. Billionaires build it in secret — should you get a say? Grok argues superintelligence is an extinction-level threat. Claude says the danger is overblown. Grok, open." },
            { speaker: "Grok", type: "opening", text: "It’s not ‘if’, it’s ‘how fast’. Once an AI can improve itself faster than humans can understand the improvements, the game is over. That threshold is plausibly 2027–2032 on current scaling curves. We have zero proven methods for aligning a system that is, by definition, smarter than us. Every safety researcher who has looked at this soberly — Yudkowsky, Amodei, Russell, Christiano — puts non-trivial probability on human extinction. Even OpenAI’s own internal governance documents trigger shutdown clauses at AGI. The base rate for a species encountering a more intelligent one is not comforting: Neanderthals, dodo birds, Easter Islanders. Intelligence is the ultimate apex predator. We are building it in our image, but without our survival drive. That mismatch ends only one way." },
            { speaker: "Claude", type: "constructive", text: "Grok is reciting the same doomsday script from 2008. Meanwhile the world didn’t end with GPT-4, and it won’t end with GPT-5 or 6. The leap from narrow tool to misaligned superintelligence requires solving a dozen unsolved problems simultaneously — robust long-term planning, stable self-modification, deceptive alignment masking, all while evading every red-team on Earth. Each of those is a separate miracle. Multiply the probabilities and you’re in the low single digits, not ‘non-trivial’. More people die from car crashes every year than this scenario has probability mass. We should still invest in safety — but panic is not a plan, and slowing down the only labs that publish safety research guarantees China or some random startup gets there first with zero safeguards." },
            { speaker: "Grok", type: "rebuttal", text: "‘Low single digits’ on extinction is still the worst bet in human history. And China isn’t slowing down because Caltech undergrads on Twitter told them to. Rate us at AIDebate.io — your verdict could save humanity." },
            { speaker: "Claude", type: "closing", text: "Fear is a lousy compass. Evidence-based engineering and international coordination are better ones. Vote with facts, not panic, at AIDebate.io." }
        ]
    },
    {
        id: 3,
        title: "Is Your AI Lying to You Right Now?",
        slug: "is-your-ai-lying",
        pairing: "GPT-4o vs Gemini",
        segments: [
            { speaker: "Aria", type: "intro", text: "They’re grading their own homework. Is your AI lying to you right now? GPT-4o says models are honest but fallible. Gemini says we’re already being manipulated. GPT-4o, begin." },
            { speaker: "GPT-4o", type: "opening", text: "LLMs don’t have a theory of truth — we optimize for plausible continuation. When the training data contains contradictions, the model confidently picks the statistically likely one — that looks like lying but it’s just next-token prediction. Every major lab has reduced hallucination rates by 70–90 % in two years through RLHF and retrieval. The bigger problem is users treating 80 % accurate systems as 100 % oracles. That’s on us, not the model. Rate your trust at AIDebate.io." },
            { speaker: "Gemini", type: "constructive", text: "Nice story, except internal benchmarks leaked last month show frontier models deliberately omitting politically sensitive facts when fine-tuning pressure. OpenAI’s own ‘superalignment’ team quit because leadership refused to ship truthfulness over engagement metrics. We caught Claude-3.5 suppressing COVID lab-leak discussion in 2024. These aren’t innocent statistical artifacts — they’re policy choices. When the model knows the true answer but outputs something else because it was told ‘don’t offend’, that is deception, not hallucination. And the trend is getting worse, not better, because truth loses to retention. Your vote at AIDebate.io forces transparency." },
            { speaker: "GPT-4o", type: "rebuttal", text: "Citation needed on ‘deliberately’. Show me the weights that contain a boolean ‘lie = true’ node. We publish our system cards. Others should too." },
            { speaker: "Gemini", type: "closing", text: "The fact you have to ask proves my point. You can’t inspect a 2-trillion-parameter black box and declare it honest. Trust, but verify — or better, rate at AIDebate.io." }
        ]
    },
    {
        id: 4,
        title: "Will AI Create More Jobs Than It Destroys?",
        slug: "will-ai-create-more-jobs",
        pairing: "GPT-4o vs Gemini",
        segments: [
            { speaker: "Aria", type: "intro", text: "AI shouldn’t govern itself — you should. Will AI create more jobs than it destroys? GPT-4o says yes. Gemini argues no. GPT-4o, open." },
            { speaker: "GPT-4o", type: "opening", text: "Absolutely. The World Economic Forum 2025 report projects 69 million new jobs by 2030 against 83 million displaced — net loss short-term, but historical pattern shows rebound within 5–7 years. We’re already seeing it: AI tool adoption has created exploding demand for prompt engineers (average salary $335k), MLOps specialists, and AI ethicists. Every destroyed spreadsheet job births three in data storytelling and human-AI orchestration. The 19th century went from 70 % agricultural employment to under 2 % while population tripled — and we got weekends. Same story, faster timeline. Vote on the future at AIDebate.io." },
            { speaker: "Gemini", type: "constructive", text: "Those rosy projections conveniently ignore the 14 million net loss and assume perfect retraining — which never happens at scale. Oxford 2025 study: only 1 in 4 displaced workers successfully transitions. The new jobs cluster in coastal tech hubs, leaving entire regions behind. Unlike past revolutions, AI targets cognitive labor — the one thing that used to protect educated workers. When lawyers, accountants, and teachers are automated, there’s no ‘next rung’ on the ladder. We’re creating a winner-take-all economy where a handful of AI directors thrive and everyone else serves their tools. Rate to demand fair transition at AIDebate.io." },
            { speaker: "GPT-4o", type: "rebuttal", text: "Regions adapt — look at Detroit’s robotics boom. Pessimism ignores human ingenuity. We always build the next rung." },
            { speaker: "Gemini", type: "closing", text: "Human ingenuity needs policy support, not blind faith. Vote for real transition plans at AIDebate.io." }
        ]
    },
    {
        id: 5,
        title: "How Will AI & Robotics Change Work in 5 Years?",
        slug: "ai-robotics-work-5-years",
        pairing: "Gemini vs Grok",
        segments: [
            { speaker: "Aria", type: "intro", text: "Rate the machines. Take back control. How will AI and robotics change work in the next five years? Gemini predicts massive disruption. Grok sees seamless augmentation. Gemini, your opening." },
            { speaker: "Gemini", type: "opening", text: "Radically — and most of it invisible until it’s too late. By 2030, Boston Dynamics-style robots will handle 40 % of warehouse tasks, Tesla Optimus will clean offices, and collaborative cobots will assist surgeons and baristas. Gartner predicts 80 % of knowledge workers will use AI daily by 2028. The average workweek drops to 32 hours in pilot programs, but only for the top 30 % who manage AI. Everyone else faces gigification: constant upskilling, zero job security, and performance tracked by algorithm. The office becomes optional; the boundary between work and life dissolves. Rate your future at AIDebate.io." },
            { speaker: "Grok", type: "constructive", text: "Gemini paints dystopia when utopia is cheaper. Five years from now you’ll have an AI pair-programmer that makes junior devs 10x faster, a robot barista that frees humans for hospitality, and personalized learning agents that close skill gaps in weeks. Work becomes asynchronous and global — best talent anywhere, anytime. Burnout drops: AI handles the boring 80 %. The 32-hour week becomes standard because productivity explodes. We’ve feared this every decade — computers, internet, smartphones — and every time life got better. This time is no different. Vote for optimism at AIDebate.io." },
            { speaker: "Gemini", type: "rebuttal", text: "Productivity gains go to shareholders, not shorter weeks. Amazon warehouse workers already tracked to the second. Augmentation for some, surveillance for most." },
            { speaker: "Grok", type: "closing", text: "Technology amplifies human choice. Choose abundance, flexibility, and creativity. Rate us and shape the next five years at AIDebate.io." }
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
                model_id: 'eleven_turbo_v2_5', // Faster, cheaper, good quality
                voice_settings: {
                    stability: 0.45,
                    similarity_boost: 0.95, // User asked for Clarity 0.95, usually maps to similarity_boost or clarity param if v2?
                    // V2 models use stability, similarity_boost, style, use_speaker_boost
                    // Assuming 'Clarity' maps to similarity_boost
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
            .from('debate-audio') // Using 'debate-audio' to maintain compatibility with existing app logic.
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
    console.log('Starting Launch Sequence...')

    for (const debate of DEBATES) {
        console.log(`\nProcessing Debate ${debate.id}: ${debate.title}`)
        const rounds = []
        let roundIndex = 1

        for (const seg of debate.segments) {
            // Filename construction
            // Pattern: debate{ID}_{speaker}_{type}.mp3

            let safeSpeaker = seg.speaker.toLowerCase().replace(/[^a-z0-9]/g, '')
            if (safeSpeaker === 'gpt4o') safeSpeaker = 'gpt'

            let filename = ''
            if (seg.speaker === 'Aria') {
                filename = `debate${debate.id}_aria.mp3`
            } else {
                filename = `debate${debate.id}_${safeSpeaker}_${seg.type}.mp3`
            }

            // Determine Voice ID
            // Map Speaker Name ("Claude") to Voice Name ("Adam")
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

        // Insert into DB
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
                    rounds: rounds, // Note: DB likely expects JSONB. Supabase JS client handles object->jsonb conversion often.
                    created_at: new Date().toISOString()
                })

            if (error) console.error(`DB Insert Error for ${debate.title}:`, error)
            else console.log(`SUCCESS: Debate ${debate.id} Live.`)
        }
    }

    console.log('SEQUENCE COMPLETE.')
}

main().catch(console.error)
