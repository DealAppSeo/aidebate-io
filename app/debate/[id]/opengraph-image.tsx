import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'
export const alt = 'AI Debate'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
    const parameterId = (await params).id // Await params in newer Next.js versions

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for public read
    )

    const { data: debate } = await supabase
        .from('debates')
        .select('topic, ai_a_name, ai_b_name, ai_a_votes, ai_b_votes')
        .eq('id', parameterId)
        .single()

    if (!debate) {
        return new ImageResponse(
            <div style={{ color: 'white', background: 'black', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Debate not found
            </div>
        )
    }

    const total = (debate.ai_a_votes || 0) + (debate.ai_b_votes || 0)
    const aPercent = total > 0 ? Math.round((debate.ai_a_votes || 0) / total * 100) : 50
    const bPercent = 100 - aPercent

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    padding: 40,
                }}
            >
                {/* Logo */}
                <div style={{ fontSize: 24, color: '#3B82F6', marginBottom: 20 }}>
                    ⚡ AIDebate.io
                </div>

                {/* Topic */}
                <div
                    style={{
                        fontSize: 48,
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: 40,
                        maxWidth: 900,
                    }}
                >
                    {debate.topic}
                </div>

                {/* VS Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    {/* AI A */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: '#8B5CF6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 48,
                                color: 'white',
                                marginBottom: 10,
                            }}
                        >
                            A
                        </div>
                        <div style={{ fontSize: 24, color: 'white' }}>{debate.ai_a_name}</div>
                        <div style={{ fontSize: 36, color: '#8B5CF6', fontWeight: 'bold' }}>
                            {aPercent}%
                        </div>
                    </div>

                    {/* VS */}
                    <div style={{ fontSize: 36, color: '#666' }}>VS</div>

                    {/* AI B */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: '#F59E0B',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 48,
                                color: 'white',
                                marginBottom: 10,
                            }}
                        >
                            B
                        </div>
                        <div style={{ fontSize: 24, color: 'white' }}>{debate.ai_b_name}</div>
                        <div style={{ fontSize: 36, color: '#F59E0B', fontWeight: 'bold' }}>
                            {bPercent}%
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div
                    style={{
                        marginTop: 40,
                        fontSize: 24,
                        color: '#3B82F6',
                    }}
                >
                    Cast your vote →
                </div>
            </div>
        ),
        { ...size }
    )
}
