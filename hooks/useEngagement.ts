import { useState, useCallback } from 'react'
import { EngagementEvent } from '@/lib/aria'

export function useEngagement() {
    const [engagementId, setEngagementId] = useState<string | null>(null)

    const trackEvent = useCallback(async (eventType: string, data: EngagementEvent) => {
        try {
            const body = {
                type: eventType,
                data,
                engagement_id: engagementId // Include ID if we have it
            }

            const response = await fetch('/api/engagement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            const json = await response.json()

            // If starting a debate, save the returned ID
            if (eventType === 'debate_started' && json.id) {
                setEngagementId(json.id)
            }
        } catch (error) {
            console.error('Failed to track engagement:', error)
        }
    }, [engagementId])

    return { trackEvent }
}
