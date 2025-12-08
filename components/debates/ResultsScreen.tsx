import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';
import { VoteBadge } from '../VoteBadge';
import { ShareButtons } from '../ShareButtons';
import { SmartRecommendations } from '../SmartRecommendations';
import { EmailCapture } from '@/components/EmailCapture';
import { missionCTAs } from '@/lib/constants';

interface ResultsScreenProps {
    debateId: string;
    topic: string;
    results: { [key: string]: number };
    speakers: { id: string; name: string; color: string }[];
    userVote: string;
    prediction?: string;
    totalVotes: number; // For badge
    currentRepId: number; // For badge (optimistic updated)
    streak: number;
}

export const ResultsScreen = ({
    debateId,
    topic,
    results,
    speakers,
    userVote,
    prediction,
    totalVotes,
    currentRepId,
    streak
}: ResultsScreenProps) => {

    const totalVoteCount = Object.values(results).reduce((a, b) => a + b, 0);
    const userVoteLabel = speakers.find(s => s.id === userVote)?.name || 'Unknown';
    const predictionCorrect = prediction === userVote;
    const winnerId = Object.entries(results).sort((a, b) => b[1] - a[1])[0][0];
    const isWinner = userVote === winnerId; // Or prediction correct? Prompt says "YOUR PREDICTION WAS RIGHT!"

    // Calculate percentages
    const percentages = speakers.map(s => ({
        ...s,
        percent: totalVoteCount > 0 ? Math.round(((results[s.id] || 0) / totalVoteCount) * 100) : 0
    })).sort((a, b) => b.percent - a.percent);

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    // Pick one random CTA
    const cta = missionCTAs[Math.floor(Math.random() * missionCTAs.length)];

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8 pb-32">
            {predictionCorrect && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2"
            >
                <h2 className="text-3xl font-bold text-white">🎉 RESULTS ARE IN</h2>
                {predictionCorrect ? (
                    <div className="text-green-400 font-bold text-lg">✅ YOUR PREDICTION WAS RIGHT!</div>
                ) : (
                    <div className="text-gray-400">Thanks for voting</div>
                )}
            </motion.div>

            {/* Results Bars */}
            <div className="space-y-4">
                {percentages.map((speaker, index) => (
                    <div key={speaker.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-white">{speaker.name}</span>
                            <span className="text-gray-400">{speaker.percent}%</span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${speaker.percent}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: speaker.color }}
                            />
                        </div>
                        {speaker.id === userVote && <div className="text-[10px] text-gray-500 uppercase tracking-widest text-right">Your Pick</div>}
                    </div>
                ))}
            </div>

            {/* Reward Breakdown */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Vote Reward</span>
                    <span className="text-blue-400 font-mono">+15 RepID</span>
                </div>
                {predictionCorrect && (
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Prediction Bonus</span>
                        <span className="text-green-400 font-mono">+15 RepID</span>
                    </div>
                )}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Hot Take Bonus</span>
                    <span className="text-orange-400 font-mono">+10 RepID</span>
                </div>
                <div className="border-t border-gray-700 my-3" />
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">Total RepID</span>
                        {streak > 0 && <span className="text-orange-500 text-xs">🔥 {streak}-day streak!</span>}
                    </div>
                    <motion.span
                        className="text-3xl font-bold text-white"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {currentRepId}
                    </motion.span>
                </div>
            </div>

            {/* Badge & Share */}
            <VoteBadge
                repId={currentRepId}
                streak={streak}
                totalVotes={totalVotes}
                type={predictionCorrect ? 'prediction' : streak > 1 ? 'streak' : 'standard'}
                predictionCorrect={predictionCorrect}
            />
            <ShareButtons
                topic={topic}
                userVote={userVoteLabel}
                percentAgreed={percentages.find(s => s.id === userVote)?.percent || 0}
                predictionCorrect={predictionCorrect}
                debateId={debateId}
            />

            {/* Up Next */}
            <SmartRecommendations />

            {/* Mission CTA */}
            <div className='text-center space-y-4 pt-8 border-t border-gray-800'>
                <EmailCapture source="post_vote" minimal={false} />
            </div>
        </div>
    );
};
