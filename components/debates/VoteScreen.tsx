import { motion } from 'framer-motion';

interface VoteScreenProps {
    speakers: { id: string; name: string; color: string }[];
    prediction?: string;
    onVote: (speakerId: string) => void;
    onSkip: () => void;
    isSubmitting: boolean;
}

export const VoteScreen = ({ speakers, prediction, onVote, onSkip, isSubmitting }: VoteScreenProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center w-full max-w-2xl mx-auto p-6 space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">WHO WON THIS DEBATE?</h2>
                {prediction && (
                    <p className="text-gray-400 text-sm">Your prediction: <span className="text-white font-medium">{prediction}</span></p>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-6 w-full">
                {speakers.map((speaker) => (
                    <button
                        key={speaker.id}
                        onClick={() => {
                            if (window.navigator?.vibrate) window.navigator.vibrate(50); // Haptic feedback
                            onVote(speaker.id);
                        }}
                        disabled={isSubmitting}
                        className="group flex flex-col items-center space-y-4 p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all flex-1"
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: speaker.color }}
                        >
                            {speaker.name[0]}
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-white mb-1">{speaker.name}</div>
                            {speaker.id === prediction && <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full inline-block">Predicted</div>}
                        </div>
                    </button>
                ))}
            </div>

            <div className="text-center space-y-4">
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 inline-block">
                    <div className="text-blue-400 font-bold mb-1">🎁 Vote now: +15 RepID</div>
                    <div className="text-xs text-blue-300/70">🎯 Prediction bonus: +15 more if right</div>
                </div>

                <div>
                    <button
                        onClick={onSkip}
                        className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        Skip to next
                    </button>
                    <p className="text-xs text-gray-600 mt-1">Skipping? Your vote keeps AI accountable</p>
                </div>
            </div>
        </motion.div>
    );
};
