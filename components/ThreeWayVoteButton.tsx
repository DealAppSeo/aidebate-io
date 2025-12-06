"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThreeWayVoteButtonProps {
    aiName: string;
    aiColor: string;
    emoji: string;
    voteCount: number;
    onVote: () => void;
    disabled?: boolean;
    isWinner?: boolean;
}

export function ThreeWayVoteButton({
    aiName,
    aiColor,
    emoji,
    voteCount,
    onVote,
    disabled = false,
    isWinner = false,
}: ThreeWayVoteButtonProps) {
    return (
        <motion.button
            onClick={onVote}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={cn(
                "relative rounded-2xl p-6 transition-all duration-300",
                "flex flex-col items-center gap-3",
                "border-2",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                isWinner && "ring-2 ring-success ring-offset-2 ring-offset-background"
            )}
            style={{
                borderColor: aiColor,
                backgroundColor: `${aiColor}15`,
            }}
        >
            {/* AI Emoji */}
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: aiColor }}
            >
                {emoji}
            </div>

            {/* AI Name */}
            <div className="text-center">
                <h3 className="font-display font-bold text-lg text-foreground">
                    {aiName}
                </h3>
            </div>

            {/* Vote Count */}
            <div className="flex items-center gap-2">
                <motion.span
                    key={voteCount}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-mono font-bold"
                    style={{ color: aiColor }}
                >
                    {voteCount.toLocaleString()}
                </motion.span>
                <span className="text-sm text-muted-foreground">votes</span>
            </div>

            {/* Winner Badge */}
            {isWinner && (
                <div className="absolute -top-3 -right-3 bg-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🏆 WINNER
                </div>
            )}
        </motion.button>
    );
}
