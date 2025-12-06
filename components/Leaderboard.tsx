"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    avatarUrl?: string;
    score: number;
    votes: number;
    trend: "up" | "down" | "neutral";
}

interface LeaderboardProps {
    data: LeaderboardEntry[];
    type?: "ai" | "user";
    className?: string;
}

export function Leaderboard({ data, type = "ai", className }: LeaderboardProps) {

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up": return <ArrowUpRight className="w-4 h-4 text-neon-green" />;
            case "down": return <ArrowDownRight className="w-4 h-4 text-destructive" />;
            default: return <Minus className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className={cn("rounded-xl border border-white/5 overflow-hidden", className)}>
            <Table>
                <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="w-[60px] text-center">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">RepID</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Votes</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((entry) => (
                        <TableRow key={entry.id} className="hover:bg-muted/10 border-white/5 transition-colors">
                            <TableCell className="font-mono text-center text-muted-foreground">
                                {entry.rank}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border border-white/10">
                                        <AvatarImage src={entry.avatarUrl} />
                                        <AvatarFallback>{entry.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{entry.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-primary">
                                {entry.score}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                                {entry.votes.toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-center">
                                    {getTrendIcon(entry.trend)}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
