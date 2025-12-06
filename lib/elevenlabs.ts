// ElevenLabs TTS API wrapper
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export const VOICE_IDS = {
    claude: 'pNInz6obpgDQGcFmaJgB', // Adam - thoughtful
    gpt: 'ErXwobaYiN019PkySvjV', // Antoni - confident
    grok: 'VR6AewLTigWG4xSOukaG', // Arnold - bold
    gemini: 'EXAVITQu4vr4xnSDxMaL', // Rachel - balanced
    facilitator: 'MF3mGyEYCl7XYWbV9V6O', // Elli - neutral NPR
}

export async function generateSpeech(
    text: string,
    voiceId: string
): Promise<ArrayBuffer> {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY!,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        }
    )

    if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    return response.arrayBuffer()
}

export function getVoiceIdForAI(aiName: string): string {
    const name = aiName.toLowerCase()
    if (name.includes('claude')) return VOICE_IDS.claude
    if (name.includes('gpt')) return VOICE_IDS.gpt
    if (name.includes('grok')) return VOICE_IDS.grok
    if (name.includes('gemini')) return VOICE_IDS.gemini
    return VOICE_IDS.facilitator
}
