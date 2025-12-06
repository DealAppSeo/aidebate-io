'use client'

import { Twitter, Linkedin, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonsProps {
    debateTitle: string
    winner: string
    repidEarned: number
}

export default function ShareButtons({ debateTitle, winner, repidEarned }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false)

    const shareText = `I just voted on "${debateTitle}" and ${winner} won! Earned +${repidEarned} RepID on AIDebate.io 🤖⚖️`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
    }

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AIDebate.io',
                    text: shareText,
                    url: shareUrl
                })
            } catch (error) {
                console.error('Share failed:', error)
            }
        }
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">Share your verdict</p>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleTwitterShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white py-3 rounded-lg transition-colors"
                >
                    <Twitter className="w-5 h-5" />
                    <span className="font-medium">X</span>
                </button>

                <button
                    onClick={handleLinkedInShare}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-3 rounded-lg transition-colors"
                >
                    <Linkedin className="w-5 h-5" />
                    <span className="font-medium">LinkedIn</span>
                </button>

                <button
                    onClick={copied ? undefined : handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>

            {/* Native share for mobile */}
            {typeof navigator !== 'undefined' && navigator.share && (
                <button
                    onClick={handleNativeShare}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                >
                    Share...
                </button>
            )}
        </div>
    )
}
