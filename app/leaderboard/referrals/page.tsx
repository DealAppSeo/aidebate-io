'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Header from '@/components/layout/Header'
import { Trophy, Users, Gift, TrendingUp, Share2 } from 'lucide-react'
import { ShareModal } from '@/components/modals/ShareModal'

export default function ReferralLeaderboard() {
    const [leaders, setLeaders] = useState<any[]>([])
    const [myRank, setMyRank] = useState<any>(null)
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'alltime'>('week')
    const [showShare, setShowShare] = useState(false)
    const [session, setSession] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const s = localStorage.getItem('aidebate_session_id')
        setSession(s)
        fetchLeaderboard(s)
    }, [timeframe])

    async function fetchLeaderboard(currentSessionId: string | null) {
        // Note: Timeframe filtering would require 'created_at' on referral_events or user_sessions metrics
        // For MVP we just show all time sorted by referral_count
        const { data } = await supabase
            .from('user_sessions')
            .select('session_id, referral_count, referral_repid_earned, repid_score')
            .gt('referral_count', 0)
            .order('referral_count', { ascending: false })
            .limit(50)

        setLeaders(data || [])

        if (currentSessionId) {
            const myData = data?.find(l => l.session_id === currentSessionId)
            // If not in top 50, fetch separately? For now just use if found.
            if (myData) {
                setMyRank({
                    ...myData,
                    rank: (data?.indexOf(myData) || 0) + 1
                })
            } else {
                // Fetch my data if not in top 50
                const { data: myDataDirect } = await supabase
                    .from('user_sessions')
                    .select('session_id, referral_count, referral_repid_earned')
                    .eq('session_id', currentSessionId)
                    .single()

                if (myDataDirect) {
                    setMyRank({ ...myDataDirect, rank: '50+' })
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-black">
            <Header />
            <div className="max-w-3xl mx-auto p-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-500" />
                    Top Referrers
                </h1>
                <p className="text-gray-400 mb-8">
                    Invite friends. Grow the community. Earn +25 RepID for every vote.
                </p>

                {/* Timeframe Toggle */}
                <div className="flex gap-2 mb-6">
                    {(['week', 'month', 'alltime'] as const).map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${timeframe === tf
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-[#27272a] text-gray-400 hover:bg-[#3a3a3a]'
                                }`}
                        >
                            {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>

                {/* My Rank Card */}
                {myRank && (
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-6 mb-8 shadow-lg shadow-purple-900/10">
                        <p className="text-sm text-purple-300 font-bold uppercase tracking-wider mb-2">Your Performance</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-4xl font-bold text-white">#{myRank.rank}</p>
                                    <p className="text-xs text-gray-400 mt-1">Global Rank</p>
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{myRank.referral_count}</p>
                                    <p className="text-xs text-gray-400 mt-1">Friends Referred</p>
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-400">+{myRank.referral_repid_earned}</p>
                                    <p className="text-xs text-gray-400 mt-1">RepID Earned</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShare(true)}
                                className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                            >
                                <Share2 className="w-4 h-4" />
                                Invite More
                            </button>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                <div className="bg-[#111] border border-[#27272a] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-[#0a0a0a] text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-[#27272a]">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">User</div>
                        <div className="col-span-3 text-center">Referrals</div>
                        <div className="col-span-3 text-right">Earned</div>
                    </div>

                    {/* Rows */}
                    {leaders.map((leader, idx) => (
                        <div
                            key={leader.session_id}
                            className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-[#27272a] last:border-0 hover:bg-white/5 transition ${leader.session_id === session
                                    ? 'bg-purple-900/10'
                                    : ''
                                }`}
                        >
                            <div className="col-span-1">
                                {idx < 3 ? (
                                    <span className="text-xl">
                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 font-medium font-mono text-sm">{(idx + 1).toString().padStart(2, '0')}</span>
                                )}
                            </div>
                            <div className="col-span-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-800'
                                        }`}>
                                        {leader.session_id.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`font-medium ${leader.session_id === session ? 'text-purple-400' : 'text-gray-300'}`}>
                                        {leader.session_id.slice(0, 8)}...
                                        {leader.session_id === session && ' (You)'}
                                    </span>
                                </div>
                            </div>
                            <div className="col-span-3 text-center">
                                <span className="text-white font-bold">{leader.referral_count}</span>
                            </div>
                            <div className="col-span-3 text-right">
                                <span className="text-yellow-500 font-bold">+{leader.referral_repid_earned}</span>
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="p-12 text-center text-gray-500 bg-[#0a0a0a]">
                            No referrals yet. Be the first to top the leaderboard!
                        </div>
                    )}
                </div>

                {/* Rewards Tiers */}
                <div className="mt-12">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-yellow-500" />
                        Milestone Rewards
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <RewardTier
                            count={5}
                            reward="Early Access Badge"
                            icon="🌟"
                            achieved={(myRank?.referral_count || 0) >= 5}
                        />
                        <RewardTier
                            count={10}
                            reward="500 Bonus RepID"
                            icon="💰"
                            achieved={(myRank?.referral_count || 0) >= 10}
                        />
                        <RewardTier
                            count={25}
                            reward="Custom AI Voice"
                            icon="🎙️"
                            achieved={(myRank?.referral_count || 0) >= 25}
                        />
                    </div>
                </div>
            </div>

            <ShareModal
                isOpen={showShare}
                onClose={() => setShowShare(false)}
                debate={{
                    id: 'general', // Generic share
                    topic: 'Join the Future of AI Debate',
                    ai_a_name: 'AI A',
                    ai_b_name: 'AI B'
                }}
            />
        </div>
    )
}

function RewardTier({ count, reward, icon, achieved }: {
    count: number
    reward: string
    icon: string
    achieved: boolean
}) {
    return (
        <div className={`p-6 rounded-xl border text-center relative overflow-hidden group ${achieved
                ? 'bg-yellow-900/20 border-yellow-500/50'
                : 'bg-[#111] border-[#27272a]'
            }`}>
            {achieved && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>}
            <div className="text-4xl mb-3 transform group-hover:scale-110 transition">{icon}</div>
            <div className="text-white font-bold text-lg">{count} Referrals</div>
            <div className="text-sm text-gray-400 mt-1">{reward}</div>
            {achieved ? (
                <div className="text-xs text-yellow-400 mt-4 font-bold bg-yellow-900/50 py-1 px-3 rounded-full inline-block">✓ UNLOCKED</div>
            ) : (
                <div className="text-xs text-gray-600 mt-4">Locked</div>
            )}
        </div>
    )
}
