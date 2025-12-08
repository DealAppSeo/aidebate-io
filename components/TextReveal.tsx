import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TextRevealProps {
    fullText: string;
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
}

export const TextReveal = ({ fullText, audioRef, isPlaying }: TextRevealProps) => {
    const [visibleWords, setVisibleWords] = useState(0);
    const words = fullText.split(' ');

    useEffect(() => {
        if (!audioRef.current || !isPlaying) return;

        const audio = audioRef.current;

        const updateWords = () => {
            const duration = audio.duration || 1;
            const wordsPerSecond = words.length / duration;
            const currentTime = audio.currentTime;
            const targetWords = Math.floor(currentTime * wordsPerSecond);
            setVisibleWords(Math.min(targetWords, words.length));
        };

        // Initial update
        updateWords();

        const interval = setInterval(updateWords, 50);
        return () => clearInterval(interval);
    }, [audioRef, isPlaying, words.length]);

    return (
        <div className="text-container max-h-48 overflow-y-auto">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                        opacity: i < visibleWords ? 1 : 0,
                        y: i < visibleWords ? 0 : 8
                    }}
                    transition={{ duration: 0.1 }}
                    className={`inline-block mr-1 ${i === visibleWords - 1
                        ? 'text-white font-medium'
                        : i < visibleWords - 5
                            ? 'text-gray-500'
                            : 'text-gray-300'
                        }`}
                >
                    {word}{' '}
                </motion.span>
            ))}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-0.5 h-4 bg-blue-400 ml-1 align-middle"
            />
        </div>
    );
};
