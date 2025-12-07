'use client'
import { useState } from 'react'
import {
    X, Link2, MessageCircle, Twitter, Linkedin,
    Share2, Check, Users
} from 'lucide-react'

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    debate: {
        id: string
        topic: string
        ai_a_name: string
        ai_b_name: string
    }
    userVote?: 'ai_a' | 'ai_b' | 'tie'
    voteResults?: { ai_a: number, ai_b: number }
}

export function ShareModal({ isOpen, onClose, debate, userVote, voteResults }: ShareModalProps) {
    const [copied, setCopied] = useState(false)
    const [challengeSent, setChallengeSent] = useState(false)

    if (!isOpen) return null

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aidebate.io'
    const debateUrl = `${baseUrl}/debate/${debate.id}`

    // Generate share text based on vote - mapping ai_a -> A
    const getShareText = () => {
        if (userVote === 'ai_a') {
            return `I just voted for ${debate.ai_a_name} in "${debate.topic}" on AI Debate. Think you'd agree? 🤖`
        } else if (userVote === 'ai_b') {
            return `${debate.ai_b_name} won my vote in "${debate.topic}". What's your take? 🎯`
        } else if (userVote === 'tie') {
            return `Couldn't pick a winner between ${debate.ai_a_name} and ${debate.ai_b_name} on "${debate.topic}". You decide! ⚖️`
        }
        return `Check out this AI debate: "${debate.topic}" - ${debate.ai_a_name} vs ${debate.ai_b_name} 🔥`
    }

    const shareText = getShareText()

    // Challenge link with referral tracking
    const getChallengeLink = () => {
        const sessionId = localStorage.getItem('aidebate_session_id')
        return `${debateUrl}?ref=${sessionId}&challenge=true`
    }

    // Native Web Share API (best for mobile)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `AI Debate: ${debate.topic}`,
                    text: shareText,
                    url: debateUrl
                })
                trackShare('native')
            } catch (e) {
                // User cancelled or not supported
            }
        }
    }

    // WhatsApp - highest engagement
    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${debateUrl}`)}`
        window.open(url, '_blank')
        trackShare('whatsapp')
    }

    // iMessage / SMS
    const handleSMS = () => {
        const url = `sms:?body=${encodeURIComponent(`${shareText}\n\n${debateUrl}`)}`
        window.location.href = url
        trackShare('sms')
    }

    // Twitter/X
    const handleTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(debateUrl)}`
        window.open(url, '_blank')
        trackShare('twitter')
    }

    // LinkedIn
    const handleLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(debateUrl)}`
        window.open(url, '_blank')
        trackShare('linkedin')
    }

    // Copy link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(debateUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        trackShare('copy')
    }

    // Challenge a specific friend
    const handleChallenge = async () => {
        const challengeUrl = getChallengeLink()
        const challengeText = `I challenge you! I voted for ${userVote === 'ai_a' ? debate.ai_a_name : debate.ai_b_name}. Think you'd pick differently?`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '🎯 AI Debate Challenge!',
                    text: challengeText,
                    url: challengeUrl
                })
                setChallengeSent(true)
                trackShare('challenge')
            } catch (e) { }
        } else {
            // Fallback to copy
            navigator.clipboard.writeText(challengeUrl)
            setChallengeSent(true)
            // Ideally show toast here
        }
    }

    // Track share events
    const trackShare = async (method: string) => {
        await fetch('/api/track-share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                debate_id: debate.id,
                method,
                session_id: localStorage.getItem('aidebate_session_id')
            })
        })
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#171717] border border-[#27272a] rounded-2xl w-full max-w-md shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#27272a]">
                    <h2 className="text-xl font-bold text-white">Share This Debate</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Vote Results Preview */}
                {voteResults && (voteResults.ai_a + voteResults.ai_b) > 0 && (
                    <div className="p-4 bg-[#0a0a0a] mx-4 mt-4 rounded-lg border border-white/5">
                        <p className="text-sm text-gray-400 mb-2">Current Results:</p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-purple-900/50 rounded p-2 text-center">
                                <div className="text-lg font-bold text-purple-400">
                                    {((voteResults.ai_a / (voteResults.ai_a + voteResults.ai_b)) * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-400">{debate.ai_a_name}</div>
                            </div>
                            <div className="flex-1 bg-amber-900/50 rounded p-2 text-center">
                                <div className="text-lg font-bold text-amber-400">
                                    {((voteResults.ai_b / (voteResults.ai_a + voteResults.ai_b)) * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-400">{debate.ai_b_name}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Challenge Button - Primary CTA */}
                <div className="p-4">
                    <button
                        onClick={handleChallenge}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg shadow-purple-900/20"
                    >
                        <Users className="w-6 h-6" />
                        {challengeSent ? '✓ Challenge Sent!' : 'Challenge a Friend'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        See if they agree with your vote
                    </p>
                </div>

                {/* Share Options Grid */}
                <div className="px-4 pb-4">
                    <p className="text-sm text-gray-400 mb-3">Or share via:</p>
                    <div className="grid grid-cols-5 gap-2">
                        {/* Native Share (mobile) */}
                        {typeof navigator !== 'undefined' && navigator.share && (
                            <ShareButton
                                icon={<Share2 className="w-5 h-5" />}
                                label="Share"
                                onClick={handleNativeShare}
                                color="bg-blue-600"
                            />
                        )}

                        {/* WhatsApp */}
                        <ShareButton
                            icon={<MessageCircle className="w-5 h-5" />}
                            label="WhatsApp"
                            onClick={handleWhatsApp}
                            color="bg-green-600"
                        />

                        {/* SMS/iMessage (using MessageCircle generally) */}
                        <ShareButton
                            icon={<MessageCircle className="w-5 h-5" />}
                            label="Text"
                            onClick={handleSMS}
                            color="bg-blue-500"
                        />

                        {/* Twitter */}
                        <ShareButton
                            icon={<Twitter className="w-5 h-5" />}
                            label="X"
                            onClick={handleTwitter}
                            color="bg-black border border-gray-700"
                        />

                        {/* LinkedIn */}
                        <ShareButton
                            icon={<Linkedin className="w-5 h-5" />}
                            label="LinkedIn"
                            onClick={handleLinkedIn}
                            color="bg-[#0077B5]"
                        />
                    </div>
                </div>

                {/* Copy Link */}
                <div className="px-4 pb-4">
                    <button
                        onClick={handleCopyLink}
                        className="w-full bg-[#27272a] hover:bg-[#3a3a3a] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        {copied ? (
                            <>
                                <Check className="w-5 h-5 text-green-400" />
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Link2 className="w-5 h-5" />
                                <span>Copy Link</span>
                            </>
                        )}
                    </button>
                </div>

                {/* RepID Incentive */}
                <div className="px-4 pb-4">
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-center">
                        <p className="text-sm text-yellow-300">
                            🎁 Earn <strong>+25 RepID</strong> when a friend votes!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ShareButton({ icon, label, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`${color} p-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:opacity-90 transition`}
        >
            {icon}
            <span className="text-[10px] text-white">{label}</span>
        </button>
    )
}
