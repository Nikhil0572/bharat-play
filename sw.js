// This service worker exists only to remove any old, stuck version of
// itself and its caches from users' browsers, then get out of the way.
// (An earlier version of this app cached files aggressively, which could
// trap visitors on an old build. This version undoes that.)

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete every cache this app may have created.
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      // Unregister this service worker entirely.
      await self.registration.unregister();

      // Force every open tab of this app to reload so they fetch
      // fresh files directly from the network from now on.
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
