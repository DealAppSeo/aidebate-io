
import { useState, useCallback, useRef, useEffect } from 'react'
import { EngagementEvent } from '@/lib/aria'

export function useEngagement() {
    const [engagementId, setEngagementId] = useState<string | null>(null)
    const engagementIdRef = useRef(engagementId)

    useEffect(() => {
        engagementIdRef.current = engagementId
    }, [engagementId])

    const trackEvent = useCallback(async (eventType: string, data: EngagementEvent) => {
        try {
            const body = {
                ...data,
                type: eventType,
                engagementId: engagementIdRef.current // Use ref to avoid dependency cycle
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
    }, []) // Stable identity

    return { trackEvent }
}

