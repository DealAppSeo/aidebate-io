import { RepIDBreakdown } from "./repid"

export type AriaVariant = 'A' | 'B' | 'C'

export const ARIA_VARIANTS = {
    A: 'energetic',
    B: 'warm',
    C: 'prestige'
}

export function selectAriaVariant(session: any, debateId: string): AriaVariant {
    // Check if user has established preference from past engagement
    if (session?.aria_tone_preference) {
        return session.aria_tone_preference as AriaVariant
    }

    // Demographic-based default (if we have signals)
    const segment = session?.demographic_segment
    let defaultTone: AriaVariant = 'B' // warm = default middle ground

    if (segment === 'young_gamer') defaultTone = 'A'      // energetic
    if (segment === 'business_professional') defaultTone = 'C' // prestige
    if (segment === 'general') defaultTone = 'B'          // warm

    // A/B test: 40% default, 30% each other variant
    const rand = Math.random()
    if (rand < 0.4) return defaultTone
    if (rand < 0.7) return defaultTone === 'A' ? 'B' : 'A'
    return defaultTone === 'C' ? 'B' : 'C'
}

// For round transitions: randomly pick 2-4 rounds to have transitions
export function selectTransitionRounds(): number[] {
    const allRounds = [1, 2, 3, 4, 5, 6]
    // Random shuffle
    for (let i = allRounds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allRounds[i], allRounds[j]] = [allRounds[j], allRounds[i]];
    }

    // Pick 2 to 4
    const count = Math.floor(Math.random() * 3) + 2  // 2, 3, or 4
    return allRounds.slice(0, count).sort((a, b) => a - b)
}

export interface EngagementEvent {
    debate_id: string
    session_id: string
    intro_variant?: string
    prevote_variant?: string
    round?: number
    vote?: string
    dropped_at_round?: number
    rounds_completed?: number
}
