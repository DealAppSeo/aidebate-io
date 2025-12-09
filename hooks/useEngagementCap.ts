
import { useState, useEffect } from 'react';

const CAP_LIMIT = 2;
const STORAGE_KEY = 'aidebate_visit_engagements';

export function useEngagementCap() {
    const [engagements, setEngagements] = useState(0);
    const [isCapped, setIsCapped] = useState(false);

    useEffect(() => {
        // Initialize from session storage
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const count = stored ? parseInt(stored, 10) : 0;
        setEngagements(count);
        setIsCapped(count >= CAP_LIMIT);
    }, []);

    const addEngagement = () => {
        const current = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
        const newCount = current + 1;
        sessionStorage.setItem(STORAGE_KEY, newCount.toString());
        setEngagements(newCount);
        setIsCapped(newCount >= CAP_LIMIT);
    };

    return { engagements, isCapped, addEngagement };
}
