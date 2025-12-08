import { useMemo } from 'react';

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
                // Use CSS classes + inline styles for performance instead of JS animation
                return (
                    <div
                        key={speaker.id}
                        className={`flex flex-col items-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                    >
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold relative overflow-visible transition-transform duration-500 ${isActive && isPlaying ? 'scale-105' : 'scale-100'}`}
                            style={{
                                backgroundColor: speaker.color,
                                boxShadow: isActive && isPlaying ? `0 0 20px ${speaker.color}60` : 'none',
                                transition: 'box-shadow 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            {speaker.name[0]}
                            {isActive && isPlaying && (
                                <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5 h-4 translate-y-full">
                                    <span className="w-1 bg-white/80 rounded-full animate-[equalizer_1s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '0s' }} />
                                    <span className="w-1 bg-white/80 rounded-full animate-[equalizer_1s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '0.1s' }} />
                                    <span className="w-1 bg-white/80 rounded-full animate-[equalizer_1s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '0.2s' }} />
                                    <span className="w-1 bg-white/80 rounded-full animate-[equalizer_1s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '0.3s' }} />
                                    <span className="w-1 bg-white/80 rounded-full animate-[equalizer_1s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '0.4s' }} />
                                </div>
                            )}
                        </div>

                        <span className={`mt-6 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                            {speaker.name}
                        </span>

                        <style jsx>{`
                            @keyframes equalizer {
                                0%, 100% { transform: scaleY(0.3); }
                                50% { transform: scaleY(1); }
                            }
                        `}</style>
                    </div>
                );
            })}
        </div>
    );
};
