import * as Tone from 'tone'

// Ensure Tone.js is started before playing (usually handled by IntroExperience)
// But we should check in case user jumped straight here
async function ensureAudio() {
    if (Tone.context.state !== 'running') {
        await Tone.start()
    }
}

export async function playVoteSound() {
    await ensureAudio()

    // A satisfying "wooden" click or mechanical thud
    const synth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination()

    synth.triggerAttackRelease('C2', '32n')

    // Dispose shortly after
    setTimeout(() => synth.dispose(), 1000)
}

export async function playSuccessSound() {
    await ensureAudio()

    // A bright, celebratory chord (C Major 9)
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 1 }
    }).toDestination()

    const now = Tone.now()
    // Staggered arpeggio
    synth.triggerAttackRelease('C5', '8n', now)
    synth.triggerAttackRelease('E5', '8n', now + 0.05)
    synth.triggerAttackRelease('G5', '8n', now + 0.1)
    synth.triggerAttackRelease('B5', '8n', now + 0.15)
    synth.triggerAttackRelease('D6', '2n', now + 0.2)

    setTimeout(() => synth.dispose(), 2000)
}

export async function playTransitionSound() {
    await ensureAudio()

    // A subtle "whoosh" or air movement
    const noise = new Tone.Noise("pink").start()
    const filter = new Tone.AutoFilter({
        frequency: "4n",
        baseFrequency: 200,
        octaves: 4
    }).toDestination().start()

    noise.connect(filter)

    const env = new Tone.AmplitudeEnvelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0,
        release: 0.1
    }).toDestination()

    noise.connect(env)

    env.triggerAttackRelease("8n")

    setTimeout(() => {
        noise.dispose()
        filter.dispose()
        env.dispose()
    }, 1000)
}

export async function playTickSound() {
    await ensureAudio()

    // Very short, high-pitched tick
    const synth = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 1,
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }
    }).toDestination()

    // Low volume for ticks
    synth.volume.value = -15
    synth.triggerAttackRelease('G6', '32n')

    setTimeout(() => synth.dispose(), 500)
}
