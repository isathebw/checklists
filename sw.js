// Mude esse número toda vez que atualizar index.html, abb.html ou areva.html
// Isso força o celular a baixar a versão nova na próxima vez que abrir com internet.
const CACHE_VERSION = 'checklists-v1';

const ARQUIVOS = [
  './index.html',
  './abb.html',
  './areva.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala e guarda os arquivos em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

// Remove caches antigos (de versões anteriores)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: cache primeiro, rede depois (e atualiza o cache em segundo plano)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      const buscaRede = fetch(event.request)
        .then((respostaRede) => {
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, respostaRede.clone());
          });
          return respostaRede;
        })
        .catch(() => respostaCache); // sem internet: usa o que tiver salvo

      // Se já tem no cache, mostra na hora (rápido) e atualiza por trás.
      // Se não tem, espera a rede.
      return respostaCache || buscaRede;
    })
  );
});
