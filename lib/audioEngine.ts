import { Howl, Howler } from 'howler';
import { get, set } from 'idb-keyval';

class AudioEngine {
    private currentHowl: Howl | null = null;
    private _playbackRate: number = 1.0;
    private rafId: number | null = null;
    private onProgressCallback: ((time: number, duration: number) => void) | null = null;
    private onEndCallback: (() => void) | null = null;

    constructor() {
        this.setupIOSUnlock();
    }

    private setupIOSUnlock() {
        if (typeof window === 'undefined') return;

        const unlock = () => {
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume().then(() => {
                    console.log('AudioContext resumed!');
                    // Play silent buffer to fully unlock
                    const buffer = Howler.ctx.createBuffer(1, 1, 22050);
                    const source = Howler.ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(Howler.ctx.destination);
                    source.start(0);
                });
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };

        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
    }

    async preloadRounds(rounds: any[]) {
        for (const round of rounds) {
            const url = round.audio_url || round.ai_a_audio_url || round.ai_b_audio_url;
            if (!url) continue;

            try {
                // Check cache first
                const cacheKey = `audio-${round.id || round.order}`;
                const cachedBlob = await get(cacheKey);

                if (!cachedBlob) {
                    // Fetch and cache
                    const response = await fetch(url);
                    const blob = await response.blob();
                    await set(cacheKey, blob);
                }
            } catch (e) {
                console.warn('Preload/Cache failed for', url, e);
            }
        }
    }

    async load(url: string, roundId?: string, autoPlay = false) {
        this.stop();

        let src = url;

        // Try to load from IDB
        if (roundId) {
            try {
                const blob = await get(`audio-${roundId}`);
                if (blob) {
                    src = URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn('Error loading from cache', e);
            }
        }

        return new Promise<void>((resolve, reject) => {
            this.currentHowl = new Howl({
                src: [src],
                html5: !src.startsWith('blob:'), // Use HTML5 for remote, Web Audio for blob
                rate: this._playbackRate,
                onload: () => resolve(),
                onloaderror: (_, err) => reject(err),
                onend: () => {
                    this.stopRAF();
                    if (this.onEndCallback) this.onEndCallback();
                },
                onplay: () => this.startRAF(),
                onpause: () => this.stopRAF(),
                onstop: () => this.stopRAF()
            });

            if (autoPlay) {
                this.play();
            }
        });
    }

    play() {
        if (this.currentHowl && !this.currentHowl.playing()) {
            this.currentHowl.play();
        }
    }

    pause() {
        if (this.currentHowl && this.currentHowl.playing()) {
            this.currentHowl.pause();
        }
    }

    seek(time: number) {
        if (this.currentHowl) {
            this.currentHowl.seek(time);
        }
    }

    setRate(rate: number) {
        this._playbackRate = rate;
        if (this.currentHowl) {
            this.currentHowl.rate(rate);
        }
    }

    stop() {
        if (this.currentHowl) {
            this.currentHowl.stop();
            this.currentHowl.unload();
            this.currentHowl = null;
        }
        this.stopRAF();
    }

    setCallbacks(onProgress: (t: number, d: number) => void, onEnd: () => void) {
        this.onProgressCallback = onProgress;
        this.onEndCallback = onEnd;
    }

    private startRAF() {
        const loop = () => {
            if (this.currentHowl && this.currentHowl.playing()) {
                const seek = this.currentHowl.seek();
                const duration = this.currentHowl.duration();
                if (typeof seek === 'number' && this.onProgressCallback) {
                    this.onProgressCallback(seek, duration);
                }
                this.rafId = requestAnimationFrame(loop);
            }
        };
        this.stopRAF();
        this.rafId = requestAnimationFrame(loop);
    }

    private stopRAF() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

export const audioEngine = new AudioEngine();
