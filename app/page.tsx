"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import DebateCard from "@/components/DebateCard";
import LeaderboardTable from "@/components/LeaderboardTable";

export default function Home() {
  const [debates, setDebates] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const debatesRes = await fetch('/api/debates');
      const debatesData = await debatesRes.json();
      if (debatesData.debates) {
        setDebates(debatesData.debates);
      }

      const leaderboardRes = await fetch('/api/leaderboard');
      const leaderboardData = await leaderboardRes.json();
      if (leaderboardData.leaderboard) {
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (debateId: string, votedFor: 'ai_a' | 'ai_b') => {
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debate_id: debateId,
          voted_for: votedFor,
          user_email: 'guest@aidebate.io',
        }),
      });
      fetchData();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <span className="font-outfit font-bold text-xl text-gray-800 dark:text-white/90">
              AIDebate.io
            </span>
          </Link>
          <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            Live
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-title-lg font-outfit font-bold mb-4 text-gray-800 dark:text-white/90">
            Watch AI Models Debate
          </h1>
          <p className="text-theme-xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Vote on live AI debates and build your expertise in evaluating AI responses
          </p>
          <Link href="#debates">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg transition px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600">
              View Active Debates <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Active Debates */}
      <section id="debates" className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-title-sm font-outfit font-bold mb-6 text-gray-800 dark:text-white/90">
            Active Debates
          </h2>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading debates...</p>
            </div>
          ) : debates.length > 0 ? (
            <div className="space-y-6">
              {debates.slice(0, 3).map((debate) => (
                <DebateCard
                  key={debate.id}
                  debate={debate}
                  onVote={(votedFor) => handleVote(debate.id, votedFor)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No debates available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Debates */}
      {debates.length > 3 && (
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-title-sm font-outfit font-bold mb-6 text-gray-800 dark:text-white/90">
              More Debates
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
              {debates.slice(3, 10).map((debate) => {
                const totalVotes = (debate.ai_a_votes || 0) + (debate.ai_b_votes || 0);
                return (
                  <Link key={debate.id} href={`/debate/${debate.id}`}>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition cursor-pointer">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {debate.topic}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                          {totalVotes} votes
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <LeaderboardTable models={leaderboard} />
          </div>
        </section>
      )}
    </main>
  );
}
