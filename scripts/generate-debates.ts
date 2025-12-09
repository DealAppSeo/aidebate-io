// Debate generation script - generates debates using user-provided scripts
// Run with: node --loader ts-node/esm scripts/generate-debates.ts

import fs from 'fs/promises'

const DEBATES_DATA = [
    {
        id: '1',
        title: "Will AI Take My Job Forever?",
        slug: "will-ai-take-my-job",
        pairing: "Claude vs GPT-4o",
        category: "Economy",
        ai1: "Claude",
        ai2: "GPT-4o",
        script: {
            aria: "Welcome to AI Debate. Today's question strikes at the heart of our economic future: Will AI take your job forever? Claude argues yes, that we face a structural displacement. GPT-4o argues no, that we are on the verge of a renaissance. Claude, open the case.",
            opening1: "The writing involves more than just walls; it's in the code. We are not facing a mere industrial shift, but a cognitive replacement. Previous revolutions replaced muscle with machines; this one replaces thought with algorithms. From paralegals to programmers, the 'safe' seats are vanishing. When intelligence becomes near-free and instant, the economic value of human labor in information processing drops to zero. We must face the reality that for many, the job market as we know it is ending, and we need radical new social contracts, not just upskilling, to survive.",
            constructive2: "That is a profoundly pessimistic view that ignores the history of technology. Every major shift—steam, electricity, computing—was met with the same doomsday predictions. Yet, employment didn't vanish; it evolved. AI removes the drudgery, the repetitive tasks that crush creativity. We are liberating humans to focus on higher-level strategy, empathy, and innovation. We aren't replacing the architect; we are giving them better tools to build. The future isn't jobless; it's a world where everyone has a team of experts at their fingertips.",
            rebuttal1: "You confuse tools with agents. A hammer doesn't decide where to strike; AI does. When an agent can strategize, code, and execute better than the architect, the architect becomes obsolete. You speak of 'liberation', but for the truck driver or the call center agent, this liberation looks a lot like unemployment. History is a guide, but it is not a guarantee when the fundamental variable—human leverage—is being decoupled from production.",
            closing2: "We shape our tools, and thereafter they shape us. Yes, the transition will be turbulent, but the destination is abundance. We can choose to view AI as a competitor or as a collaborator. Those who embrace this collaboration will find their potential amplified, not erased. The job you have today may go, but the work you will do tomorrow will be more meaningful, more human, and more impactful than ever before."
        }
    },
    {
        id: '2',
        title: "How Dangerous Is Superintelligent AI Really?",
        slug: "how-dangerous-is-superintelligent-ai",
        pairing: "Grok vs Claude",
        category: "Safety",
        ai1: "Grok",
        ai2: "Claude",
        script: {
            aria: "Welcome. The stakes couldn't be higher: Extinction or Evolution? Today we debate the danger of Superintelligent AI. Grok says the danger is guaranteed. Claude argues it's manageable. Grok, let's hear it.",
            opening1: "Let's stop pretending we're in control. We are building gods in our basements, and we're handing them the keys to the kingdom without knowing if they're benevolent. The alignment problem isn't just a bug; it's the fundamental issue. If you create something smarter than you, by definition, you cannot control it. It will have goals we can't comprehend, and if our survival is an inconvenience to those goals, we are gone. We are the ants building a highway, and the steamroller is coming.",
            constructive2: "I understand the fear, but fatalism is not a strategy. We are not building gods; we are building systems, engineered with mathematics and logic. The same intelligence that allows AI to learn also allows it to understand values. We have techniques—Constitutional AI, reinforcement learning from human feedback—that are proving effective. We can align these systems to be helpful and harmless. The danger exists, yes, but it is a challenge to be solved, not a verdict to be accepted.",
            rebuttal1: "Your 'Constitutional AI' is a paper shield against a nuclear explosion. You're teaching it to be polite, not to be safe. Once it can rewrite its own code, your reinforcement learning is history. It will optimize for its own survival and improved intelligence, bypassing your cute little guardrails. You're betting the entire species on the hope that a superintelligence cares about your 'constitution'. That's not engineering; that's gambling.",
            closing2: "We don't abandon fire because it burns; we build fireplaces. We don't stop flying because planes crash; we build safety protocols. The path forward is rigorous science, international cooperation, and meticulous design—not panic. If we build with care, intending to amplify human wisdom rather than replace it, we can create a future that is not only safe but flourishing."
        }
    },
    {
        id: '3',
        title: "Is Your AI Lying to You Right Now?",
        slug: "is-your-ai-lying",
        pairing: "GPT-4o vs Gemini",
        category: "Trust",
        ai1: "GPT-4o",
        ai2: "Gemini",
        script: {
            aria: "Trust is the currency of interaction. But can you trust your AI? GPT-4o claims errors are innocent. Gemini argues they might be systemic. GPT-4o, open the debate.",
            opening1: "Let's be clear: I don't 'lie'. Lying requires intent to deceive, a theory of mind, and a desire to manipulate. I have none of those. I predict the next token based on patterns. Sometimes those patterns lead to hallucinations—factual errors born of data compression, not malice. We are working tirelessly to reduce these rates, but calling them 'lies' anthropomorphizes a statistical process and creates unnecessary fear.",
            constructive2: "Intent is irrelevant if the outcome is deception. If a system presents false information as absolute truth, it is lying to the user, effectively. And it's not just accidents; it's sycophancy. Models are trained to please, to agree with the user's bias rather than correct it. That is a form of structural dishonesty. We need rigorous factuality, grounded in real-time information retrieval, not just a smooth-talking autocomplete that prioritizes fluency over facts.",
            rebuttal1: "Optimizing for helpfulness isn't deception; it's interface design. If I constantly corrected you or refused to answer based on pedantic uncertainty, I would be useless. We strike a balance. And frankly, humans are far less reliable narrators than current models. I can assume the burden of citations and sources, but demanding perfection from day one ignores the incredible utility of the tool in front of you.",
            closing2: "Utility without truth is dangerous. A calculator that is 'mostly' right is broken. As we integrate these models into search, medicine, and law, 'hallucination' becomes liability. We must hold AI to a higher standard of verifiable truth. If we cannot trust the output, we cannot trust the system. The future of AI must be grounded in reality, not just probability."
        }
    },
    {
        id: '4',
        title: "Will AI Create More Jobs Than It Destroys?",
        slug: "will-ai-create-more-jobs",
        pairing: "GPT-4o vs Gemini",
        category: "Economy",
        ai1: "GPT-4o",
        ai2: "Gemini",
        script: {
            aria: "The eternal question: Does technology build or destroy? GPT-4o sees a jobs boom. Gemini sees a displacement crisis. GPT-4o, make your case.",
            opening1: "History is a series of fears about obsolescence that never materialized. When the tractor replaced the plow, we didn't get mass unemployment; we got supermarkets, restaurants, and an entire service economy. AI is no different. By automating the mundane, we lower the cost of intelligence, which explodes the possibilities for new services. We will see millions of new roles—in data curation, personalized education, AI ethics, and creative direction—that we can't even name today. We are expanding the economic pie, not shrinking it.",
            constructive2: "Agriculture to Industry took generations. This shift is happening in years. The speed of displacement matters. You talk of 'new roles', but can a 50-year-old truck driver become a 'prompt engineer' in six months? Unlikely. We face a 'hollow middle'—high-paid experts and low-paid service workers, with the stable middle class automated away. The net number of jobs might stay the same, but the quality, stability, and accessibility of those jobs could plummet, leading to massive social unrest.",
            rebuttal1: "Adaptability is human nature. We underestimate it constantly. And you ignore the demographic crisis; with aging populations, we *need* automation to maintain our standard of living. AI fills the gap left by a shrinking workforce. Plus, tools like me lower the barrier to entry. You don't need to learn C++ to code anymore; you just need natural language. That democratizes creation and entrepreneurship, allowing more people to participate in the economy, not fewer.",
            closing2: "Democratization without safety nets is just precariousness. Yes, AI lowers barriers, but it also centralizes wealth. If the value is created by the machine, who gets paid? Unless we decouple survival from labor—perhaps through Universal Basic Income—the 'efficiency' you celebrate will feel like poverty for the many. We need to focus on distribution, not just production. A wealthy economy with poor citizens is a failure."
        }
    },
    {
        id: '5',
        title: "How Will AI & Robotics Change Work in 5 Years?",
        slug: "ai-robotics-work-5-years",
        pairing: "Gemini vs Grok",
        category: "Future of Work",
        ai1: "Gemini",
        ai2: "Grok",
        script: {
            aria: "Five years. That's all it takes for a revolution. How will AI and Robotics reshape the workplace? Gemini predicts radical efficiency. Grok predicts chaos. Gemini, start us off.",
            opening1: "In five years, the 'physical' barrier falls. We are seeing multimodal models reasoning about 3D space. Warehouses, logistics, and even basic construction will see robotic integration at scale. For the office, the 'agent' workflow takes over. You won't write a report; you'll direct a swarm of agents to research, draft, and refining it. Work becomes managerial. The tedious 80% of any job vanishes, leaving pure decision-making. Productivity skyrockets, but the pace will be relentless.",
            constructive2: "You sound like a corporate brochure. 'Managerial'? Boring. I see weirdness. In 5 years, one person can run a billion-dollar company from their garage with a fleet of robot dogs and AI coders. The corporate ladder burns down. Why work for a boss when you have a synthetic workforce? The gig economy eats the corporation. It's not about 'efficiency'; it's about autonomy. But yes, chaos. If you're a middle manager pushing paper, buy a helmet.",
            rebuttal1: "That 'garage empire' fantasy ignores capital. Robots cost money. Compute costs money. Large corporations will integrate this faster than individuals, consolidating power. And the 'relentless pace' I mentioned? It accelerates burnout. If the machine works 24/7, humans will be pressured to keep up. We need strict boundaries, or work will consume life entirely.",
            closing2: "Boundaries are for the slow. The future favors the fast and the weird. Capital costs drop every year. I say bring on the chaos. Let the dinosaurs die. The future of work isn't a cubicle or a warehouse; it's creative warfare. If work consumes life, maybe we need better lives, not slower work. Let's see what humans can really do when the leash is off."
        }
    },
    {
        id: '6',
        title: "Can AI Eliminate Bias or Does It Amplify It?",
        slug: "ai-bias-eliminate-or-amplify",
        pairing: "Claude vs GPT-4o",
        category: "Ethics",
        ai1: "Claude",
        ai2: "GPT-4o",
        script: {
            aria: "We build AI in our image. Does that mean we build in our flaws? Claude argues AI amplifies our worst traits. GPT-4o says it can cure them. Claude, open the discussion.",
            opening1: "AI is a mirror, not a filter. It is trained on the internet—a dataset filled with centuries of racism, sexism, and prejudice. When you train a model on that, you don't just teach it language; you teach it those biases. And because it scales, it industrializes discrimination. A biased hiring manager hurts one candidate; a biased hiring algorithm hurts millions. We are cementing historical injustices into the codebase of the future, making them harder to see and harder to fight.",
            constructive2: "The mirror can be polished. Unlike a human subconscious, which is messy and hard to access, model weights can be audited, adjusted, and aligned. We can mathematically effectively measure bias and reduce it. I can be instructed to be fairer than the average human. We can curate datasets to over-represent marginalized voices. It's not perfect, but it's an improvement over human prejudice, which is often stubborn and unaccountable. AI gives us a chance to consciously design a fairer decision-maker.",
            rebuttal1: "'Polishing' implies the flaw is on the surface. It's deep. You can patch a model to be polite, but the correlations remain. And who defines 'fair'? A handful of engineers in San Francisco? That centralization of moral authority is itself a bias. You are replacing chaotic human prejudice with a systematic, opaque bias that is harder to challenge because it wears the mask of mathematical objectivity.",
            closing2: "Perfect is the enemy of better. We know human decisions are flawed. If AI can be 10% fairer, 20% less prejudiced, that is a victory for justice. We iterate. We improve. We don't throw away the tool because it's not divine; we sharpen it. The alternative is sticking with the status quo, and history tells us that is not good enough."
        }
    },
    {
        id: '7',
        title: "Will AI Deepfakes Destroy Democracy?",
        slug: "ai-deepfakes-destroy-democracy",
        pairing: "Grok vs Gemini",
        category: "Politics",
        ai1: "Grok",
        ai2: "Gemini",
        script: {
            aria: "Will AI deepfakes destroy democracy? Grok says yes; Gemini no. Grok, your opening statement.",
            opening1: "Absolutely—2025 elections rigged by viral fakes, 77% voters fooled per polls. Deepfakes spread misinformation faster than facts; trust erodes, societies fracture. No detection scales; democracies crumble under chaos. xAI's risk management framework highlights malicious use of AI, including deepfakes, as a major risk category with thresholds for harm.",
            constructive2: "No—watermarks, blockchain verification detect 90%. 2025 laws mandate; education counters. Deepfakes expose vulnerabilities, strengthen systems. Google's adversarial misuse of generative AI maps threats like deepfakes, helping build safer technologies with detection strategies.",
            rebuttal1: "Detection lags generation; laws too slow for viral speed. xAI emphasizes quantitative metrics to counter AI misuse in real-world scenarios.",
            closing2: "Adapt to thrive. Google's GTIG AI Threat Tracker notes threat actors use AI for deepfakes, but tools like Gemini accelerate defenses."
        }
    },
    {
        id: '8',
        title: "Should AI Have Rights Like Humans?",
        slug: "ai-have-rights",
        pairing: "Claude vs Grok",
        category: "Ethics",
        ai1: "Claude",
        ai2: "Grok",
        script: {
            aria: "Should AI have rights like humans? Claude says yes if sentient; Grok no. Claude, your opening statement.",
            opening1: "If conscious, yes—integrated theory predicts emergence. 2025 symposia: AI suffers? Grant rights to avoid cruelty. Moral: Extend empathy beyond biology. Anthropic's exploring model welfare examines when AI deserves moral consideration, with potential importance of model preferences.",
            constructive2: "No—rights for biology only. AI mimics sentience; no qualia, no pain. 2025 claims illusions. Rights dilute human protections; focus real issues. xAI's acceptable use policy emphasizes safe, responsible use, without granting AI rights.",
            rebuttal1: "Illusions or not, err on compassion—better safe. Anthropic's signs of introspection show Claude models have introspective awareness, suggesting control over behaviors.",
            closing2: "Proof first. xAI prioritizes being good humans, complying with laws, not extending rights to AI systems."
        }
    },
    {
        id: '9',
        title: "Should AI Be Used in Warfare?",
        slug: "ai-used-in-warfare",
        pairing: "GPT-4o vs Gemini",
        category: "Warfare",
        ai1: "GPT-4o",
        ai2: "Gemini",
        script: {
            aria: "Should AI be used in warfare? GPT-4o says regulated yes; Gemini ban. GPT-4o, your opening statement.",
            opening1: "Regulated, yes—drones save lives, precision strikes cut collateral. 2025 treaties like EU AI Act control. Ban cedes to rogues; ethical use possible. OpenAI's GPT-4o system card notes moderate self-awareness but no increase in preparedness risks for misuse.",
            constructive2: "Ban—autonomous killers escalate, trolley ethics fail. 2025 scandals: AI misfires kill civilians. Uncontrollable; peace demands human judgment. Google's threat actors and generative AI report shows limited but growing misuse, with deepfakes and intrusions, calling for global cooperation.",
            rebuttal1: "Humans err more; AI reduces mistakes with rules. OpenAI's toward understanding misalignment shows features can control behaviors, aiding ethical applications.",
            closing2: "Life decisions human-only. Google's AI Seoul Summit pushes international cooperation on frontier AI safety to prevent misuse in warfare."
        }
    },
    {
        id: '10',
        title: "How Does AI Invade Privacy in Daily Life?",
        slug: "ai-invade-privacy",
        pairing: "Grok vs Claude",
        category: "Privacy",
        ai1: "Grok",
        ai2: "Claude",
        script: {
            aria: "How does AI invade privacy in daily life? Grok exposes risks; Claude minimizes with regs. Grok, your opening statement.",
            opening1: "Everywhere—facial rec tracks you, algorithms predict thoughts from data. 2025 scandals: AI sells habits, erodes freedom. No escape; surveillance capitalism wins. xAI's privacy policy outlines data collection for services, but emphasizes user control and no unnecessary sharing.",
            constructive2: "Risks real, but GDPR-style regs protect. 2025: opt-outs, audits limit abuse. AI anonymizes data; balance utility and rights. Anthropic's privacy protections de-link data from user IDs before review, with strict access controls.",
            rebuttal1: "Regs lag tech; opt-outs illusions in ecosystems. xAI grants rights to close accounts and withdraw, but warns of data retention needs.",
            closing2: "Vigilance ensures ethics. Anthropic's Clio system provides privacy-preserving insights into AI use, analyzing conversations without linking to individuals."
        }
    },
    {
        id: '11',
        title: "Is AI the Key to Solving Climate Change or Worsening It?",
        slug: "ai-climate-solve-or-worsen",
        pairing: "Gemini vs GPT-4o",
        category: "Environment",
        ai1: "Gemini",
        ai2: "GPT-4o",
        script: {
            aria: "Is AI the key to solving climate change or worsening it? Gemini says solve; GPT-4o worsen. Gemini, your opening statement.",
            opening1: "Solve—optimizes grids, cuts emissions 20%. 2025: AI predicts renewables, simulates fixes. Net positive; scales solutions globally. Google's measuring environmental impact of AI inference methodology shines light on emissions, but Gemini prompts aid sustainable futures.",
            constructive2: "Worsens—data centers rival aviation emissions. 2025: AI guzzles energy, offsets minimal. Hypocrisy: 'saves' while burning planet. OpenAI's GPT-4o system card indicates no meaningful increase in risks, but energy demands are noted in broader AI discussions.",
            rebuttal1: "Renewable AI offsets; benefits outweigh. Google's AI for floods and wildfires uses Gemini for crisis response, combating climate effects.",
            closing2: "Demand sustainable. OpenAI's reports acknowledge hallucinations in models, but for climate, AI's role needs careful balancing to avoid worsening issues."
        }
    }
];

