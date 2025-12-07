self.addEventListener('push', function (event) {
    let data = { title: 'New Notification', body: '', url: '/' };

    if (event.data) {
        try {
            const json = event.data.json()
            data = { ...data, ...json }
        } catch (e) {
            data.body = event.data.text()
        }
    }

    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: { url: data.url },
        actions: [
            { action: 'open', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        )
    }
})
