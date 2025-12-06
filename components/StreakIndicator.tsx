"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
    streak: number;
    multiplier: number;
    className?: string;
}

const STREAK_LABELS: Record<number, { label: string; color: string }> = {
    3: { label: "🔥 On Fire", color: "#F59E0B" },
    5: { label: "🔥🔥 Blazing", color: "#EF4444" },
    7: { label: "🔥🔥🔥 Unstoppable", color: "#EF4444" },
    10: { label: "💎 LEGENDARY", color: "linear-gradient(135deg, #F59E0B, #EF4444, #8B5CF6)" },
};

export function StreakIndicator({ streak, multiplier, className }: StreakIndicatorProps) {
    if (streak < 3) return null;

    const streakData = STREAK_LABELS[Math.min(streak, 10)] || STREAK_LABELS[7];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-warning/10 border border-warning/30",
                className
            )}
        >
            <Flame className="w-4 h-4 text-warning" />
            <div className="flex items-center gap-2">
                <span className="font-bold text-warning">{streak} streak</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono font-bold text-warning">{multiplier}× multiplier</span>
            </div>
        </motion.div>
    );
}
