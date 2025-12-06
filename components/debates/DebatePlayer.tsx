'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'

interface Round {
    round_number: number
    speaker: 'ai1' | 'ai2' | 'facilitator'
    content: string
    word_count: number
    audio_url?: string
}

interface DebatePlayerProps {
    rounds: Round[]
    ai1Name: string
    ai2Name: string
    facilitatorIntro?: string
    facilitatorOutro?: string
    onComplete: () => void
}

export default function DebatePlayer({
    rounds,
    ai1Name,
    ai2Name,
    facilitatorIntro,
    facilitatorOutro,
    onComplete
}: DebatePlayerProps) {
    const [currentRound, setCurrentRound] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentText, setCurrentText] = useState(facilitatorIntro || '')
    const audioRef = useRef<HTMLAudioElement>(null)

    const allContent = [
        { speaker: 'facilitator', content: facilitatorIntro || '' },
        ...rounds,
        { speaker: 'facilitator', content: facilitatorOutro || '' }
    ]

    useEffect(() => {
        if (currentRound < allContent.length) {
            setCurrentText(allContent[currentRound].content)
        } else {
            onComplete()
        }
    }, [currentRound])

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause()
        } else {
            // If audio URL exists, play it
            if (allContent[currentRound].audio_url) {
                audioRef.current?.play()
            } else {
                // Fallback: auto-advance after reading time
                const wordsPerMinute = 150
                const words = allContent[currentRound].content.split(' ').length
                const durationMs = (words / wordsPerMinute) * 60 * 1000

                setTimeout(() => {
                    handleNext()
                }, durationMs)
            }
        }
        setIsPlaying(!isPlaying)
    }

    const handleNext = () => {
        setIsPlaying(false)
        setCurrentRound(prev => prev + 1)
    }

    const getCurrentSpeaker = () => {
        const item = allContent[currentRound]
        if (item.speaker === 'facilitator') return 'Facilitator'
        if (item.speaker === 'ai1') return ai1Name
        if (item.speaker === 'ai2') return ai2Name
        return ''
    }

    const getSpeakerColor = () => {
        const item = allContent[currentRound]
        if (item.speaker === 'ai1') return 'bg-purple-600'
        if (item.speaker === 'ai2') return 'bg-amber-500'
        return 'bg-gray-600'
    }

    return (
        <div className="bg-[#171717] border border-[#27272a] rounded-2xl p-8">
            {/* Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                        Round {Math.min(currentRound + 1, allContent.length)} of {allContent.length}
                    </span>
                    <span className="text-sm text-gray-400">
                        {getCurrentSpeaker()}
                    </span>
                </div>
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${((currentRound + 1) / allContent.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Speaker Avatar */}
            <div className="flex justify-center mb-6">
                <motion.div
                    animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                    className={`w-24 h-24 rounded-full ${getSpeakerColor()} flex items-center justify-center text-white text-3xl font-bold`}
                >
                    {getCurrentSpeaker()[0]}
                </motion.div>
            </div>

            {/* Text Display */}
            <div className="bg-[#0a0a0a] rounded-lg p-6 mb-6 min-h-[200px]">
                <p className="text-lg leading-relaxed">
                    {currentText}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8" />
                    ) : (
                        <Play className="w-8 h-8 ml-1" />
                    )}
                </button>
            </div>

            {/* Hidden audio element */}
            {allContent[currentRound]?.audio_url && (
                <audio
                    ref={audioRef}
                    src={allContent[currentRound].audio_url}
                    onEnded={handleNext}
                />
            )}
        </div>
    )
}
