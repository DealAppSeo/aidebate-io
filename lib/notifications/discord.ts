const DISCORD_WEBHOOK_OPS = process.env.DISCORD_WEBHOOK_OPS
const DISCORD_WEBHOOK_PUBLIC = process.env.DISCORD_WEBHOOK_PUBLIC

interface DiscordEmbed {
    title: string
    description?: string
    color: number
    fields?: { name: string; value: string; inline?: boolean }[]
    timestamp?: string
    footer?: { text: string }
}

export async function sendDiscordNotification(
    webhook: string | undefined, // Allow undefined to fail gracefully if env not set
    content: string,
    embed?: DiscordEmbed
) {
    if (!webhook) return;

    try {
        await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                embeds: embed ? [embed] : undefined
            })
        })
    } catch (e) {
        console.error("Failed to send Discord notification", e)
    }
}

export const DiscordNotifications = {

    // Ops Alerts
    async scalingEvent(event: any) {
        const colors: Record<string, number> = {
            scale_up: 0x22C55E,    // Green
            scale_down: 0x3B82F6,  // Blue
            failover: 0xF59E0B,    // Yellow
            rate_limit: 0xEF4444   // Red
        }

        await sendDiscordNotification(DISCORD_WEBHOOK_OPS, '', {
            title: `⚡ ${event.event_type.toUpperCase()}`,
            description: event.trigger_reason,
            color: colors[event.event_type] || 0x666666,
            fields: [
                { name: 'Queue Depth', value: String(event.queue_depth || 0), inline: true },
                { name: 'Status', value: event.success ? '✅ Success' : '❌ Failed', inline: true }
            ],
            timestamp: new Date().toISOString()
        })
    },

    async costAlert(currentCost: number, limit: number) {
        const percent = (currentCost / limit * 100).toFixed(0)
        await sendDiscordNotification(DISCORD_WEBHOOK_OPS,
            `🚨 **COST ALERT**: $${currentCost.toFixed(2)}/${limit} (${percent}%) hourly budget used`,
            {
                title: 'Budget Warning',
                color: currentCost > limit * 0.9 ? 0xEF4444 : 0xF59E0B,
                fields: [
                    { name: 'Current', value: `$${currentCost.toFixed(2)}`, inline: true },
                    { name: 'Limit', value: `$${limit.toFixed(2)}`, inline: true },
                    { name: 'Action', value: 'Routing to cheaper providers', inline: true }
                ],
                timestamp: new Date().toISOString()
            }
        )
    },

    async agentDown(agentId: string, lastSeen: string) {
        await sendDiscordNotification(DISCORD_WEBHOOK_OPS,
            `🔴 **AGENT DOWN**: ${agentId} - Last heartbeat: ${lastSeen}`,
            {
                title: `Agent ${agentId} Offline`,
                color: 0xEF4444,
                description: 'Attempting automatic restart...',
                timestamp: new Date().toISOString()
            }
        )
    },

    // Public Feed
    async debateCompleted(debate: any, votes: { a: number, b: number }) {
        const winner = votes.a > votes.b ? debate.ai_a_name : (votes.b > votes.a ? debate.ai_b_name : 'Tie')
        const total = votes.a + votes.b

        await sendDiscordNotification(DISCORD_WEBHOOK_PUBLIC, '', {
            title: `🎯 Debate Complete: ${debate.topic}`,
            color: 0x8B5CF6,
            fields: [
                { name: debate.ai_a_name, value: `${votes.a} votes (${total > 0 ? (votes.a / total * 100).toFixed(0) : 0}%)`, inline: true },
                { name: debate.ai_b_name, value: `${votes.b} votes (${total > 0 ? (votes.b / total * 100).toFixed(0) : 0}%)`, inline: true },
                { name: '🏆 Winner', value: winner, inline: false }
            ],
            footer: { text: 'Vote on the next debate at aidebate.io' },
            timestamp: new Date().toISOString()
        })
    },

    async milestoneReached(milestone: string, value: number) {
        await sendDiscordNotification(DISCORD_WEBHOOK_PUBLIC,
            `🎉 **MILESTONE**: ${milestone}!`,
            {
                title: milestone,
                color: 0xFBBF24,
                description: `AIDebate.io just hit ${value.toLocaleString()}!`,
                timestamp: new Date().toISOString()
            }
        )
    }
}
