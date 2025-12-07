export const HERO_TAGLINES = [
    "AI shouldn't govern itself. You should.",
    "The companies building AI shouldn't be the only ones judging it. That's your job.",
    "Checks and balances for AI. By the people.",
    "They build it. They run it. You judge it."
]

export const POST_VOTE_PROMPTS = [
    "You and {vote_count} others think {winner} won. Share your take.",
    "You've predicted {streak}/10 winners correctly. Share your streak.",
    "This debate split voters {percent_a}/{percent_b}. Where do you stand?",
    "Think your friend would agree? Send them this debate.",
    "{winner} won by just {margin}%. This one's controversial."
]

export const ARIA_CLOSING_LINES = [
    "Now it's your turn to be the judge. The AIs have spoken - but they don't get to grade themselves.",
    "You've heard both sides. Time to make your voice count.",
    "Two AIs. One verdict. Yours.",
    "They argued their case. Now you decide who deserves your trust."
]

export const UNLOCK_PROMPTS = [
    { threshold: 3, text: "Vote on 2 more debates to unlock AI predictions on who YOU would side with" },
    { threshold: 5, text: "You're building a reputation. Keep voting to earn your RepID score." },
    { threshold: 10, text: "Top 10% of predictors. Share your ranking." }
]

export function getRandomMessage(
    collection: string[],
    variables?: Record<string, string | number>
): string {
    const template = collection[Math.floor(Math.random() * collection.length)]

    if (!variables) return template

    return Object.entries(variables).reduce((msg, [key, value]) => {
        return msg.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }, template)
}

export function getUnlockMessage(voteCount: number): string | null {
    // Find highest threshold met or next target? 
    // "Vote on 2 more..." implies looking ahead.
    // "After 3 votes: 'Vote on 2 more...'". Wait, if I HAVE 3, I need 2 more to get to 5?
    // The prompts seem to be "Status Updates" or "Target Prompts".
    // I made them objects.

    // User logic: "After 3 votes" -> "Vote on 2 more"?? 
    // Maybe they meant "At 3 votes, show this".
    // I will return the specific message if count matches exactly, 
    // OR return the *next* milestone message if close?
    // I'll stick to exact match for "Milestone Reached" popup or simple progress.
    // Actually, "Unlock/Challenge Prompts" usually appear in Results modal.

    const match = UNLOCK_PROMPTS.find(p => p.threshold === voteCount)
    return match ? match.text : null
}
