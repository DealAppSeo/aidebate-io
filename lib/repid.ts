// RepID calculation logic with loot box psychology
export interface RepIDBreakdown {
    base: number
    bonuses: Array<{
        type: string
        amount?: number
        multiplier?: number
    }>
    multiplier: number
    total: number
}

export function calculateRepID(
    vote: 'ai1' | 'ai2' | 'tie',
    prediction: 'ai1' | 'ai2' | null,
    communityResult: { winner: 'ai1' | 'ai2' | 'tie', winnerPercent: number },
    userStreak: number,
    wagered: boolean
): RepIDBreakdown {
    let base = 10
    let bonuses: Array<{ type: string; amount?: number; multiplier?: number }> = []

    if (prediction && prediction === vote) {
        bonuses.push({ type: 'prediction_match', amount: 5 })
    }

    if (vote === communityResult.winner) {
        const communityBonus = 3 + Math.floor(Math.random() * 6)
        bonuses.push({ type: 'community_match', amount: communityBonus })
    }

    if (vote === communityResult.winner && communityResult.winnerPercent < 40) {
        const contrarianBonus = 5 + Math.floor(Math.random() * 11)
        bonuses.push({ type: 'contrarian', amount: contrarianBonus })
    }

    let multiplier = 1
    if (Math.random() < 0.1) {
        multiplier = 1.5 + Math.random() * 0.5
        bonuses.push({ type: 'hot_streak', multiplier })
    }

    if (wagered && prediction === vote) {
        const wagerMult = getWagerMultiplier(userStreak)
        multiplier *= wagerMult
        bonuses.push({ type: 'wager_won', multiplier: wagerMult })
    }

    const total = Math.round((base + bonuses.reduce((sum, b) => sum + (b.amount || 0), 0)) * multiplier)

    return { base, bonuses, multiplier, total }
}

export function getWagerMultiplier(streak: number): number {
    if (streak >= 10) return 5.0
    if (streak >= 5) return 3.0
    if (streak >= 3) return 2.0
    if (streak >= 2) return 1.5
    return 1.0
}

export function updateStreak(currentStreak: number, predictionCorrect: boolean, wagered: boolean): number {
    if (predictionCorrect) return currentStreak + 1
    else if (wagered) return 0
    return currentStreak
}

export function canWager(currentStreak: number): boolean {
    return currentStreak >= 2
}
