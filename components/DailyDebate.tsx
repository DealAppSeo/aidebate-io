"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export const DailyDebate = () => {
    const [timeLeft, setTimeLeft] = useState('');
    const [streak, setStreak] = useState(0);
    const [dailyDebate, setDailyDebate] = useState<any>(null);
    const [hasVotedToday, setHasVotedToday] = useState(false);

    useEffect(() => {
        // Fetch daily debate and user streak
        const fetchData = async () => {
            const supabase = createClient();

            // Mock: In real app, fetch from API/DB
            // For now, let's just pick a consistent debate ID for "today"
            // or fetch the one marked as daily.
            // Let's assume ID '8' (Should AI Have Rights?) is today's daily for demo

            setDailyDebate({
                id: '8',
                title: 'Should AI Have Rights Like Humans?',
                category: 'Ethics'
            });

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('user_sessions')
                    .select('current_streak, last_vote_date') // Assuming we add last_vote_date
                    .eq('session_id', session.user.id)
                    .single();

                if (profile) {
                    setStreak(profile.current_streak || 0);
                    // Check if voted today logic here
                }
            }
        };

        fetchData();

        // Timer
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!dailyDebate) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 text-center md:text-left">
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
                        <div className="text-sm text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <span>⏰ Next daily in: <span className="font-mono text-gray-300">{timeLeft}</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Link href={`/debate/${dailyDebate.id}`} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-900/50 hover:scale-105 active:scale-95 text-center min-w-[160px]">
                            Vote Now
                        </Link>
                        <span className="text-xs text-orange-300/70">Keep your streak alive!</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
