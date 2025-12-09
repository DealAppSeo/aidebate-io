'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tone from 'tone'

interface IntroExperienceProps {
    onComplete: () => void
    skipEnabled?: boolean
    debate?: any // Optional debate object to preload
}

export default function IntroExperience({ onComplete, skipEnabled = true, debate }: IntroExperienceProps) {
    const [phase, setPhase] = useState<'black' | 'sonic' | 'heartbeat' | 'aria' | 'done'>('black')
    const [canSkip, setCanSkip] = useState(false)
    const [loadProgress, setLoadProgress] = useState(0)
    const [audioReady, setAudioReady] = useState(false)

    const audioContextStarted = useRef(false)
    const heartbeatRef = useRef<Tone.Loop | null>(null)
    const waveformRef = useRef<HTMLCanvasElement>(null)
    const analyserRef = useRef<Tone.Analyser | null>(null)


    // Check if first visit
    useEffect(() => {
        // Allow skip after 2 seconds
        setTimeout(() => setCanSkip(true), 2000)

        // Start the experience
        startIntro()

        return () => {
            // Cleanup
            if (heartbeatRef.current) {
                heartbeatRef.current.stop()
                heartbeatRef.current.dispose()
            }
            Tone.getTransport().stop()
        }
    }, [])

    // Preload Logic
    useEffect(() => {
        if (!debate?.rounds) return;

        const preloadDebateAudio = async () => {
            const rounds = debate.rounds;
            const audioUrls = rounds.flatMap((r: any) =>
                [r.audio_url, r.ai_a_audio_url, r.ai_b_audio_url].filter(Boolean)
            );

            let loaded = 0;

            await Promise.all(audioUrls.map(async (url: string) => {
                try {
                    // Fetch to trigger service worker cache
                    const response = await fetch(url);
                    const blob = await response.blob();

                    // Store in global cache for immediate access (optional, since SW handles it)
                    // But creates object URL for blob-based instant playback
                    const objectUrl = URL.createObjectURL(blob);
                    // @ts-ignore
                    window.__audioCache = window.__audioCache || {};
                    // @ts-ignore
                    window.__audioCache[url] = objectUrl;

                    loaded++;
                    setLoadProgress((loaded / audioUrls.length) * 100);
                } catch (e) {
                    console.warn('Failed to preload:', url);
                }
            }));

            setAudioReady(true);
        };

        preloadDebateAudio();
    }, [debate]);

    async function startIntro() {
        // Phase 1: Black screen (1 second)
        await delay(1000)

        // Phase 2: Sonic signature
        setPhase('sonic')

        // Wait for user interaction to start audio (browser requirement)
        // This happens on first click/tap or if user has already interacted with domain
    }

    async function startAudioExperience() {
        if (audioContextStarted.current) return
        audioContextStarted.current = true

        await Tone.start()

        // Create analyser for waveform visualization
        analyserRef.current = new Tone.Analyser('waveform', 256)

        // Play sonic signature
        await playSonicSignature()

        // Phase 3: Transition to heartbeat
        setPhase('heartbeat')
        await startHeartbeat()

        // Phase 4: Aria speaks
        setPhase('aria')
        await playAriaWelcome()

        // Complete
        setPhase('done')
        localStorage.setItem('aidebate_intro_seen', 'true')

        // Fade out heartbeat
        if (heartbeatRef.current) {
            heartbeatRef.current.stop()
        }

        await delay(500)
        onComplete()
    }

    async function playSonicSignature() {
        const synth = new Tone.PolySynth(Tone.Synth).toDestination()
        if (analyserRef.current) synth.connect(analyserRef.current)

        const reverb = new Tone.Reverb({ decay: 4, wet: 0.6 }).toDestination()
        synth.connect(reverb)

        const filter = new Tone.Filter({ frequency: 100, type: 'lowpass' }).toDestination()
        synth.connect(filter)

        // Sweep filter up
        filter.frequency.rampTo(6000, 3)

        // Volume swell
        synth.volume.value = -20
        synth.volume.rampTo(-6, 2.5)

        const now = Tone.now()

        // Rising chord progression
        synth.triggerAttackRelease(['C2', 'G2'], '3s', now)
        synth.triggerAttackRelease(['C3', 'E3', 'G3'], '2.5s', now + 0.3)
        synth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '2s', now + 0.8)
        synth.triggerAttackRelease(['D5', 'G5', 'B5'], '1.5s', now + 1.5)

        await delay(3500)
        synth.dispose()
    }

    async function startHeartbeat() {
        const kick = new Tone.MembraneSynth({
            pitchDecay: 0.08,
            octaves: 6,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.5 }
        }).toDestination()

        if (analyserRef.current) kick.connect(analyserRef.current)
        kick.volume.value = -8

        // Heartbeat pattern: thump-thump ... thump-thump
        heartbeatRef.current = new Tone.Loop((time) => {
            kick.triggerAttackRelease('C1', '16n', time)
            kick.triggerAttackRelease('C1', '16n', time + 0.18)
        }, '1.2s')

        heartbeatRef.current.start(0)
        Tone.getTransport().start()

        await delay(2000)  // Let heartbeat establish
    }

    async function playAriaWelcome() {
        // Load pre-generated Aria audio
        // Using a try-catch in case file doesn't exist
        try {
            const player = new Tone.Player('/audio/aria-welcome.mp3').toDestination()
            if (analyserRef.current) player.connect(analyserRef.current)

            await player.load('/audio/aria-welcome.mp3')
            player.start()

            // Wait for audio to finish (approximately 6 seconds)
            await delay(6500)
            player.dispose()
        } catch (e) {
            console.error("Failed to play welcome audio", e)
            await delay(3000) // Fallback delay
        }
    }

    // Waveform animation
    useEffect(() => {
        if (!waveformRef.current || !analyserRef.current) return
        if (phase !== 'heartbeat' && phase !== 'aria') return

        const canvas = waveformRef.current
        const ctx = canvas.getContext('2d')!
        const analyser = analyserRef.current

        let animationId: number

        function draw() {
            const values = analyser.getValue() as Float32Array

            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.lineWidth = 2
            ctx.strokeStyle = phase === 'aria'
                ? 'rgba(139, 92, 246, 0.8)'   // Purple for Aria
                : 'rgba(59, 130, 246, 0.8)'   // Blue for heartbeat

            ctx.beginPath()

            const sliceWidth = canvas.width / values.length
            let x = 0

            for (let i = 0; i < values.length; i++) {
                const v = values[i]
                const y = (v + 1) / 2 * canvas.height

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }

                x += sliceWidth
            }

            ctx.stroke()

            // Add glow effect
            ctx.shadowBlur = 15
            ctx.shadowColor = phase === 'aria' ? '#8B5CF6' : '#3B82F6'
            ctx.stroke()
            ctx.shadowBlur = 0

            animationId = requestAnimationFrame(draw)
        }

        draw()

        return () => cancelAnimationFrame(animationId)
    }, [phase])

    function handleSkip() {
        // Stop all audio
        Tone.getTransport().stop()
        if (heartbeatRef.current) heartbeatRef.current.stop()

        localStorage.setItem('aidebate_intro_seen', 'true')
        onComplete()
    }

    function handleInteraction() {
        if (phase === 'sonic' && !audioContextStarted.current) {
            startAudioExperience()
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black z-[99999] flex items-center justify-center overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                onClick={handleInteraction}
            >
                {/* Phase: Sonic - Particle convergence */}
                {
                    phase === 'sonic' && !audioContextStarted.current && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center z-20"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-6xl mb-4"
                            >
                                ⚡
                            </motion.div>
                            <p className="text-gray-400 text-lg">Tap to begin</p>
                        </motion.div>
                    )
                }

                {/* Phase: Sonic - Particles animating */}
                {
                    phase === 'sonic' && audioContextStarted.current && (
                        <ParticleConvergence />
                    )
                }

                {/* Phase: Heartbeat & Aria - Waveform */}
                {
                    (phase === 'heartbeat' || phase === 'aria') && (
                        <div className="flex flex-col items-center z-20">
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: 1,
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                                }}
                                className="text-5xl font-bold text-white mb-8 flex items-center gap-3"
                            >
                                <span className="text-blue-500">⚡</span>
                                <span>AIDebate</span>
                                <span className="text-blue-500">.io</span>
                            </motion.div>

                            {/* Waveform visualization */}
                            <canvas
                                ref={waveformRef}
                                width={400}
                                height={100}
                                className="rounded-lg"
                            />

                            {/* Aria speaking indicator */}
                            {phase === 'aria' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-6 flex items-center gap-2"
                                >
                                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                                    <span className="text-purple-400 text-sm">Aria</span>
                                </motion.div>
                            )}
                        </div>
                    )
                }

                {/* Skip button & Progress */}
                <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-2">
                    {/* Preload Indicator */}
                    {debate && (
                        <div className="flex flex-col items-end gap-1">
                            <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${loadProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                {audioReady ? 'Ready for Debate' : 'Preloading Audio...'}
                            </p>
                        </div>
                    )}

                    {canSkip && skipEnabled && phase !== 'done' && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={(e) => { e.stopPropagation(); handleSkip() }}
                            className="text-gray-500 hover:text-white text-sm transition uppercase tracking-widest"
                        >
                            Skip →
                        </motion.button>
                    )}
                </div>
            </motion.div >
        </AnimatePresence >
    )
}

// Particle convergence animation
function ParticleConvergence() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Create particles
        const particles: Particle[] = []
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2
            const distance = Math.random() * 500 + 200
            particles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                targetX: centerX,
                targetY: centerY,
                speed: Math.random() * 0.02 + 0.01,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.5
            })
        }

        let animationId: number
        const startTime = Date.now()

        function animate() {
            const elapsed = (Date.now() - startTime) / 1000

            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            particles.forEach(p => {
                // Move toward center
                p.x += (p.targetX - p.x) * p.speed * (1 + elapsed * 0.5)
                p.y += (p.targetY - p.y) * p.speed * (1 + elapsed * 0.5)

                // Draw
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
                gradient.addColorStop(0, `rgba(59, 130, 246, ${p.alpha})`)
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()
            })

            // Draw center glow (grows over time)
            const glowSize = Math.min(elapsed * 30, 100)
            const centerGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, glowSize
            )
            centerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)')
            centerGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)')
            centerGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

            ctx.beginPath()
            ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
            ctx.fillStyle = centerGradient
            ctx.fill()

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => cancelAnimationFrame(animationId)
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

interface Particle {
    x: number
    y: number
    targetX: number
    targetY: number
    speed: number
    size: number
    alpha: number
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
