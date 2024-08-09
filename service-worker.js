self.addEventListener('install', event => {
    console.log('Service Worker instalado.');
    // Usar event.waitUntil para garantir que a instalação seja concluída
    event.waitUntil(
        caches.open('your-cache-name').then(cache => {
            return cache.addAll([
                // Adicione os arquivos que você deseja armazenar em cache
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
    // Limpar caches antigos, se necessário
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
        clients.openWindow('/') // Abrir a página principal ou outra URL quando a notificação for clicada
    );
});