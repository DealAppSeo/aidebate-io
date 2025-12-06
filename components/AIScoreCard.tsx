"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIScoreCardProps {
    name: string;
    provider: string;
    score: number;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

const AI_COLORS: Record<string, string> = {
    "Claude": "bg-ai-claude",
    "GPT": "bg-ai-gpt",
    "Gemini": "bg-ai-gemini",
    "Llama": "bg-ai-llama",
    "Mistral": "bg-ai-mistral",
};

const getAIColor = (name: string): string => {
    const key = Object.keys(AI_COLORS).find(k => name.includes(k));
    return key ? AI_COLORS[key] : "bg-primary";
};

const getInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
};

export function AIScoreCard({ name, provider, score, trend = "neutral", className }: AIScoreCardProps) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
    const aiColor = getAIColor(name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "glass glass-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all",
                className
            )}
        >
            <div className="flex items-start gap-4">
                {/* AI Avatar */}
                <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md",
                    aiColor
                )}>
                    {getInitials(name)}
                </div>

                <div className="flex-1 min-w-0">
                    {/* AI Name & Provider */}
                    <h3 className="font-grotesk font-bold text-lg text-foreground truncate">
                        {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{provider}</p>

                    {/* Score */}
                    <div className="mt-3 flex items-baseline gap-2">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-3xl font-bold text-foreground font-mono"
                        >
                            {score}
                        </motion.span>
                        <span className="text-sm text-muted-foreground">RepID</span>
                        <TrendIcon className={cn("w-4 h-4 ml-auto", trendColor)} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
