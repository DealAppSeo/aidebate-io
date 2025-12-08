export const ariaFillers = [
    "Let's take a moment to reflect on that point...",
    "An interesting perspective to consider...",
    "That's worth sitting with for a second...",
    "Let me gather the next response...",
    "A thought-provoking stance indeed..."
];

export const getRandomFiller = () =>
    ariaFillers[Math.floor(Math.random() * ariaFillers.length)];
