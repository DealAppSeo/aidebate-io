"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export const DailyDebate = () => {
    const [timeLeft, setTimeLeft] = useState('');
    const [streak, setStreak] = useState(0);
    const [dailyDebate, setDailyDebate] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // 1. Fetch the latest active debate to be the "Daily Debate"
            // Ideally we'd have a 'daily_date' or 'featured' flag, but for now we take the latest.
            const { data: debates } = await supabase
                .from('debates')
                .select('*')
                .in('status', ['active', 'live'])
                .order('created_at', { ascending: false })
                .limit(1);

            if (debates && debates.length > 0) {
                const debate = debates[0];
                setDailyDebate(debate);

                // 2. Check user session and vote status
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    // Get session profile for streak
                    const { data: profile } = await supabase
                        .from('user_sessions')
                        .select('current_streak')
                        .eq('session_id', session.user.id)
                        .single();

                    if (profile) {
                        setStreak(profile.current_streak || 0);
                    }

                    // Check if voted on this specific debate
                    const { data: vote } = await supabase
                        .from('votes')
                        .select('id')
                        .eq('debate_id', debate.id)
                        .eq('session_id', session.user.id)
                        .single();

                    if (vote) {
                        setHasVoted(true);
                    }
                }
            } else {
                // Fallback or empty state if no debates
                console.log("No active debates found");
            }
            setLoading(false);
        };

        fetchData();

        // Timer
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return null; // Or a skeleton
    if (!dailyDebate) return null;

    // Calculate percentages for results view
    const totalVotes = (dailyDebate.vote_count_ai1 || 0) + (dailyDebate.vote_count_ai2 || 0);
    const ai1Percent = totalVotes > 0 ? Math.round(((dailyDebate.vote_count_ai1 || 0) / totalVotes) * 100) : 0;
    const ai2Percent = totalVotes > 0 ? Math.round(((dailyDebate.vote_count_ai2 || 0) / totalVotes) * 100) : 0;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-4 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <div className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold uppercase rounded rounded-full border border-orange-500/30 flex items-center gap-1">
                                <span>🔥 Daily Debate</span>
                            </div>
                            {streak > 0 && (
                                <div className="text-orange-400 font-bold text-sm">
                                    {streak} Day Streak
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-white max-w-md">
                            "{dailyDebate.title}"
                        </h2>

                        {/* If voted, show results (percentages only); otherwise show timer and encouragement */}
                        {hasVoted ? (
                            <div className="space-y-3 w-full max-w-md bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                                <div className="space-y-2">
                                    {/* AI 1 Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>{dailyDebate.ai1_name}</span>
                                            <span className="font-mono">{ai1Percent}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ai1Percent}%` }}
                                                className="h-full bg-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {/* AI 2 Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>{dailyDebate.ai2_name}</span>
                                            <span className="font-mono">{ai2Percent}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ai2Percent}%` }}
                                                className="h-full bg-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Link href={`/debate/${dailyDebate.id}`} className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                                        View Full Discussion &rarr;
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-2">
                                <span>⏰ Next daily in: <span className="font-mono text-gray-300">{timeLeft}</span></span>
                            </div>
                        )}
                    </div>

                    {!hasVoted && (
                        <div className="flex flex-col items-center gap-2">
                            <Link href={`/debate/${dailyDebate.id}`} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/50 hover:scale-105 active:scale-95 text-center min-w-[160px]">
                                Vote Now
                            </Link>
                            <span className="text-xs text-orange-300/70">Keep your streak alive!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
