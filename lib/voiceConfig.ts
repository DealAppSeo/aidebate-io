export const AI_VOICES = {
    claude: { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Antoni', style: 'confident philosopher' },
    gpt4o: { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', style: 'confident executive' },
    grok: { voiceId: 'pFZP5JQG7iQjIQuC4Bku', name: 'Adam', style: 'edgy provocateur' },
    gemini: { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', style: 'analytical scientist' },
    aria: { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', style: 'warm host' }
} as const;

export type VoiceKey = keyof typeof AI_VOICES;

export const VOICE_SETTINGS = {
    stability: 0.45,
    clarity: 0.95,
    style: 0.2
};

export function getVoiceForModel(modelName: string): string {
    const lower = modelName.toLowerCase();
    if (lower.includes('claude')) return AI_VOICES.claude.voiceId;
    if (lower.includes('gpt')) return AI_VOICES.gpt4o.voiceId;
    if (lower.includes('grok')) return AI_VOICES.grok.voiceId;
    if (lower.includes('gemini')) return AI_VOICES.gemini.voiceId;
    if (lower.includes('deepseek')) return AI_VOICES.gemini.voiceId; // Fallback to Rachel for DeepSeek
    if (lower.includes('aria')) return AI_VOICES.aria.voiceId;
    return AI_VOICES.gpt4o.voiceId;
}

export const ariaIntros = [
    "Welcome to AI Debate—where you rate the machines for a fair future.",
    "AI debating AI ethics. Ironic? Maybe. Important? Definitely.",
    "Can AI be ethical? Can it learn empathy? Your vote decides.",
    "Three AIs. One question. You're the judge.",
    "AI rates you every day. Now you rate it back."
];

export const ariaOutros = [
    "The debate is over. But the question remains... who convinced you?",
    "Three perspectives. One vote. Make it count.",
    "AI made its case. Now it's your turn to judge.",
    "Who won? Only you can decide.",
    "Your vote shapes how AI learns trust. Choose wisely."
];

export const missionCTAs = [
    { headline: "Your Vote Keeps AI Safe", subtext: "Every rating builds trustworthy AI for everyone", button: "Vote Another Debate →" },
    { headline: "AI Rates You Daily", subtext: "Credit scores. Insurance. Hiring. Now you rate it back.", button: "Keep Judging →" },
    { headline: "Can AI Learn Empathy?", subtext: "Watch. Vote. Shape the answer.", button: "Explore More →" },
    { headline: "Democracy for AI", subtext: "You decide what ethical AI looks like.", button: "Continue Voting →" }
];
