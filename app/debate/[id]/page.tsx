"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import DebateCard from "@/components/DebateCard";
import { Database } from "@/lib/supabase";

type AIModel = Database['public']['Tables']['ai_models']['Row'];
type Debate = Database['public']['Tables']['debates']['Row'];
type Topic = Database['public']['Tables']['aidebate_topics']['Row'];

interface DebateWithTopic extends Debate {
    aidebate_topics: Topic;
}

export default function DebatePage() {
    const params = useParams();
    const router = useRouter();
    const debateId = params.id as string;

    const [debate, setDebate] = useState<DebateWithTopic | null>(null);
    const [models, setModels] = useState<Record<number, AIModel>>({});
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);

    useEffect(() => {
        if (debateId) {
            fetchDebate();
            fetchModels();
        }
    }, [debateId]);

    const fetchDebate = async () => {
        try {
            const res = await fetch(`/api/debates?id=${debateId}`);
            const data = await res.json();
            if (data.debate) {
                setDebate(data.debate);
            }
        } catch (error) {
            console.error("Error fetching debate:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async () => {
        try {
            const res = await fetch('/api/models');
            const data = await res.json();
            if (data.models) {
                const modelsMap: Record<number, AIModel> = {};
                data.models.forEach((model: AIModel) => {
                    modelsMap[model.id] = model;
                });
                setModels(modelsMap);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const handleVote = async (votedFor: 'model_a' | 'model_b' | 'model_c') => {
        try {
            await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    debate_id: parseInt(debateId),
                    voted_for: votedFor,
                    user_email: 'guest@aidebate.io', // TODO: Replace with actual user email from auth
                }),
            });
            setVoted(true);
            // Refresh debate data
            fetchDebate();
        } catch (error) {
            console.error("Error voting:", error);
        }
    };

    const getModelById = (id: string): AIModel | undefined => {
        return models[parseInt(id)];
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Loading debate...</p>
            </main>
        );
    }

    if (!debate) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Debate not found</p>
                    <Link href="/">
                        <button className="inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </button>
                    </Link>
                </div>
            </main>
        );
    }

    const topic = debate.aidebate_topics;
    const modelA = getModelById(topic.model_a);
    const modelB = getModelById(topic.model_b);
    const modelC = topic.model_c ? getModelById(topic.model_c) : null;

    if (!modelA || !modelB) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Error loading AI models</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <Sparkles className="w-6 h-6 text-brand-500" />
                        <span className="font-outfit font-bold text-xl text-gray-800 dark:text-white/90">
                            AIDebate.io
                        </span>
                    </Link>
                    <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                        {debate.status}
                    </span>
                </div>
            </header>

            {/* Debate Content */}
            <section className="px-6 py-12">
                <div className="max-w-7xl mx-auto">
                    {voted && (
                        <div className="mb-6 rounded-lg bg-success-50 dark:bg-success-500/15 border border-success-200 dark:border-success-500/30 p-4">
                            <p className="text-sm font-medium text-success-600 dark:text-success-500">
                                ✓ Your vote has been recorded! Thank you for participating.
                            </p>
                        </div>
                    )}

                    <DebateCard
                        debate={debate}
                        topic={topic}
                        modelA={modelA}
                        modelB={modelB}
                        modelC={modelC}
                        onVote={handleVote}
                        showVoteButtons={!voted && debate.status === 'active'}
                    />

                    {/* Additional Info */}
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
                        <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
                            Debate Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Total Votes
                                </p>
                                <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                                    {(debate.model_a_votes + debate.model_b_votes + debate.model_c_votes).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Total Views
                                </p>
                                <p className="text-lg font-medium text-gray-800 dark:text-white/90">
                                    {debate.total_views.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-theme-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Status
                                </p>
                                <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                                    {debate.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
