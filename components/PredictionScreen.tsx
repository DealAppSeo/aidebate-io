import { motion } from 'framer-motion';

interface PredictionScreenProps {
    speakers: { id: string; name: string; color: string }[];
    onPredict: (speakerId: string) => void;
    onSkip: () => void;
}

export const PredictionScreen = ({ speakers, onPredict, onSkip }: PredictionScreenProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white mb-2">WHO WILL WIN?</h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                    🎯 Predict correctly for <motion.span
                        className="text-yellow-400 font-semibold inline-block ml-1"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        2× RepID
                    </motion.span>
                </p>
                <p className="text-gray-500 text-[10px] mt-1">
                    Test your intuition on AI ethics
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full">
                {speakers.map((speaker) => (
                    <motion.button
                        key={speaker.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onPredict(speaker.id)}
                        className="flex-1 min-w-[100px] max-w-[140px] aspect-square rounded-xl bg-gray-800 border-2 border-transparent hover:border-blue-500 flex flex-col items-center justify-center gap-2 p-2 transition-colors"
                        style={{
                            borderColor: `transparent`,
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                            style={{ backgroundColor: speaker.color }}
                        >
                            {speaker.name[0]}
                        </div>
                        <span className="font-bold text-white">{speaker.name}</span>
                    </motion.button>
                ))}
            </div>

            <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
                Skip - watch first
            </button>
        </div>
    );
};
