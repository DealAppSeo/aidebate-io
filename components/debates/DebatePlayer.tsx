'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Share2, AlertCircle, FastForward } from 'lucide-react'
import { useEngagement } from '@/hooks/useEngagement'
import { selectAriaVariant, selectTransitionRounds, AriaVariant } from '@/lib/aria'
import { TextReveal } from '@/components/TextReveal'
import { SpeakerIndicator } from '@/components/SpeakerIndicator'
import { createClient } from '@/utils/supabase/client'
import { ARIA_INTROS, ARIA_OUTROS } from '@/lib/engagement_constants'

interface DatabaseRound {
    // Legacy format
    round: number
    type: string
    ai_a_text?: string
    ai_b_text?: string
    ai_a_audio_url?: string
    ai_b_audio_url?: string
    // New format (Sequential)
    speaker?: string
    content?: string
    audio_url?: string
}

interface ContentItem {
    speaker: 'ai_a' | 'ai_b' | 'aria'
    content: string
    roundNum?: number
    type: string
    audio_url?: string
}

interface DebatePlayerProps {
    debateId: string
    rounds: DatabaseRound[]
    ai1Name: string
    ai2Name: string
    topic: string
    session: any
    prediction?: string // ID of predicted winner
    onComplete: () => void
}

export default function DebatePlayer({
    debateId,
    rounds,
    ai1Name,
    ai2Name,
    topic,
    session,
    prediction,
    onComplete
}: DebatePlayerProps) {
    // Session & Persistence
    const supabase = createClient()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [resumePrompt, setResumePrompt] = useState<{ index: number, time: number } | null>(null)

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false)
    const [isAutoPlay, setIsAutoPlay] = useState(false)
    const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null)

    const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
    const [audioError, setAudioError] = useState(false)
    const [preloadedAudio, setPreloadedAudio] = useState<HTMLAudioElement | null>(null)

    // Aria & Tracking
    const [variant, setVariant] = useState<AriaVariant>('B')
    const { trackEvent } = useEngagement()
    const audioRef = useRef<HTMLAudioElement>(null)

    const [showAutoPlayPrompt, setShowAutoPlayPrompt] = useState(false)

    // Load Auto-Play preference
    useEffect(() => {
        const stored = localStorage.getItem('aidebate_autoplay')
        const prompted = localStorage.getItem('autoPlayPrompted')
        if (stored) {
            setIsAutoPlay(JSON.parse(stored))
        } else if (!prompted) {
            setShowAutoPlayPrompt(true)
        }
    }, [])

    const enableAutoPlay = () => {
        setIsAutoPlay(true)
        localStorage.setItem('aidebate_autoplay', 'true')
        localStorage.setItem('autoPlayPrompted', 'true')
        setShowAutoPlayPrompt(false)
    }

    const dismissAutoPlayPrompt = () => {
        localStorage.setItem('autoPlayPrompted', 'true')
        setShowAutoPlayPrompt(false)
    }

    const toggleAutoPlay = () => {
        const newVal = !isAutoPlay
        setIsAutoPlay(newVal)
        localStorage.setItem('aidebate_autoplay', JSON.stringify(newVal))
    }

    // Select Aria variant
    useEffect(() => {
        const v = selectAriaVariant(session, debateId)
        setVariant(v)
        trackEvent('debate_started', {
            debate_id: debateId,
            session_id: session?.user?.id || 'anonymous',
            intro_variant: v
        })
    }, [debateId, session, trackEvent])

    // Construct Playlist
    const playlist = useMemo(() => {
        const items: ContentItem[] = []
        const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/debate-audio`

        // Random Text Variations
        const randomIntro = ARIA_INTROS[Math.floor(Math.random() * ARIA_INTROS.length)]
        const randomOutro = ARIA_OUTROS[Math.floor(Math.random() * ARIA_OUTROS.length)]

        // Check format
        const isNewFormat = rounds.length > 0 && !!rounds[0].speaker

        if (isNewFormat) {
            // NEW FORMAT: Sequential items
            rounds.forEach((round, idx) => {
                let speakerKey: 'ai_a' | 'ai_b' | 'aria' = 'aria'

                if (round.speaker === 'Aria') {
                    speakerKey = 'aria'
                } else if (round.speaker?.toLowerCase().includes(ai1Name.toLowerCase()) || round.speaker === ai1Name) {
                    speakerKey = 'ai_a'
                } else {
                    speakerKey = 'ai_b'
                }

                items.push({
                    speaker: speakerKey,
                    content: round.content || '',
                    roundNum: round.round,
                    type: round.type,
                    audio_url: round.audio_url
                })
            })

            // Inject Random Outro at the end
            items.push({
                speaker: 'aria',
                content: randomOutro,
                type: 'Outro',
                audio_url: undefined // Force TTS or create silent/generic audio later
            })

        } else {
            // LEGACY HANDLER OMITTED FOR BREVITY - Assume new format for launch or fallback to existing logic if needed
            // But for Master Launch, we prefer Clean New Format. 
            // ... keeping limited legacy support just in case
            const transitionRounds = selectTransitionRounds()
            items.push({ speaker: 'aria', content: randomIntro, type: 'Intro', audio_url: `${storageBase}/${debateId}_aria_intro_${variant}.mp3` })
            rounds.forEach((round) => {
                if (round.ai_a_text) items.push({ speaker: 'ai_a', content: round.ai_a_text, roundNum: round.round, type: round.type, audio_url: round.ai_a_audio_url })
                if (transitionRounds.includes(round.round) && round.round < 6) items.push({ speaker: 'aria', content: "Moderator interjection...", type: 'Transition', audio_url: `${storageBase}/${debateId}_aria_transition_r${round.round}.mp3` })
                if (round.ai_b_text) items.push({ speaker: 'ai_b', content: round.ai_b_text, roundNum: round.round, type: round.type, audio_url: round.ai_b_audio_url })
            })
            items.push({ speaker: 'aria', content: randomOutro, type: 'Voting Phase', audio_url: `${storageBase}/${debateId}_aria_prevote_${variant}.mp3` })
        }

        return items
    }, [rounds, variant, debateId, topic, ai1Name, ai2Name])

    const currentItem = playlist[currentIndex]

    // Speaker Config for Indicator
    const speakers = useMemo(() => [
        { id: 'ai_a', name: ai1Name, color: '#9333ea' }, // Purple
        { id: 'ai_b', name: ai2Name, color: '#f59e0b' }, // Amber
    ], [ai1Name, ai2Name])

    // SHARE SPECIFIC TIMESTAMP
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const start = params.get('start')
        if (start) {
            const idx = parseInt(start)
            if (!isNaN(idx) && idx < playlist.length) {
                setCurrentIndex(idx)
                setIsPlaying(true)
            }
        }
    }, [playlist.length])

    // RESUME PLAYBACK (Load)
    useEffect(() => {
        const saved = localStorage.getItem(`debate_progress_${debateId}`)
        if (saved) {
            const { index, time, timestamp } = JSON.parse(saved)
            if (Date.now() - timestamp < 86400000 && index > 0) {
                setResumePrompt({ index, time })
            }
        }
    }, [debateId])

    // RESUME PLAYBACK (Save)
    useEffect(() => {
        const saveProgress = () => {
            if (isPlaying) {
                localStorage.setItem(`debate_progress_${debateId}`, JSON.stringify({
                    index: currentIndex,
                    time: audioRef.current?.currentTime || 0,
                    timestamp: Date.now()
                }))
            }
        }
        const interval = setInterval(saveProgress, 5000)
        return () => clearInterval(interval)
    }, [currentIndex, isPlaying, debateId])

    // AUDIO PRELOADING
    useEffect(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex < playlist.length && playlist[nextIndex].audio_url) {
            const audio = new Audio(playlist[nextIndex].audio_url)
            audio.preload = 'auto'
            setPreloadedAudio(audio)
        }
    }, [currentIndex, playlist])

    // Speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed
        }
    }, [playbackSpeed])

    // MOBILE BACKGROUND PLAYBACK
    useEffect(() => {
        if ('mediaSession' in navigator && currentItem) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: topic,
                artist: `${getCurrentSpeakerName()} (Round ${currentItem.roundNum || 'Intro'})`,
                album: 'AI Debate',
            })
            navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true))
            navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false))
            navigator.mediaSession.setActionHandler('nexttrack', handleNext)
            navigator.mediaSession.setActionHandler('previoustrack', handlePrev)
        }
    }, [currentItem, topic, isPlaying])

    // Handlers
    const handlePlayPause = () => {
        if (!currentItem) return
        if (isPlaying) {
            audioRef.current?.pause()
            trackAudioEvent('pause', {})
        } else {
            playAudio()
        }
        setIsPlaying(!isPlaying)
    }

    const playAudio = () => {
        if (currentItem.audio_url || audioError) {
            audioRef.current?.play().catch(e => console.warn("Play error", e))
            trackAudioEvent('play', {})
        }
    }

    const handleNext = () => {
        setAudioError(false)
        if (autoPlayTimer) clearTimeout(autoPlayTimer)

        if (currentIndex < playlist.length - 1) {
            trackAudioEvent('skip', { from: currentIndex, to: currentIndex + 1 })
            setCurrentIndex(prev => prev + 1)
        } else {
            // STOP at end of debate
            onComplete()
        }
    }

    const handleAudioEnded = () => {
        if (isAutoPlay && currentIndex < playlist.length - 1) {
            // Auto Play: Pause for 2s then Next
            setIsPlaying(false)
            const timer = setTimeout(() => {
                handleNext()
                // Need to start playing the next one
                setTimeout(() => setIsPlaying(true), 100)
            }, 2000)
            setAutoPlayTimer(timer)
        } else if (currentIndex === playlist.length - 1) {
            // End of debate
            setIsPlaying(false)
            onComplete()
        } else {
            setIsPlaying(false)
        }
    }

    useEffect(() => {
        return () => { if (autoPlayTimer) clearTimeout(autoPlayTimer) }
    }, [autoPlayTimer])

    const handlePrev = () => {
        setIsPlaying(false)
        setAudioError(false)
        if (autoPlayTimer) clearTimeout(autoPlayTimer)

        if (currentIndex > 0) {
            trackAudioEvent('replay', { from: currentIndex, to: currentIndex - 1 })
            setCurrentIndex(prev => prev - 1)
        }
    }

    const trackAudioEvent = async (event: string, data: any) => {
        try {
            await supabase.from('audio_analytics').insert({
                session_id: session?.user?.id || 'anonymous',
                debate_id: debateId,
                event,
                round_index: currentIndex,
                audio_position: audioRef.current?.currentTime || 0,
                metadata: data
            })
        } catch (e) {
            console.debug('Analytics skipped:', e)
        }
    }

    const handleAudioError = () => {
        console.warn("Audio load failed:", currentItem?.audio_url)
        setAudioError(true)

        if ('speechSynthesis' in window && isPlaying && !audioError) {
            const utterance = new SpeechSynthesisUtterance(currentItem.content)
            utterance.rate = playbackSpeed
            utterance.onend = () => {
                handleAudioEnded()
            }
            speechSynthesis.speak(utterance)
            trackAudioEvent('tts_fallback', { text_len: currentItem.content.length })
            return
        }
        setIsPlaying(false)
    }

    const handleResume = () => {
        if (resumePrompt) {
            setCurrentIndex(resumePrompt.index)
            setResumePrompt(null)
            setIsPlaying(true)
        }
    }

    const handleShare = () => {
        const url = `${window.location.origin}/debate/${debateId}?start=${currentIndex}`
        navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
        trackAudioEvent('share_timestamp', { url })
    }

    const getCurrentSpeakerName = () => {
        if (!currentItem) return ''
        if (currentItem.speaker === 'aria') return 'Aria (Moderator)'
        return currentItem.speaker === 'ai_a' ? ai1Name : ai2Name
    }

    if (!currentItem) return <div className="p-8 text-center text-gray-500">Loading debate...</div>

    const activeSpeakerId = currentItem.speaker === 'aria' ? 'aria' : currentItem.speaker;

    return (
        <div
            className="bg-[#171717] border border-[#27272a] rounded-2xl p-4 sm:p-8 shadow-xl relative min-h-[500px] flex flex-col justify-between"
            role="application"
            aria-label="AI Debate Player"
        >
            {/* Auto Play Prompt */}
            {showAutoPlayPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 p-4 rounded-lg shadow-xl z-50 border border-gray-600 w-64 text-center"
                >
                    <p className="text-white mb-3 text-sm">Try auto-play for podcast mode?</p>
                    <div className="flex gap-2 justify-center">
                        <button onClick={enableAutoPlay} className="px-4 py-2 bg-blue-500 text-white rounded text-xs">Enable</button>
                        <button onClick={dismissAutoPlayPrompt} className="px-4 py-2 bg-gray-600 text-white rounded text-xs">No thanks</button>
                    </div>
                </motion.div>
            )}

            {/* Resume Prompt */}
            <AnimatePresence>
                {resumePrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 right-4 z-50 bg-blue-900 border border-blue-700 text-blue-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3"
                    >
                        <span className="text-sm">Resume from Round {resumePrompt.index}?</span>
                        <div className="flex gap-2">
                            <button onClick={handleResume} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded font-bold">Yes</button>
                            <button onClick={() => setResumePrompt(null)} className="text-xs hover:bg-blue-800 px-2 py-1 rounded">No</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-blue-400 uppercase tracking-wider flex items-center gap-2">
                        {currentItem.roundNum ? `Round ${currentItem.roundNum} • ` : ''} {currentItem.type} {audioError && !('speechSynthesis' in window) && <span className="text-yellow-500 text-xs flex items-center inline-flex gap-1"><AlertCircle className="w-3 h-3" /> Generating audio...</span>}
                    </span>

                    {/* Prediction Badge */}
                    {prediction && (
                        <div className="bg-gray-800/80 px-2 py-1 rounded text-xs flex items-center gap-1 border border-gray-700">
                            <span className="text-gray-400">Your pred:</span>
                            <span className="text-white font-bold">{prediction === 'ai_a' ? ai1Name : (prediction === 'ai_b' ? ai2Name : 'Tie')} 🎯</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button onClick={handleShare} className="text-gray-500 hover:text-white transition-colors" title="Share this moment">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / playlist.length) * 100}%` }}
                    />
                </div>

                {/* Speaker Indicator */}
                <SpeakerIndicator
                    speakers={speakers}
                    activeSpeaker={activeSpeakerId}
                    isPlaying={isPlaying && !audioError}
                />
            </div>

            {/* Text Display */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 mb-8 min-h-[160px] shadow-inner flex items-center justify-center text-center overflow-hidden relative">
                {currentItem.content ? (
                    <TextReveal
                        fullText={currentItem.content}
                        audioRef={audioRef}
                        isPlaying={isPlaying && !audioError}
                    />
                ) : (
                    <span className="text-gray-500 italic flex items-center gap-2 justify-center">
                        Loading content...
                    </span>
                )}

                {audioError && isPlaying && 'speechSynthesis' in window && (
                    <div className="absolute bottom-2 text-xs text-yellow-500">Using backup voice...</div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-6 w-full max-w-xs relative">
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
                        <SkipBack className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-blue-900/20"
                    >
                        {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                    </button>
                    <button onClick={handleNext} disabled={currentIndex >= playlist.length} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
                        <SkipForward className="w-6 h-6" />
                    </button>

                    {/* Speed (Desktop) */}
                    <div className="absolute right-0 translate-x-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 hidden sm:flex">
                        {[1.0, 1.5, 2.0].map(speed => (
                            <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-[#27272a] text-gray-400 hover:bg-[#3a3a3a]'}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <button
                        onClick={toggleAutoPlay}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold transition-all ${isAutoPlay ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
                    >
                        <FastForward className="w-3 h-3" />
                        {isAutoPlay ? 'AUTO ON' : 'AUTO OFF'}
                    </button>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentItem.audio_url}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                autoPlay={false} // We control play manually
            />
        </div>
    )
}
