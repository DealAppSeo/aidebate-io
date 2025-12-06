"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaderboard } from "@/components/Leaderboard";

// Mock Data (Fallback)
const MOCK_AI_RANKINGS = [
    { rank: 1, id: "1", name: "Claude 3.5 Sonnet", score: 85, votes: 1240, trend: "up" as const },
    { rank: 2, id: "2", name: "GPT-4o", score: 82, votes: 1150, trend: "neutral" as const },
    { rank: 3, id: "3", name: "Gemini 1.5 Pro", score: 78, votes: 890, trend: "down" as const },
    { rank: 4, id: "4", name: "Llama 3 70B", score: 74, votes: 620, trend: "up" as const },
    { rank: 5, id: "5", name: "Mistral Large", score: 71, votes: 450, trend: "neutral" as const },
];

const MOCK_USER_RANKINGS = [
    { rank: 1, id: "u1", name: "Neo_Voter", score: 2450, votes: 145, trend: "up" as const },
    { rank: 2, id: "u2", name: "AI_Watcher", score: 2100, votes: 120, trend: "up" as const },
    { rank: 3, id: "u3", name: "TruthSeeker", score: 1950, votes: 110, trend: "neutral" as const },
    { rank: 47, id: "u47", name: "You", score: 120, votes: 12, trend: "up" as const },
];

export default function LeaderboardPage() {
    const [aiRankings, setAiRankings] = useState<any[]>(MOCK_AI_RANKINGS);
    const [userRankings, setUserRankings] = useState<any[]>(MOCK_USER_RANKINGS);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    if (data.ai && data.ai.length > 0) setAiRankings(data.ai);
                    if (data.users && data.users.length > 0) setUserRankings(data.users);
                }
            } catch (e) {
                console.log("Using mock leaderboard data");
            }
        };
        fetchData();
    }, []);
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-white/5">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-display font-bold text-3xl">Leaderboard</h1>
                        <p className="text-muted-foreground">The most trusted AIs and top contributors</p>
                    </div>
                </div>

                <Tabs defaultValue="ai" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/20 p-1 rounded-xl">
                        <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
                            <Trophy className="w-4 h-4 mr-2" /> AI Rankings
                        </TabsTrigger>
                        <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
                            <Users className="w-4 h-4 mr-2" /> Top Voters
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai">
                        <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-card border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-mono font-bold">12.8k</div>
                                        <div className="text-xs text-muted-foreground">Total Votes</div>
                                    </div>
                                </div>
                                <div className="bg-card border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center text-neon-cyan">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-mono font-bold">Claude</div>
                                        <div className="text-xs text-muted-foreground">Current Leader</div>
                                    </div>
                                </div>
                            </div>

                            <Leaderboard data={aiRankings} type="ai" />
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/20 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                    47
                                </div>
                                <div>
                                    <div className="font-bold">Your Rank</div>
                                    <div className="text-xs text-muted-foreground">Top 5% of voters</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-xl">120</div>
                                <div className="text-xs text-muted-foreground">RepID</div>
                            </div>
                        </div>

                        <Leaderboard data={userRankings} type="user" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
