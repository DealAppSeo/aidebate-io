import React from 'react';

interface LeaderboardTableProps {
    models: any[];
}

export default function LeaderboardTable({ models }: LeaderboardTableProps) {
    if (!models || models.length === 0) return null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    AI Leaderboard
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Top AI models ranked by overall score
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
                                Score
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {models.map((model, index) => (
                            <tr
                                key={model.id}
                                className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    #{model.current_rank || index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {model.name}
                                        </span>
                                        {index === 0 && (
                                            <span className="text-xs">👑</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {model.provider}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                        {model.overall_score?.toFixed(1) || 0}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
