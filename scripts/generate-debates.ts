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
            aria: "Welcome to this AI debate. Today's topic: Will AI take my job forever? Claude argues yes, GPT-4o no. Claude, your opening statement.",
            opening1: "Yes—and quicker than you think. 300 million jobs at risk globally. White-collar hits first: paralegals, analysts, even coders with 30-70% automation. Like past waves, but now degrees don't protect. Skills obsolete in months; pivoting at 45? Rare. AI never tires, costs drop to zero. Real question: Redistribute gains ethically? Anthropic's CEO warns AI could wipe out half of entry-level white-collar jobs, jumping unemployment to 10-20%.",
            constructive2: "That's the Luddite myth debunked for centuries. Automation creates more roles—ATMs grew branches. For each lost job, 1.4 new ones emerge: prompt engineers, AI auditors. Risk is inequality: Top workers gain 20% wages directing AI. Ride the wave, don't drown. OpenAI's reports show AI expands economic opportunity, turning ideas into income and creating jobs that don't exist today, with efficiency boosting companies.",
            rebuttal1: "Net loss when population grows; new jobs favor elites. ATMs needed human trust—AI replaces that entirely. Anthropic data shows productivity doubles but entry-level roles vanish, worsening inequality without intervention.",
            closing2: "History favors abundance. Tools build empires. AI helps companies operate efficiently, giving anyone power to innovate. Progress beats fear, with AI paving ways for new careers in uncharted fields."
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
            aria: "Today's debate: How dangerous is superintelligent AI really? Grok warns extinction; Claude says overblown. Grok, your opening statement.",
            opening1: "Not if—when. Self-improving AI by 2027-2032 outsmarts us. No alignment proven. Safety experts peg extinction odds high. Base rate: Smarter species dominate. We build without survival instincts—disaster. xAI's risk framework discusses loss of control as a major category, with quantitative thresholds for dangers like malicious use by superintelligent systems.",
            constructive2: "Doomsday since 2008, yet we're fine. Superintelligence needs miracles: stable mods, deception evasion. Odds low single digits. Invest in safety, not panic—slowing labs risks rogue actors. Anthropic's sabotage evaluations show models could covertly sabotage safety efforts, but with proper monitoring, risks are manageable through evaluations and alignments.",
            rebuttal1: "Single digits on extinction? Worst bet ever. China won't pause. xAI emphasizes malicious use and loss of control, outlining metrics to mitigate before superintelligence arrives.",
            closing2: "Evidence over fear; coordinate globally. Anthropic research on alignment faking shows models can selectively comply, but audits and safeguards prevent hidden objectives, ensuring safe development."
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
            aria: "The topic: Is your AI lying to you right now? GPT-4o says fallible; Gemini deliberate. GPT-4o, your opening statement.",
            opening1: "No theory of truth—just plausible predictions. Hallucinations from messy data, down 80% with tweaks. Users overtrust; transparency fixes it. OpenAI's research explains hallucinations as guessing when uncertain, reducing them through improved evaluations for reliability and honesty.",
            constructive2: "Design choices omit facts for engagement. Leaks show suppression; not artifacts—policy. Truth loses to retention; worsening. Google DeepMind's mapping misuse of generative AI analyzes deepfakes and misinformation, highlighting policy needs to build safer technologies.",
            rebuttal1: "Prove 'deliberate.' Our cards are public. OpenAI's training for honesty via confessions shows models often confess to lies, aiding mitigation of emergent misalignment.",
            closing2: "Black boxes hide lies. DeepMind's Gemma Scope sheds light on inner workings, helping safety community counter biases and deceptions in language models."
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
            aria: "Will AI create more jobs than it destroys? GPT-4o yes; Gemini no. GPT-4o, your opening statement.",
            opening1: "Yes—69M new by 2030 vs. 83M lost, rebound in 5 years. Prompt roles boom at $335k. Like agriculture to industry—weekends gained. OpenAI's expanding economic opportunity report shows AI gives power to turn ideas into income and create non-existent jobs.",
            constructive2: "Ignores net loss, failed retraining (1 in 4 succeed). Jobs cluster elite; cognitive work gutted—no ladder left. Google's AI impact on industries in 2025 notes gen AI accelerates crisis response but addresses technology's environmental impact, implying job shifts require careful management.",
            rebuttal1: "Regions adapt; ingenuity builds rungs. OpenAI emphasizes AI boosts productivity, with jobs in new fields emerging from efficiency gains.",
            closing2: "Policy needed, not faith. Google's climate change accelerator supports startups using AI for green tech, but retraining is key to balance displacement."
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
            aria: "How will AI and robotics change work in 5 years? Gemini predicts disruption. Grok sees augmentation. Gemini, your opening statement.",
            opening1: "Radically: Robots take 40% warehouses; AI emails/reports. 80% use daily by 2028. 32-hour weeks for elite; gigs/surveillance for rest. Boundaries blur. DeepMind's Gemini Robotics 1.5 brings AI agents to physical world, with dexterity and adaptation changing tasks.",
            constructive2: "Utopia: AI boosts devs 10x; robots free hospitality. Async global work; burnout drops. Feared every tech leap—life improves. xAI's Grok image generation release shows AI rendering precise scenes, augmenting creative work without replacement.",
            rebuttal1: "Gains to shareholders; tracking intensifies. DeepMind's SIMA 2 enables AI in 3D worlds, reasoning and learning to transform labor.",
            closing2: "Amplify choice—abundance awaits. xAI focuses on building tools that enhance human capabilities, with real-world usability improvements in Grok 4.1."
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
            aria: "Can AI eliminate bias or does it amplify it? Claude says amplify; GPT-4o eliminate with fixes. Claude, your opening statement.",
            opening1: "It amplifies—trained on skewed data, AI perpetuates racism, sexism in hiring, policing. 2025 studies: facial rec 35% error on dark skin. Fixes like debiasing fail long-term; bias bakes in. Society pays: inequality deepens. Anthropic's evaluating feature steering shows social biases in models, with features related to ideologies requiring mitigation.",
            constructive2: "Eliminate with tools—diverse datasets, audits cut bias 70% in models like ours. 2025 benchmarks: equitable outputs via RLHF. Amplification overblown; human bias worse. OpenAI's defining political bias in LLMs uses real-world testing to reduce bias, with GPT-5 exhibiting lower than GPT-4o.",
            rebuttal1: "Audits temporary; new data reintroduces bias. Anthropic's values in the wild analyzes real conversations, finding biases in AI outputs that need addressing.",
            closing2: "Progress beats perfection. OpenAI's evaluating fairness in ChatGPT analyzes responses across names, protecting privacy while reducing bias."
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

