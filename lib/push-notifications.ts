export async function requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
}

export async function subscribeToPush(sessionId: string) {
    if (!('serviceWorker' in navigator)) return null

    const registration = await navigator.serviceWorker.ready

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!publicVapidKey) {
        console.error('VAPID public key not found')
        return null
    }

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
    })

    // Save subscription to database
    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            subscription: subscription.toJSON()
        })
    })

    return subscription
}

export async function sendPushNotification(
    sessionId: string,
    title: string,
    body: string,
    url?: string
) {
    await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, title, body, url })
    })
}
