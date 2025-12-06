"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface ShareCardProps {
    debateTopic: string;
    votedFor?: string;
    shareUrl: string;
}

export function ShareCard({ debateTopic, votedFor, shareUrl }: ShareCardProps) {

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
    };

    const handleShare = (platform: "twitter" | "linkedin") => {
        const text = votedFor
            ? `I just voted for ${votedFor} in the debate: "${debateTopic}". Who do you trust? #AIDebate`
            : `Watch AI debate AI: "${debateTopic}". Help keep AI honest! #AIDebate`;

        let url = "";
        if (platform === "twitter") {
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        } else {
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        }

        window.open(url, "_blank");
        toast.success("Opening share dialog...", { description: "+5 RepID bonus!" });
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-card to-muted/20 border-white/10">
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold font-display mb-2">Share & Earn RepID</h3>
                <p className="text-sm text-muted-foreground">
                    Invite friends to vote. You earn <span className="text-neon-gold font-bold">+15-35 RepID</span> for every conversion!
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                    variant="outline"
                    className="w-full gap-2 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
                    onClick={() => handleShare("linkedin")}
                >
                    <Linkedin className="w-4 h-4" /> LinkedIn
                </Button>
                <Button
                    variant="outline"
                    className="w-full gap-2 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
                    onClick={() => handleShare("twitter")}
                >
                    <Twitter className="w-4 h-4" /> Twitter
                </Button>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 bg-muted/50 rounded-md px-3 py-2 text-sm text-muted-foreground truncate font-mono border border-white/5">
                    {shareUrl}
                </div>
                <Button variant="secondary" size="icon" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}
