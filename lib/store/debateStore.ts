import { create } from 'zustand';

interface DebateState {
    debate: any | null;
    isLoading: boolean;
    error: string | null;

    rounds: any[];
    currentRoundIndex: number;

    isPlaying: boolean;
    progress: number; // Current playback time
    duration: number; // Current round duration
    playbackSpeed: number;

    userPrediction: string | null;
    userVote: string | null;

    // Actions
    setDebate: (debate: any) => void;
    setRounds: (rounds: any[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    setPlaying: (playing: boolean) => void;
    setCurrentRound: (index: number) => void;
    setProgress: (time: number, duration: number) => void;
    setPlaybackSpeed: (speed: number) => void;

    nextRound: () => void;
    prevRound: () => void;

    setPrediction: (id: string) => void;
    setVote: (id: string) => void;
}

export const useDebateStore = create<DebateState>((set, get) => ({
    debate: null,
    isLoading: false,
    error: null,

    rounds: [],
    currentRoundIndex: 0,

    isPlaying: false,
    progress: 0,
    duration: 0,
    playbackSpeed: 1.0,

    userPrediction: null,
    userVote: null,

    setDebate: (debate) => set({ debate }),
    setRounds: (rounds) => set({ rounds }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    setPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentRound: (currentRoundIndex) => set({ currentRoundIndex, progress: 0 }),
    setProgress: (progress, duration) => set({ progress, duration }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

    nextRound: () => {
        const { currentRoundIndex, rounds } = get();
        if (currentRoundIndex < rounds.length - 1) {
            set({ currentRoundIndex: currentRoundIndex + 1, progress: 0 });
        }
    },
    prevRound: () => {
        const { currentRoundIndex } = get();
        if (currentRoundIndex > 0) {
            set({ currentRoundIndex: currentRoundIndex - 1, progress: 0 });
        }
    },

    setPrediction: (userPrediction) => set({ userPrediction }),
    setVote: (userVote) => set({ userVote })
}));
