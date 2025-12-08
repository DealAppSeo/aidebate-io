import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

export type BadgeType = 'standard' | 'streak' | 'prediction' | 'rank' | 'daily';

interface VoteBadgeProps {
    repId: number;
    streak: number;
    totalVotes: number;
    type?: BadgeType;
    predictionCorrect?: boolean;
}

const getBadgeLevel = (votes: number) => {
    if (votes >= 500) return { level: 'Platinum', icon: '👑', color: '#E5E4E2' };
    if (votes >= 100) return { level: 'Gold', icon: '🏆', color: '#FFD700' };
    if (votes >= 50) return { level: 'Silver', icon: '🥈', color: '#C0C0C0' };
    if (votes >= 10) return { level: 'Bronze', icon: '🥉', color: '#CD7F32' };
    return { level: 'Voter', icon: '🗳️', color: '#60A5FA' };
};

export const VoteBadge = ({ repId, streak, totalVotes, type = 'standard', predictionCorrect }: VoteBadgeProps) => {
    const badgeRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const badge = getBadgeLevel(totalVotes);

    const downloadBadge = async () => {
        if (!badgeRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(badgeRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                allowTaint: true,
            });
            const link = document.createElement('a');
            link.download = `aidebate-${type}-badge.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (e) {
            console.error(e);
        } finally {
            setDownloading(false);
        }
    };

    const renderContent = () => {
        switch (type) {
            case 'streak':
                return (
                    <>
                        <div className="text-5xl text-center mb-2">🔥</div>
                        <div className="text-2xl font-bold text-white text-center tracking-wider">ETHICS STREAK</div>
                        <div className="text-orange-400 text-4xl font-black text-center my-2">{streak} DAYS</div>
                        <div className="text-sm text-gray-400 text-center">Consistency Matters</div>
                    </>
                );
            case 'prediction':
                return (
                    <>
                        <div className="text-5xl text-center mb-2">🎯</div>
                        <div className="text-2xl font-bold text-white text-center tracking-wider">CALLED IT!</div>
                        <div className="text-green-400 text-lg font-bold text-center my-2">I Predicted The Winner</div>
                        <div className="text-sm text-gray-400 text-center">Human Intuition &gt; AI</div>
                    </>
                );
            case 'daily':
                return (
                    <>
                        <div className="text-5xl text-center mb-2">✅</div>
                        <div className="text-2xl font-bold text-white text-center tracking-wider">DAILY VOTE</div>
                        <div className="text-blue-400 text-lg font-bold text-center my-2">I Shaped AI Today</div>
                        <div className="text-sm text-gray-400 text-center">See you tomorrow</div>
                    </>
                );
            default: // standard
                return (
                    <>
                        <div className="text-4xl text-center mb-2">{badge.icon}</div>
                        <div className="text-xl font-bold text-white text-center tracking-wider">I VOTED</div>
                        <div className="text-sm text-gray-400 text-center mb-3">to keep AI ethical</div>
                        <div className="border-t border-gray-700 my-3" />
                        <div className="text-center">
                            <div className="text-blue-400 font-mono text-lg font-bold">{repId} RepID</div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Badge Visual */}
            <div
                ref={badgeRef}
                className="bg-gradient-to-br from-gray-800 to-gray-950 p-6 rounded-xl border-2 shadow-2xl min-w-[280px] aspect-[4/5] flex flex-col justify-center relative overlow-hidden"
                style={{ borderColor: type === 'streak' ? '#f97316' : badge.color }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

                {renderContent()}

                <div className="text-center mt-auto pt-4">
                    <div className="text-xs text-gray-500 font-mono">AIDebate.io</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-50 text-white mt-1"> AI Governance Council</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 w-full max-w-[280px]">
                <button
                    onClick={downloadBadge}
                    disabled={downloading}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white rounded-lg text-sm transition-colors font-bold flex items-center justify-center gap-2"
                >
                    {downloading ? 'Saving...' : '⬇️ Save Badge'}
                </button>
            </div>
        </div>
    );
};
