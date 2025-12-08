'use client';
import { useMemo } from 'react';

interface TextRevealProps {
    text: string;
    progress: number; // Current playback time in seconds
    duration: number; // Total duration in seconds
    isPlaying?: boolean;
}

export default function TextReveal({ text, progress, duration, isPlaying }: TextRevealProps) {
    // Memoize word splitting to avoid re-calculation on every frame
    const words = useMemo(() => text.split(' '), [text]);

    // Calculate how many words should be visible based on progress
    // Assuming simple linear distribution for now (can be improved with timestamps later)
    const totalWords = words.length;
    const cleanDuration = duration || 1;
    const wordsPerSecond = totalWords / cleanDuration;
    const currentWordIndex = Math.min(Math.floor(progress * wordsPerSecond), totalWords - 1);

    return (
        <div className="text-lg md:text-xl leading-relaxed font-medium text-left">
            {words.map((word, index) => {
                const isRevealed = index <= currentWordIndex;
                const isCurrent = index === currentWordIndex;

                return (
                    <span
                        key={index}
                        className={`
                            inline-block mr-1.5 transition-colors duration-200
                            ${isRevealed ? 'text-white' : 'text-gray-700 blur-[0.5px]'}
                            ${isCurrent && isPlaying ? 'text-purple-400 scale-105 font-bold' : ''}
                        `}
                    >
                        {word}
                    </span>
                );
            })}
        </div>
    );
}
