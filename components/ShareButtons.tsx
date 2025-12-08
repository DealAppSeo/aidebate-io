"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ShareButtonsProps {
    topic: string;
    userVote: string;
    percentAgreed: number;
    predictionCorrect: boolean;
    debateId: string;
}

export const ShareButtons = ({ topic, userVote, percentAgreed, predictionCorrect, debateId }: ShareButtonsProps) => {
    const [copied, setCopied] = useState(false);

    const shareText = `I just judged AI on '${topic}' at @AIDebateIO 🤖⚖️\n\nMy verdict: ${userVote} (${percentAgreed}% agreed)\n${predictionCorrect ? '🎯 Called it!\n' : ''}\nAI rates you every day. Now you rate AI.\naidebate.io/debate/${debateId}\n\n#IRatedAI #AIEthics #AIDebate`;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'I Voted on AIDebate.io',
                    text: shareText,
                    url: `https://aidebate.io/debate/${debateId}`,
                });
            } catch (err) {
                console.error('Error sharing', err);
            }
        } else {
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToTwitter = () => {
        const text = encodeURIComponent(shareText);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(`https://aidebate.io/debate/${debateId}`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="text-center text-sm text-gray-400 mb-3">SHARE YOUR VERDICT</div>
            <div className="flex gap-2 justify-center">
                <button
                    onClick={shareToTwitter}
                    className="p-3 bg-black rounded-lg hover:bg-gray-900 transition-colors text-white"
                    aria-label="Share on X"
                >
                    🐦
                </button>
                <button
                    onClick={shareToLinkedIn}
                    className="p-3 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors text-white"
                    aria-label="Share on LinkedIn"
                >
                    💼
                </button>
                <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? '✅  Copied!' : '🔗  Share'}
                </button>
            </div>
        </div>
    );
};
