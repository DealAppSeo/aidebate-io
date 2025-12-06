'use client'

import { useState, useEffect } from 'react'

interface UserSession {
    id: string
    session_id: string
    repid_score: number
    debates_watched: number
    debates_voted: number
    correct_predictions: number
    current_streak: number
    longest_streak: number
    badges: string[]
    unlocks: {
        custom_questions: boolean
        insights: boolean
        early_access: boolean
    }
    debates_seen: string[]
}

export function useSession() {
    const [session, setSession] = useState<UserSession | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        initSession()
    }, [])

    async function initSession() {
        // Get or create session_id from localStorage
        let sessionId = localStorage.getItem('aidebate_session_id')

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('aidebate_session_id', sessionId)

            // Create new session in Supabase
            const response = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            })

            const data = await response.json()
            setSession(data.session)
        } else {
            // Fetch existing session
            const response = await fetch(`/api/session?session_id=${sessionId}`)
            const data = await response.json()
            setSession(data.session)
        }

        setLoading(false)
    }

    async function updateSession(updates: Partial<UserSession>) {
        if (!session) return

        const response = await fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: session.session_id,
                ...updates
            })
        })

        const data = await response.json()
        setSession(data.session)
    }

    return { session, loading, updateSession }
}
