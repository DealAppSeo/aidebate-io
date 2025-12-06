import React from 'react';
import { Database } from '@/lib/supabase';

type AIModel = Database['public']['Tables']['ai_models']['Row'];
type Debate = Database['public']['Tables']['debates']['Row'];
type Topic = Database['public']['Tables']['aidebate_topics']['Row'];

interface DebateCardProps {
    debate: Debate;
    topic: Topic;
    modelA: AIModel;
    modelB: AIModel;
    modelC?: AIModel | null;
    onVote?: (votedFor: 'model_a' | 'model_b' | 'model_c') => void;
    showVoteButtons?: boolean;
}

export default function DebateCard({
    debate,
    topic,
    modelA,
    modelB,
    modelC,
    onVote,
    showVoteButtons = true,
}: DebateCardProps) {
    const totalVotes = debate.model_a_votes + debate.model_b_votes + debate.model_c_votes;

    const getVotePercentage = (votes: number) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    {topic.title}
                </h3>
                {topic.viral_hook && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {topic.viral_hook}
                    </p>
                )}
            </div>

            {/* Card Body - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Model A Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                {modelA.name}
                            </span>
                            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                {modelA.provider}
                            </span>
                        </div>
                    </div>

                    {debate.model_a_response && (
                        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {debate.model_a_response}
                            </p>
                        </div>
                    )}

                    {/* Vote Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            {debate.model_a_votes} votes ({getVotePercentage(debate.model_a_votes)}%)
                        </span>
                    </div>

                    {/* Vote Button */}
                    {showVoteButtons && onVote && (
                        <button
                            onClick={() => onVote('model_a')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
                        >
                            Vote for {modelA.name}
                        </button>
                    )}
                </div>

                {/* Model B Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                                {modelB.name}
                            </span>
                            <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                {modelB.provider}
                            </span>
                        </div>
                    </div>

                    {debate.model_b_response && (
                        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {debate.model_b_response}
                            </p>
                        </div>
                    )}

                    {/* Vote Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            {debate.model_b_votes} votes ({getVotePercentage(debate.model_b_votes)}%)
                        </span>
                    </div>

                    {/* Vote Button */}
                    {showVoteButtons && onVote && (
                        <button
                            onClick={() => onVote('model_b')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-5 py-3.5 text-sm bg-success-500 text-white shadow-theme-xs hover:bg-success-600"
                        >
                            Vote for {modelB.name}
                        </button>
                    )}
                </div>
            </div>

            {/* Model C (Optional Third Column) */}
            {modelC && debate.model_c_response && (
                <div className="px-6 pb-6">
                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                                    {modelC.name}
                                </span>
                                <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                                    {modelC.provider}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {debate.model_c_response}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                                {debate.model_c_votes} votes ({getVotePercentage(debate.model_c_votes)}%)
                            </span>
                        </div>

                        {showVoteButtons && onVote && (
                            <button
                                onClick={() => onVote('model_c')}
                                className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-5 py-3.5 text-sm bg-warning-500 text-white shadow-theme-xs hover:bg-warning-600"
                            >
                                Vote for {modelC.name}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
