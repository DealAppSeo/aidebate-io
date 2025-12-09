import { useState, useEffect } from 'react';

export const getNetworkQuality = (): 'fast' | 'medium' | 'slow' => {
    if (typeof navigator === 'undefined') return 'fast';

    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    if (!connection) return 'fast';

    // Check effective type
    if (connection.effectiveType === '4g' && connection.downlink > 5) return 'fast';
    if (connection.effectiveType === '4g' || connection.effectiveType === '3g') return 'medium';
    return 'slow';
};

export const useNetworkQuality = () => {
    const [quality, setQuality] = useState<'fast' | 'medium' | 'slow'>('fast');

    useEffect(() => {
        setQuality(getNetworkQuality());

        const connection = (navigator as any).connection;
        if (connection) {
            const handleChange = () => setQuality(getNetworkQuality());
            connection.addEventListener('change', handleChange);
            return () => connection.removeEventListener('change', handleChange);
        }
    }, []);

    return quality;
};
