export const ARIA_BUFFER_MESSAGES = [
    "Harmonizing the voices... just a moment!",
    "Tuning the symphony for clarity...",
    "The AIs are gathering their thoughts...",
    "Syncing perspectives... almost there!",
    "A brief intermission while we connect...",
];

export const getRandomAriaMessage = () => {
    return ARIA_BUFFER_MESSAGES[Math.floor(Math.random() * ARIA_BUFFER_MESSAGES.length)];
};
