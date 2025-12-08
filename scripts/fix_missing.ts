
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Voice Mapping & ElevenLabs logic
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

const AI_IDS: Record<string, string> = {
    'Claude': 'claude-sonnet',
    'GPT-4o': 'gpt-4o',
    'Grok': 'grok-2',
    'Gemini': 'gemini-pro'
}

// FULL LIST OF 12 DEBATES
const DEBATES = [
    // PART 1
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
    },
    // PART 2
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

    try {
        // Simple check if file likely exists (by getting publicURL) - checking headers is better but heavier.
        // We will just try upload. If it exists, 'upsert: true' handles it.
        // But to save ElevenLabs credits, we should check if we already did it?
        // Since I am re-running, I assume I want to ensure. BUT credits are precious.
        // I will assume if I have a URL in DB (from previous runs), I might skip?
        // But DB is missing row. Audio might exist in bucket.
        // I will check bucket list? No, too slow.
        // I will just generate.

        console.log(`Generating ${filename} (${voiceName})...`)
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
    console.log('Fixing Missing Debates...')

    const { data: existingDebates } = await supabase
        .from('debates')
        .select('topic')

    const existingTopics = new Set(existingDebates?.map(d => d.topic) || [])

    let successCount = 0

    for (const debate of DEBATES) {
        let needsInsert = !existingTopics.has(debate.title)

        // Special check for duplicate title debate
        if (debate.id === 6) {
            // 'Is Your AI Lying to You Right Now?'
            const count = existingDebates?.filter(d => d.topic === debate.title).length || 0
            if (count < 2) needsInsert = true
        }

        if (!needsInsert) {
            console.log(`Skipping Debate ${debate.id}: ${debate.title} (Already Exists in DB)`)
            continue
        }

        console.log(`\nProcessing Missing Debate ${debate.id}: ${debate.title}`)
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

            // Extract AI names from pairing "Claude vs GPT-4o"
            const [aiA, aiB] = debate.pairing.split(' vs ').map(s => s.trim())

            const { data: insertData, error } = await supabase
                .from('debates')
                .insert({
                    topic: debate.title,
                    description: debate.pairing,
                    // No valid SLUG column
                    status: 'active',
                    rounds: rounds,
                    created_at: new Date().toISOString(),
                    // REQUIRED FIELDS
                    category: 'Technology',
                    tags: ['AI', 'Future', 'Tech'],
                    ai_a_name: aiA,
                    ai_b_name: aiB,
                    ai_a_id: AI_IDS[aiA] || 'gpt-4o',
                    ai_b_id: AI_IDS[aiB] || 'gpt-4o',
                    total_votes: 0,
                    view_count: 0,
                    ai_a_votes: 0,
                    ai_b_votes: 0,
                    controversy_score: 0,
                    trending_score: 0,
                    share_count: 0
                })
                .select()

            if (error) {
                console.error(`DB Insert Error for ${debate.title}:`, error)
            } else {
                console.log(`SUCCESS: Debate ${debate.id} Live. ID:`, insertData?.[0]?.id)
                successCount++
            }
        }
    }

    console.log(`FIX COMPLETE. Inserted ${successCount} debates.`)
}

main().catch(console.error)
