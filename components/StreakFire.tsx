"use client";

import { motion } from 'framer-motion';

interface StreakFireProps {
    days: number;
    size?: 'sm' | 'md' | 'lg';
}

export const StreakFire = ({ days, size = 'md' }: StreakFireProps) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-sm',
        md: 'w-10 h-10 text-lg',
        lg: 'w-16 h-16 text-2xl'
    };

    if (days === 0) {
        return <div className="text-gray-600 grayscale">🔥</div>;
    }

    return (
        <div className="relative flex items-center justify-center">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    filter: [
                        'drop-shadow(0 0 4px rgba(249, 115, 22, 0.4))',
                        'drop-shadow(0 0 10px rgba(249, 115, 22, 0.8))',
                        'drop-shadow(0 0 4px rgba(249, 115, 22, 0.4))'
                    ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`text-orange-500 ${sizeClasses[size]} flex items-center justify-center`}
            >
                🔥
            </motion.div>
            <div className="absolute top-full mt-1 text-center">
                <span className="text-orange-400 font-bold block leading-none">{days}</span>
                {size !== 'sm' && <span className="text-[10px] text-orange-500/70 uppercase">Day Streak</span>}
            </div>
        </div>
    );
};
