"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
    aiName: string;
    voteCount?: number;
    onVote?: () => void;
    disabled?: boolean;
    className?: string;
}

export function VoteButton({ aiName, voteCount = 0, onVote, disabled, className }: VoteButtonProps) {
    const [hasVoted, setHasVoted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentCount, setCurrentCount] = useState(voteCount);

    const handleVote = () => {
        if (disabled || hasVoted) return;

        setIsAnimating(true);
        setHasVoted(true);
        setCurrentCount(prev => prev + 1);

        onVote?.();

        toast.success(`Voted for ${aiName}!`, {
            description: "+10 RepID earned",
            duration: 3000,
        });

        setTimeout(() => setIsAnimating(false), 600);
    };

    return (
        <div className={cn("relative", className)}>
            <motion.button
                onClick={handleVote}
                disabled={disabled || hasVoted}
                whileHover={!hasVoted ? { scale: 1.02 } : {}}
                whileTap={!hasVoted ? { scale: 0.98 } : {}}
                className={cn(
                    "w-full rounded-full px-8 py-4 font-bold text-lg transition-all duration-300 shadow-lg",
                    "flex items-center justify-center gap-3",
                    hasVoted
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl hover:shadow-primary/50"
                )}
            >
                <AnimatePresence mode="wait">
                    {hasVoted ? (
                        <motion.div
                            key="voted"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>Voted</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="vote"
                            initial={{ scale: 1 }}
                            className="flex items-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
                            <span>Vote for {aiName}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vote Count */}
                {currentCount > 0 && (
                    <motion.span
                        key={currentCount}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="ml-auto bg-background/20 px-3 py-1 rounded-full text-sm font-mono"
                    >
                        {currentCount.toLocaleString()}
                    </motion.span>
                )}
            </motion.button>

            {/* Confetti Animation */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-success rounded-full"
                                initial={{
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                }}
                                animate={{
                                    x: Math.cos((i * Math.PI) / 4) * 100,
                                    y: Math.sin((i * Math.PI) / 4) * 100,
                                    scale: 0,
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
