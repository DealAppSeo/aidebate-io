import Link from 'next/link';

interface Recommendation {
    id: string;
    title: string;
    label: string;
    votes?: number;
    isNew?: boolean;
}

const DEMO_RECOMMENDATIONS: Recommendation[] = [
    { id: '7', title: "Will AI Deepfakes Destroy Democracy?", label: "Trending now", votes: 234 },
    { id: '8', title: "Should AI Have Rights Like Humans?", label: "Your pick debates again" },
    { id: '11', title: "Is AI the Key to Solving Climate Change?", label: "Just added • Be first to vote!", isNew: true },
];

export const SmartRecommendations = () => {
    return (
        <div className="w-full max-w-md mx-auto space-y-4 p-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Up Next For You</h3>

            {DEMO_RECOMMENDATIONS.map((rec, i) => (
                <div key={rec.id} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center group hover:bg-gray-800 transition-colors border border-gray-700/50">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            {rec.isNew && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>}
                            <span className="text-orange-400 text-xs font-medium">{rec.label}</span>
                        </div>
                        <h4 className="text-white font-medium truncate">{rec.title}</h4>
                        {rec.votes && <span className="text-xs text-gray-500">{rec.votes} votes</span>}
                    </div>
                    <Link href={`/debate/${rec.id}`} className="px-3 py-1.5 bg-gray-700 hover:bg-blue-600 text-sm text-white rounded transition-colors whitespace-nowrap">
                        {rec.isNew ? 'Be First +5' : 'Watch Now'}
                    </Link>
                </div>
            ))}
        </div>
    );
};
