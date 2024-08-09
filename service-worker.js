self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
    // Cache estático, se necessário
    event.waitUntil(
        caches.open('your-cache-name').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/style.css',
                '/script.js',
                '/alarme1.mp3',
                // Outros arquivos...
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker ativado.');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'your-cache-name') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('notificationclick', event => {
    console.log('Notificação clicada:', event.notification);
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Substitua pela URL que você deseja abrir
    );
});

self.addEventListener('push', event => {
    console.log('Push recebido:', event);
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: 'relogio.png',
        badge: 'despertador.png',
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});