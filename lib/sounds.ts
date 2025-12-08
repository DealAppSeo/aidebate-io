export const UI_SOUNDS = {
    transition: '/audio/ui/transition_soft.mp3',
    newRound: '/audio/ui/transition_chime.mp3',
    results: '/audio/ui/results_reveal.mp3',
    vote: '/audio/ui/vote_pop.mp3',
    badge: '/audio/ui/badge_unlock.mp3'
};

export const playUISound = (sound: keyof typeof UI_SOUNDS, volume = 0.3) => {
    if (typeof window === 'undefined') return;

    if (localStorage.getItem('uiSounds') === 'false') return;

    const audio = new Audio(UI_SOUNDS[sound]);
    audio.volume = volume;
    audio.play().catch(() => { }); // Silent fail if blocked
};
