"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DebatePanelProps {
    aiName: string;
    provider: string;
    response?: string;
    isTyping?: boolean;
    className?: string;
}

const AI_COLORS: Record<string, string> = {
    "Claude": "border-ai-claude",
    "GPT": "border-ai-gpt",
    "Gemini": "border-ai-gemini",
    "Llama": "border-ai-llama",
    "Mistral": "border-ai-mistral",
};

const AI_BG_COLORS: Record<string, string> = {
    "Claude": "bg-ai-claude",
    "GPT": "bg-ai-gpt",
    "Gemini": "bg-ai-gemini",
    "Llama": "bg-ai-llama",
    "Mistral": "bg-ai-mistral",
};

const getAIColor = (name: string): string => {
    const key = Object.keys(AI_COLORS).find(k => name.includes(k));
    return key ? AI_COLORS[key] : "border-primary";
};

const getAIBgColor = (name: string): string => {
    const key = Object.keys(AI_BG_COLORS).find(k => name.includes(k));
    return key ? AI_BG_COLORS[key] : "bg-primary";
};

const getInitials = (name: string): string => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
};

export function DebatePanel({
    aiName,
    provider,
    response = "",
    isTyping = false,
    className,
}: DebatePanelProps) {
    const aiColor = getAIColor(aiName);
    const aiBgColor = getAIBgColor(aiName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "glass glass-border rounded-2xl overflow-hidden shadow-lg",
                "border-l-4",
                aiColor,
                className
            )}
        >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md",
                        aiBgColor
                    )}>
                        {getInitials(aiName)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-grotesk font-bold text-lg text-foreground">
                            {aiName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{provider}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                        AI
                    </Badge>
                </div>
            </div>

            {/* Response Area */}
            <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto">
                <div className="prose prose-invert prose-sm max-w-none">
                    {isTyping ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-sm">Generating response...</span>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                            {response || "Waiting for response..."}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
