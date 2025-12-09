
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useEngagementCap } from '@/hooks/useEngagementCap';

interface Poll {
    id: string;
    question: string;
    options: string[];
    order: number;
}

interface PollResult {
    option_index: number;
    count: number;
    percent: number;
}

export const PostDebateSurvey = ({ onComplete }: { onComplete: () => void }) => {
    const [poll, setPoll] = useState<Poll | null>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [results, setResults] = useState<PollResult[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [totalVotes, setTotalVotes] = useState(0);

    const { addEngagement } = useEngagementCap();

    const supabase = createClient();

    const fetchNextPoll = async () => {
        setLoading(true);
        setHasVoted(false);
        setSelectedOption(null);
        setResults([]);

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setLoading(false);
            return;
        }

        // 1. Get IDs of polls user has already voted on
        const { data: myVotes } = await supabase
            .from('poll_votes')
            .select('poll_id')
            .eq('session_id', session.user.id);

        const votedPollIds = myVotes?.map(v => v.poll_id) || [];

        // 2. Fetch the first poll NOT in that list, ordered by 'order'
        let query = supabase
            .from('polls')
            .select('*')
            .order('order', { ascending: true })
            .limit(1);

        if (votedPollIds.length > 0) {
            // @ts-ignore
            query = query.not('id', 'in', `(${votedPollIds.join(',')})`);
        }

        const { data: polls } = await query;

        if (polls && polls.length > 0) {
            setPoll(polls[0]);
        } else {
            // No more polls!
            setPoll(null);
            onComplete();
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNextPoll();
    }, []);

    const handleVote = async (optionIndex: number) => {
        if (voting || hasVoted || !poll) return;
        setVoting(true);
        setSelectedOption(optionIndex);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Optimistic UI update could happen here, but we'll fetch real stats for accuracy

        // 1. Insert Vote
        await supabase.from('poll_votes').insert({
            poll_id: poll.id,
            session_id: session.user.id,
            option_index: optionIndex
        });

        // 2. Trigger Auto-Generation Check (via API) if this was the last poll? 
        // We can do this async or let the API handle it. For now, just client side logic.
        // Actually, we should probably hit an API endpoint to vote so we can handle the "trigger generation" logic securely on server.
        // But for MVP speed, let's insert directly and we can add the trigger in a separate call or edge function.
        // Let's call the trigger endpoint in background.
        fetch('/api/polls/trigger-check', {
            method: 'POST',
            body: JSON.stringify({ pollId: poll.id }),
            headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error("Trigger check failed", err));


        // 3. Fetch Results
        const { data: allVotes } = await supabase
            .from('poll_votes')
            .select('option_index')
            .eq('poll_id', poll.id);

        if (allVotes) {
            const total = allVotes.length;
            setTotalVotes(total);

            // Calculate stats
            const counts = new Array(poll.options.length).fill(0);
            allVotes.forEach(v => counts[v.option_index]++);

            const res = counts.map((count, idx) => ({
                option_index: idx,
                count,
                percent: total === 0 ? 0 : Math.round((count / total) * 100)
            }));
            setResults(res);
        }

        setHasVoted(true);
        setVoting(false);
        addEngagement();
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading conversation...</div>;

    // If completed or null (though onComplete should handle unmounting), show nothing
    if (!poll) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-24 h-24 text-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase rounded-full border border-indigo-500/30">
                            Community Pulse
                        </span>
                        <span className="text-xs text-indigo-400/60">Question #{poll.order}</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
                        {poll.question}
                    </h2>

                    <div className="space-y-3">
                        <AnimatePresence mode="wait">
                            {!hasVoted ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {poll.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleVote(idx)}
                                            disabled={voting}
                                            className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 transition-all group active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-gray-200 font-medium">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {poll.options.map((option, idx) => {
                                        const stat = results.find(r => r.option_index === idx) || { percent: 0, count: 0 };
                                        const isSelected = selectedOption === idx;

                                        return (
                                            <div key={idx} className="relative p-3 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
                                                {/* Progress Bar Background */}
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stat.percent}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`absolute top-0 left-0 h-full opacity-20 ${isSelected ? 'bg-indigo-500' : 'bg-gray-500'}`}
                                                />

                                                <div className="relative flex justify-between items-center z-10">
                                                    <div className="flex items-center gap-2">
                                                        {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400" />}
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                            {option}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-400">
                                                        {stat.percent}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                                        <span className="text-xs text-gray-500">{totalVotes} votes</span>
                                        <button
                                            onClick={fetchNextPoll}
                                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-900/50"
                                        >
                                            Next Question <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
