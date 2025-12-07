import * as Tone from 'tone'

export async function playSonicSignature(): Promise<void> {
    // Ensure context is started (must be triggered by user interaction usually)
    await Tone.start()

    // Create layered synths for rich sound
    const bassSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1 }
    }).toDestination()

    const padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 1, decay: 0.5, sustain: 0.6, release: 1.5 }
    }).toDestination()

    // Add reverb for space
    const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).toDestination()
    padSynth.connect(reverb)

    // Add filter sweep for drama
    const filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 200,
        rolloff: -24
    }).toDestination()
    padSynth.connect(filter)

    // Automate filter sweep
    filter.frequency.rampTo(8000, 2.5)

    // Play the signature
    const now = Tone.now()

    // Bass foundation
    bassSynth.triggerAttackRelease('C1', '3s', now)

    // Rising chord (C major with extensions for cinematic feel)
    padSynth.triggerAttackRelease(['C2', 'G2', 'C3', 'E3', 'G3', 'B3'], '3s', now)

    // Add brightness at peak
    setTimeout(() => {
        padSynth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '1s', Tone.now())
    }, 2000)

    // Return promise that resolves when done (approx 3.5s)
    return new Promise(resolve => setTimeout(resolve, 3500))
}

// Heartbeat generator
export function createHeartbeat(): Tone.Loop {
    // Create heartbeat with synthesis
    // MembraneSynth is good for kicks/thumps
    const kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 }
    }).toDestination()

    // Add slight reverb to heartbeat
    const verb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination()
    kick.connect(verb)

    // Double beat pattern (lup-dup)
    // We use a Loop instead of Pattern for simpler control
    const loop = new Tone.Loop((time) => {
        kick.triggerAttackRelease('C1', '8n', time)
        kick.triggerAttackRelease('C1', '8n', time + 0.15) // The second beat
    }, '1n').start(0) // 1n = every measure? Or '2n' for faster? 60 BPM = 1 beat per sec.

    // Adjust BPM
    Tone.getTransport().bpm.value = 60

    return loop
}
