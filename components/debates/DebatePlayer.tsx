'use client';

import { useEffect, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { audioEngine } from '@/lib/audioEngine';
import { useDebateStore } from '@/lib/store/debateStore';
import TextReveal from '@/components/TextReveal';
import { SpeakerIndicator } from '@/components/SpeakerIndicator';
import { ClipButton } from '@/components/ClipButton';

interface DebatePlayerProps {
    debateId: string;
    rounds: any[];
    ai1Name: string;
    ai2Name: string;
    topic: string;
    onComplete: () => void;
}

export default function DebatePlayer({
    rounds,
    ai1Name,
    ai2Name,
    onComplete
}: DebatePlayerProps) {
    const {
        isPlaying,
        currentRoundIndex,
        progress,
        duration,
        playbackSpeed,

        setPlaying,
        setCurrentRound,
        setProgress,
        setPlaybackSpeed,
        nextRound,
        prevRound,
        setRounds,

        setError,
        error
    } = useDebateStore();

    const [hasWakeLock, setWakeLock] = useState(false);
    const [audioReady, setAudioReady] = useState(false);

    // Initial Setup
    useEffect(() => {
        setRounds(rounds);
        audioEngine.preloadRounds(rounds);

        // Setup Callbacks
        audioEngine.setCallbacks(
            (t, d) => setProgress(t, d),
            () => {
                // On End
                if (currentRoundIndex < rounds.length - 1) {
                    nextRound(); // Store updates index
                    // Effect below will trigger play of next round
                } else {
                    setPlaying(false);
                    onComplete();
                }
            }
        );

        return () => {
            audioEngine.stop();
        };
    }, []);

    // Wake Lock
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator && isPlaying && !hasWakeLock) {
                try {
                    await navigator.wakeLock.request('screen');
                    setWakeLock(true);
                } catch (err) {
                    console.log('Wake Lock error:', err);
                }
            }
        };
        requestWakeLock();
    }, [isPlaying]);

    // Playback Logic responding to Store Changes
    const lastRoundIndexRef = useRef(currentRoundIndex);
    const lastPlayingRef = useRef(isPlaying);

    useEffect(() => {
        const round = rounds[currentRoundIndex];
        const url = round?.audio_url || round?.ai_a_audio_url || round?.ai_b_audio_url;

        const isNewRound = currentRoundIndex !== lastRoundIndexRef.current;
        lastRoundIndexRef.current = currentRoundIndex;

        const shouldPlay = isPlaying;

        if (url) {
            if (isNewRound) {
                setAudioReady(false);
                audioEngine.load(url, round.id || round.order, shouldPlay)
                    .then(() => setAudioReady(true))
                    .catch(err => {
                        console.error("Audio Load Error", err);
                        setError("Failed to load audio");
                        setPlaying(false);
                    });
            } else if (shouldPlay !== lastPlayingRef.current) {
                // Play state changed
                if (shouldPlay) audioEngine.play();
                else audioEngine.pause();
                lastPlayingRef.current = shouldPlay;
            }
        }
    }, [currentRoundIndex, isPlaying, rounds]);

    // Speed Update
    useEffect(() => {
        audioEngine.setRate(playbackSpeed);
    }, [playbackSpeed]);


    // Controls
    const togglePlay = () => setPlaying(!isPlaying);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * duration;
        audioEngine.seek(time);
        setProgress(time, duration);
    };

    // Gestures
    const handlers = useSwipeable({
        onSwipedLeft: () => nextRound(),
        onSwipedRight: () => prevRound(),
        trackMouse: false
    });

    // Keyboard
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'ArrowRight') {
                if (e.shiftKey) nextRound();
                else audioEngine.seek(progress + 5);
            } else if (e.code === 'ArrowLeft') {
                if (e.shiftKey) prevRound();
                else audioEngine.seek(progress - 5);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [progress, isPlaying]);


    const currentRound = rounds[currentRoundIndex];
    if (!currentRound) return <div className="animate-pulse bg-gray-800 h-64 rounded-xl"></div>;

    // Detect Active Speaker
    let activeSpeakerId = 'ai_a';
    if (currentRound.speaker === ai2Name || currentRound.speaker === 'ai_b') activeSpeakerId = 'ai_b';
    if (currentRound.speaker === 'Aria' || currentRound.type === 'Intro' || currentRound.type === 'Mission') activeSpeakerId = 'aria';

    const speakers = [
        { id: 'ai_a', name: ai1Name, color: '#9333ea' },
        { id: 'ai_b', name: ai2Name, color: '#f59e0b' },
        { id: 'aria', name: 'Aria', color: '#10b981' } // Added Aria
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl border border-red-900 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Audio Error</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full font-bold"
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        );
    }

    return (
        <div {...handlers} className="w-full max-w-2xl mx-auto space-y-6 outline-none">

            {/* Speakers */}
            <div className="flex justify-center mb-8 relative">
                <SpeakerIndicator
                    speakers={speakers}
                    activeSpeaker={activeSpeakerId}
                    isPlaying={isPlaying}
                />
            </div>

            {/* Content & Text Reveal */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRoundIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 min-h-[200px] flex items-center justify-center text-center relative shadow-2xl"
                >
                    <div className="w-full">
                        <TextReveal
                            text={currentRound.content || "..."}
                            progress={progress}
                            duration={duration || 10} // Fallback to avoid div by zero
                            isPlaying={isPlaying}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls Area */}
            <div className="flex flex-col items-center gap-4">

                {/* Clip Button & Speed */}
                <div className="w-full flex justify-between items-center px-2">
                    <ClipButton />
                    <div className="flex gap-1">
                        {[1.0, 1.25, 1.5, 2.0].map(rate => (
                            <button
                                key={rate}
                                onClick={() => setPlaybackSpeed(rate)}
                                className={`text-[10px] px-2 py-1 rounded ${playbackSpeed === rate ? 'bg-white text-black font-bold' : 'text-gray-500 hover:text-white'}`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    className="w-full bg-gray-800 h-3 rounded-full overflow-hidden cursor-pointer group relative"
                    onClick={handleSeek}
                >
                    <motion.div
                        className="h-full bg-blue-500 relative"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                </div>
                <div className="w-full flex justify-between text-xs text-gray-500 font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Main Buttons */}
                <div className="flex items-center gap-8 relative w-full justify-center pt-2">
                    <button onClick={prevRound} disabled={currentRoundIndex === 0} className="p-4 text-gray-400 hover:text-white disabled:opacity-30 transition-transform active:scale-95">
                        <SkipBack className="w-8 h-8" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-white/10 active:scale-95"
                    >
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
                    </button>

                    <button onClick={nextRound} disabled={currentRoundIndex === rounds.length - 1} className="p-4 text-gray-400 hover:text-white disabled:opacity-30 transition-transform active:scale-95">
                        {currentRoundIndex === rounds.length - 1 ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <SkipForward className="w-8 h-8" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}
