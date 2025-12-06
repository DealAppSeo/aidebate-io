export const REPID_REWARDS = {
    VOTE: 10,
    STREAK_BONUS_PER_DAY: 2,
    STREAK_MAX_BONUS: 10,
    EARLY_ACCURACY: 3,
    SHARE_CLICK: 5,
    SHARE_CONVERSION_BASE: 15,
    SHARE_CONVERSION_MAX: 35,
    QUESTION_RATING: 2,
};

export function calculateStreakBonus(days: number): number {
    return Math.min(days * REPID_REWARDS.STREAK_BONUS_PER_DAY, REPID_REWARDS.STREAK_MAX_BONUS);
}

export function calculateShareBonus(): number {
    const base = REPID_REWARDS.SHARE_CONVERSION_BASE;
    const random = Math.floor(Math.random() * 16); // 0-15
    const isJackpot = Math.random() < 0.05; // 5% chance
    return isJackpot ? REPID_REWARDS.SHARE_CONVERSION_MAX : base + random;
}

export function getTier(repid: number): { name: string; color: string } {
    if (repid >= 1000) return { name: "Guardian", color: "text-neon-cyan" };
    if (repid >= 500) return { name: "Arbiter", color: "text-neon-gold" };
    if (repid >= 100) return { name: "Voter", color: "text-neon-pink" };
    return { name: "Observer", color: "text-muted-foreground" };
}
