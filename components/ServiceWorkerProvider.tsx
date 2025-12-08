'use client';

import { useEffect } from 'react';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.error('SW registration failed:', error);
                });
        }
    }, []);

    return <>{children}</>;
}
