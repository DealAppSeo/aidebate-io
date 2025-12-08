'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface UpNextQueueProps {
    currentDebateId: string;
    currentTopic: string;
}

export const UpNextQueue = ({ currentDebateId, currentTopic }: UpNextQueueProps) => {
    const [queue, setQueue] = useState<string[]>([]);
    const router = useRouter();

    // Mock suggested debate for MVP - in real app, fetch from API/Recommendation
    const suggestedDebate = {
        id: "debate_2_how_dangerous_is_superintelligent_ai", // Hardcoded fallback for now
        topic: "How Dangerous Is Superintelligent AI Really?",
        ai_a_name: "Claude",
        ai_b_name: "Grok"
    };

    const addToQueue = (debateId: string) => {
        setQueue(prev => [...prev, debateId]);
        // Toast would go here
    };

    if (!suggestedDebate) return null;

    return (
        <div className="bg-gray-800/50 rounded-xl p-4 mt-4 border border-white/5">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Up Next</h3>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white font-medium text-sm line-clamp-1">{suggestedDebate.topic}</p>
                    <p className="text-xs text-gray-500">
                        {suggestedDebate.ai_a_name} vs {suggestedDebate.ai_b_name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => addToQueue(suggestedDebate.id)}
                        className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg text-xs transition-colors"
                    >
                        + Queue
                    </button>
                    <button
                        onClick={() => router.push(`/debate/${suggestedDebate.id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                        Play Now →
                    </button>
                </div>
            </div>

            {queue.length > 0 && (
                <p className="text-[10px] text-gray-500 mt-2">
                    {queue.length} debate{queue.length > 1 ? 's' : ''} in queue
                </p>
            )}
        </div>
    );
};
