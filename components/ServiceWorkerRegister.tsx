'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.workbox !== undefined) {
            // next-pwa usage or manual? Manual as per user request
        }

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.error('SW registration failed:', err))
        }
    }, [])

    return null
}
