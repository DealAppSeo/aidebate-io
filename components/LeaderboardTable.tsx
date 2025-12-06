import React from 'react';
import { Database } from '@/lib/supabase';

type AIModel = Database['public']['Tables']['ai_models']['Row'];

interface LeaderboardTableProps {
    models: AIModel[];
    limit?: number;
}

export default function LeaderboardTable({ models, limit = 10 }: LeaderboardTableProps) {
    const topModels = models
        .sort((a, b) => b.overall_repid - a.overall_repid)
        .slice(0, limit);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    AI Trust Scores Leaderboard
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Top performing AI models ranked by overall reputation
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Rank
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Model
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Provider
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Trust Score
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Win Rate
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-medium uppercase text-gray-400">
                                Total Votes
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {topModels.map((model, index) => (
                            <tr
                                key={model.id}
                                className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    #{index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {model.name}
                                        </span>
                                        {index === 0 && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-theme-xs bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                                                👑 Top
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {model.provider}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                        {model.overall_repid.toFixed(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ${model.win_rate >= 0.6
                                                ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
                                                : model.win_rate >= 0.4
                                                    ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400'
                                                    : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
                                            }`}
                                    >
                                        {(model.win_rate * 100).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {model.total_votes.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