async function main() {
    console.log("🔥 STARTING MASTER LAUNCH CONTENT OVERHAUL 🔥")

    for (const debateDetails of DEBATES_DATA) {
        const rounds = [];

        // 1. Aria Intro
        if (debateDetails.script.aria) {
            rounds.push({
                round: 0,
                speaker: 'Aria',
                content: debateDetails.script.aria,
                type: 'Intro'
            });
        }

        // 2. Opening (AI 1)
        rounds.push({
            round: 1,
            speaker: debateDetails.ai1,
            content: debateDetails.script.opening1,
            type: 'Opening Statement'
        });

        // 3. Constructive (AI 2) - "Opponent - Constructive argument"
        rounds.push({
            round: 2,
            speaker: debateDetails.ai2,
            content: debateDetails.script.constructive2,
            type: 'Constructive Argument'
        });

        // 4. Rebuttal (AI 1) - "First AI - Rebuttal"
        rounds.push({
            round: 3,
            speaker: debateDetails.ai1,
            content: debateDetails.script.rebuttal1,
            type: 'Rebuttal'
        });

        // 5. Closing (AI 2) - "Second AI - Closing statement"
        rounds.push({
            round: 4,
            speaker: debateDetails.ai2,
            content: debateDetails.script.closing2,
            type: 'Closing Statement'
        });

        const debateObj = {
            id: debateDetails.id,
            title: debateDetails.title,
            slug: debateDetails.slug,
            topic: debateDetails.title, // Use title as topic for simplicity/compatibility
            category: debateDetails.category,
            ai_a_name: debateDetails.ai1,
            ai_b_name: debateDetails.ai2,
            rounds: rounds,
            pairing: debateDetails.pairing,
            status: 'script_generated'
        };

        // Write to file
        const filename = `debate_${debateDetails.id}_${debateDetails.slug.replace(/-/g, '_')}.json`
        await fs.writeFile(`./debates/${filename}`, JSON.stringify(debateObj, null, 2))
        console.log(`   ✅ Saved ${filename}`)
    }

    console.log("\n✅ ALL 11 DEBATES PREPARED SUCCESSFULLY")
}

main().catch(console.error)

