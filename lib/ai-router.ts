import Portkey from 'portkey-ai'

// Config
const PROVIDER_PRIORITY = [
    { name: 'groq', model: 'llama-3.1-70b-versatile', costPer1k: 0.0002, envKey: 'GROQ_API_KEY' },
    { name: 'deepseek', model: 'deepseek-chat', costPer1k: 0.001, envKey: 'DEEPSEEK_API_KEY' },
    { name: 'google', model: 'gemini-pro', costPer1k: 0.00025, envKey: 'GEMINI_API_KEY' }, // 'gemini' usually 'google' provider
    { name: 'openai', model: 'gpt-4o-mini', costPer1k: 0.002, envKey: 'OPENAI_API_KEY' },
    { name: 'anthropic', model: 'claude-3-sonnet-20240229', costPer1k: 0.015, envKey: 'ANTHROPIC_API_KEY' }, // Updated model name for sonnet
]

// Initialize Portkey
// We assume PORTKEY_API_KEY is set. 
// If using Gateway mode without Virtual Keys, we might need to pass provider keys in headers or config.
// The SDK handles this if we configure it correctly.
// For now, we'll try to use the 'virtualKey' if the user had one, but they likely don't.
// We will assume standard Gateway usage where we pass the provider setup in the request or rely on env vars if Portkey reads them (it doesn't read local env vars of the server, it reads ITS env vars or headers).
// Actually, passing 'provider' and 'api_key' in the config object is supported in some SDK versions or via the Gateway URL.
// The cleanest way without Virtual Keys is to construct the config per request.

export async function generateText(
    prompt: string,
    systemPrompt: string = "You are a helpful AI assistant."
): Promise<{ text: string, provider: string, cost: number }> {

    // Iterate through providers
    for (const provider of PROVIDER_PRIORITY) {
        try {
            console.log(`[AI Router] Attempting ${provider.name} (${provider.model})...`)

            // Construct request
            // We use a new client or config for each attempt to enforce the provider
            const portkey = new Portkey({
                apiKey: process.env.PORTKEY_API_KEY!,
                // We'll pass provider specifics in the call if possible, or config
            })

            // To route to specific provider via Portkey without Virtual Key, we can use the 'config' parameter
            // to define a single-target "network".
            const response = await portkey.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                config: {
                    provider: provider.name,
                    api_key: process.env[provider.envKey] || '', // Pass the key explicitly if Portkey supports it in config, or we rely on stored Virtual Keys?
                    // NOTE: Passing api_key in config is supported in Portkey Gateway config structure.
                    // If this fails, user might need to setup Virtual Keys.
                    model: provider.model
                }
            })

            const content = response.choices[0]?.message?.content || ''

            // Calculate estimated cost (very rough, just for internal tracking if needed)
            const inputTokens = response.usage?.prompt_tokens || 0
            const outputTokens = response.usage?.completion_tokens || 0
            const totalCost = ((inputTokens + outputTokens) / 1000) * provider.costPer1k

            console.log(`[AI Router] Success via ${provider.name}`)

            return {
                text: content,
                provider: provider.name,
                cost: totalCost
            }

        } catch (error) {
            console.warn(`[AI Router] Failed ${provider.name}:`, error)
            // Continue to next provider
        }
    }

    throw new Error("All AI providers failed")
}
