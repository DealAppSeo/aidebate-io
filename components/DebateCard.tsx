import React from 'react';

interface DebateCardProps {
    debate: any; // Simplified - debate object from API
    onVote?: (votedFor: 'ai_a' | 'ai_b') => void;
    showVoteButtons?: boolean;
}

export default function DebateCard({
    debate,
    onVote,
    showVoteButtons = true,
}: DebateCardProps) {
    const totalVotes = (debate.ai_a_votes || 0) + (debate.ai_b_votes || 0);

    const getVotePercentage = (votes: number) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    {debate.topic}
                </h3>
                {debate.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {debate.description}
                    </p>
                )}
            </div>

            {/* Card Body - Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* AI A Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                            {debate.ai_a_name}
                        </span>
                    </div>

                    {debate.ai_a_position && (
                        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {debate.ai_a_position}
                            </p>
                        </div>
                    )}

                    {/* Vote Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            {debate.ai_a_votes || 0} votes ({getVotePercentage(debate.ai_a_votes || 0)}%)
                        </span>
                    </div>

                    {/* Vote Button */}
                    {showVoteButtons && onVote && (
                        <button
                            onClick={() => onVote('ai_a')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
                        >
                            Vote for {debate.ai_a_name}
                        </button>
                    )}
                </div>

                {/* AI B Column */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                            {debate.ai_b_name}
                        </span>
                    </div>

                    {debate.ai_b_position && (
                        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {debate.ai_b_position}
                            </p>
                        </div>
                    )}

                    {/* Vote Count */}
                    <div className="flex items-center justify-between">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                            {debate.ai_b_votes || 0} votes ({getVotePercentage(debate.ai_b_votes || 0)}%)
                        </span>
                    </div>

                    {/* Vote Button */}
                    {showVoteButtons && onVote && (
                        <button
                            onClick={() => onVote('ai_b')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg transition w-full px-5 py-3.5 text-sm bg-success-500 text-white shadow-theme-xs hover:bg-success-600"
                        >
                            Vote for {debate.ai_b_name}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
