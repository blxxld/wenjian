// Service Worker for 问茧 website

const CACHE_NAME = 'wenjian-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/resources.html',
    '/about.html',
    '/submit.html',
    '/auth.html',
    '/profile.html',
    '/ranking.html',
    '/resource-detail.html',
    '/search-history.html',
    '/css/style.css',
    '/js/main.js',
    '/js/resources.json',
    '/js/modules/utils.js',
    '/js/modules/constants.js',
    '/js/modules/resourceManager.js',
    '/js/modules/favoriteManager.js',
    '/js/modules/resourceDisplay.js',
    '/js/modules/filterSystem.js',
    '/js/modules/animationManager.js',
    '/js/modules/searchSystem.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: 缓存已打开');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 清除旧缓存', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中有响应，直接返回
                if (response) {
                    return response;
                }
                
                // 否则发起网络请求
                return fetch(event.request)
                    .then((networkResponse) => {
                        // 如果响应有效，将其添加到缓存
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // 网络请求失败时的回退策略
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// 处理后台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

// 同步收藏数据
async function syncFavorites() {
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'SYNC_FAVORITES' });
        });
    } catch (error) {
        console.error('同步收藏失败:', error);
    }
}
