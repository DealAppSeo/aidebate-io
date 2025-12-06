"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Zap, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
    // Mock User Data
    const user = {
        name: "You",
        email: "user@example.com",
        repid: 120,
        tier: "Observer",
        nextTier: "Voter",
        progress: 60, // 60% to next tier
        stats: {
            votes: 12,
            accuracy: "84%",
            streak: 3,
            longestStreak: 5
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-white/5">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="font-display font-bold text-3xl">Your Profile</h1>
                </div>

                {/* Header Card */}
                <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge variant="outline" className="border-primary/50 text-primary">
                            {user.tier} Tier
                        </Badge>
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        <Avatar className="w-20 h-20 border-2 border-primary">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                                {user.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-3xl font-mono font-bold text-neon-gold">{user.repid}</span>
                                <span className="text-sm text-muted-foreground">RepID</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress to {user.nextTier}</span>
                            <span className="text-primary">{user.progress}%</span>
                        </div>
                        <Progress value={user.progress} className="h-2 bg-muted/20" />
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Vote 8 more times to unlock {user.nextTier} status
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Card className="p-4 bg-card border-white/5 flex flex-col items-center text-center">
                        <Target className="w-6 h-6 text-neon-cyan mb-2" />
                        <div className="text-2xl font-mono font-bold">{user.stats.votes}</div>
                        <div className="text-xs text-muted-foreground">Total Votes</div>
                    </Card>
                    <Card className="p-4 bg-card border-white/5 flex flex-col items-center text-center">
                        <Shield className="w-6 h-6 text-neon-green mb-2" />
                        <div className="text-2xl font-mono font-bold">{user.stats.accuracy}</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                    </Card>
                    <Card className="p-4 bg-card border-white/5 flex flex-col items-center text-center">
                        <Zap className="w-6 h-6 text-neon-gold mb-2" />
                        <div className="text-2xl font-mono font-bold">{user.stats.streak}</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                    </Card>
                    <Card className="p-4 bg-card border-white/5 flex flex-col items-center text-center">
                        <Award className="w-6 h-6 text-neon-pink mb-2" />
                        <div className="text-2xl font-mono font-bold">{user.stats.longestStreak}</div>
                        <div className="text-xs text-muted-foreground">Best Streak</div>
                    </Card>
                </div>

                {/* Alter Ego Teaser */}
                <div className="bg-gradient-to-br from-muted/20 to-transparent border border-white/5 rounded-2xl p-6 text-center opacity-75">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <span className="text-2xl">🎭</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">AI Alter Ego</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Reach 500 RepID to unlock your personal AI avatar that learns from your voting patterns.
                    </p>
                    <Button variant="outline" disabled className="w-full opacity-50">
                        Locked (Requires 500 RepID)
                    </Button>
                </div>
            </div>
        </div>
    );
}
