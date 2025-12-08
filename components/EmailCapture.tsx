"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Mail } from 'lucide-react';

interface EmailCaptureProps {
    source: string;
    onSuccess?: () => void;
    minimal?: boolean;
}

export const signupCTAs = [
    {
        headline: "Join the AI Ethics Council",
        subtext: "Weekly 1-min vote on real AI governance decisions",
    },
    {
        headline: "Make AI Accountable",
        subtext: "Your votes shape how AI learns right from wrong",
    },
    {
        headline: "AI Rates You Daily",
        subtext: "Credit scores. Insurance. Hiring. Now you rate it back.",
    },
    {
        headline: "Shape AI's Conscience",
        subtext: "Join humans teaching AI ethics—one vote at a time",
    },
    {
        headline: "The AI Safety Newsletter",
        subtext: "Frontline ethics news + your weekly voice in governance",
    }
];

export const EmailCapture = ({ source, onSuccess, minimal = false }: EmailCaptureProps) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [ctaIndex, setCtaIndex] = useState(0);

    useEffect(() => {
        // Randomize CTA on mount
        setCtaIndex(Math.floor(Math.random() * signupCTAs.length));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            setSuccess(true);
            if (onSuccess) onSuccess();
            setEmail('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/30 border border-green-800 rounded-xl p-6 text-center"
            >
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Welcome to the Council</h3>
                <p className="text-green-200 text-sm">You've joined 10,000+ humans shaping AI ethics.</p>
            </motion.div>
        );
    }

    const cta = signupCTAs[ctaIndex];

    return (
        <div className={`w-full ${minimal ? '' : 'bg-gray-800/50 border border-gray-700/50 rounded-xl p-6'}`}>
            {!minimal && (
                <div className="text-center mb-6">
                    <div className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-2">🗳️ WANT TO SHAPE AI&apos;S FUTURE?</div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={ctaIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-1"
                        >
                            <h3 className="text-2xl font-bold text-white">{cta.headline}</h3>
                            <p className="text-gray-400">{cta.subtext}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join the AI Ethics Council →'}
                </button>

                {error && (
                    <p className="text-red-400 text-sm text-center">{error}</p>
                )}
            </form>

            {!minimal && (
                <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span>Weekly 1-min vote on real AI policy</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span>Frontline AI safety news</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span>Your voice in AI governance</span>
                    </div>
                </div>
            )}
        </div>
    );
};
