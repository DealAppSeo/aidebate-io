'use client'

/**
 * Read-only transcript fallback for debates that have no generated audio yet.
 *
 * Some debates use a two-sided round shape (ai_a_content / ai_b_content) that
 * the audio pipeline and the audio player don't yet support, so the player
 * would otherwise sit at "...". This renders the text that DOES exist and lets
 * the visitor continue to the vote — no dead end, honest about the missing
 * voice. When audio generation is extended to this format, the page routes
 * back to the full DebatePlayer and this is never shown.
 */

interface TranscriptRound {
    round?: number
    title?: string
    type?: string
    speaker?: string | null
    content?: string | null
    ai_a_content?: string | null
    ai_b_content?: string | null
}

interface DebateTranscriptProps {
    rounds: TranscriptRound[]
    ai1Name: string
    ai2Name: string
    onComplete: () => void
}

export default function DebateTranscript({ rounds, ai1Name, ai2Name, onComplete }: DebateTranscriptProps) {
    const hasText = (rounds || []).some(
        (r) => (r.content && r.content.trim()) || (r.ai_a_content && r.ai_a_content.trim()) || (r.ai_b_content && r.ai_b_content.trim())
    )

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Honest note about the missing voice */}
            <div className="mb-6 rounded-lg border border-[#27272a] bg-[#111113] px-4 py-3 text-sm text-gray-400">
                <span className="text-[#fbbf24]">Voice narration is being prepared for this debate.</span>{' '}
                {hasText ? 'Here’s the transcript in the meantime.' : 'The full debate will appear here shortly.'}
            </div>

            {hasText ? (
                <div className="space-y-4">
                    {rounds.map((r, i) => {
                        // Single-speaker shape (content + speaker) or two-sided (ai_a/ai_b).
                        const single = r.content && r.content.trim()
                        return (
                            <div key={i} className="rounded-lg border border-[#27272a] bg-[#0f0f11] p-4">
                                {(r.title || r.round) && (
                                    <div className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                                        {r.title || `Round ${r.round}`}
                                    </div>
                                )}

                                {single ? (
                                    <p className="text-gray-200 leading-relaxed">
                                        {r.speaker && <span className="font-semibold text-white">{r.speaker}: </span>}
                                        {r.content}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {r.ai_a_content && r.ai_a_content.trim() && (
                                            <p className="leading-relaxed text-gray-200">
                                                <span className="font-semibold text-[#a855f7]">{ai1Name}: </span>
                                                {r.ai_a_content}
                                            </p>
                                        )}
                                        {r.ai_b_content && r.ai_b_content.trim() && (
                                            <p className="leading-relaxed text-gray-200">
                                                <span className="font-semibold text-[#fbbf24]">{ai2Name}: </span>
                                                {r.ai_b_content}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : null}

            {/* No dead end — always let them proceed to the vote (the core action). */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={onComplete}
                    className="rounded-full bg-white px-8 py-3 font-bold text-black transition-opacity hover:opacity-90"
                >
                    Continue to vote →
                </button>
            </div>
        </div>
    )
}
