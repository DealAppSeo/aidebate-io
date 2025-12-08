import { motion } from 'framer-motion';

interface SpeakerIndicatorProps {
    speakers: { id: string; name: string; avatar?: string; color: string }[];
    activeSpeaker: string;
    isPlaying: boolean;
}

export const SpeakerIndicator = ({ speakers, activeSpeaker, isPlaying }: SpeakerIndicatorProps) => {
    return (
        <div className="flex justify-center gap-8 py-4">
            {speakers.map((speaker) => {
                const isActive = speaker.id === activeSpeaker;
                return (
                    <motion.div
                        key={speaker.id}
                        animate={isActive && isPlaying ? {
                            scale: [1, 1.05, 1],
                        } : { scale: 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`flex flex-col items-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'
                            }`}
                    >
                        <motion.div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold relative overflow-visible`}
                            style={{
                                backgroundColor: speaker.color,
                            }}
                            animate={isActive && isPlaying ? {
                                boxShadow: [
                                    `0 0 0 0 ${speaker.color}40`,
                                    `0 0 20px 10px ${speaker.color}60`,
                                    `0 0 0 0 ${speaker.color}40`
                                ]
                            } : { boxShadow: 'none' }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            {speaker.name[0]}
                            {isActive && isPlaying && (
                                <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5 h-4 translate-y-full">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ scaleY: [0.3, 1, 0.3] }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.5,
                                                delay: i * 0.1
                                            }}
                                            className="w-1 bg-white/80 rounded-full origin-bottom"
                                            style={{ height: '100%' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        <span className={`mt-6 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {speaker.name}
                        </span>
                    </motion.div>
                );
            })}
        </div>
    );
};
