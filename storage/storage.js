function GeoJsonStorage() {
    const CACHE_NAME = "geojson"

    const _cacheName = (key) => `https://${key}/geojson.json`

    return {
        put: async (key, geojson) => {
            return caches.open(CACHE_NAME)
                .then(function (cache) {
                    const cacheKey = _cacheName(key)
                    cache.put(cacheKey, new Response(JSON.stringify(geojson), { statusText: key }));
                })
                .catch(err => console.log(`Cannot open the cache, error: ${err}`))
        },
        putAll: async (contents) => {
            return caches.open(CACHE_NAME)
                .then(function (cache) {
                    for (let [key, value] of Object.entries(contents)) {
                        const cacheKey = _cacheName(key)
                        cache.put(cacheKey, new Response(JSON.stringify(value), { statusText: key }));
                    }
                })
                .catch(err => console.log(`Cannot open the cache, error: ${err}`))
        },
        remove: async (key) => {
            return caches.open(CACHE_NAME)
                .then(function (cache) {
                    const cacheKey = _cacheName(key)
                    return cache.delete(cacheKey);
                })
                .catch(err => console.log(`Cannot open the cache, error: ${err}`))
        },
        all: async () => {
            return caches.open(CACHE_NAME)
                .then((cache) => cache.matchAll())
                .then(async (cacheResponses) => {
                    let allCacheContents = {}
                    for (let cacheResponse of cacheResponses) {
                        const key = cacheResponse.statusText
                        const value = await cacheResponse.json()
                        allCacheContents[key] = value
                    }
                    return allCacheContents
                })
                .catch(err => console.log(`Cannot open the cache, error: ${err}`))
        },
        get: async (key) => {

            const cacheKey = _cacheName(key)

            return caches.open(CACHE_NAME)
                .then(cache => cache.match(cacheKey))
                .then(response => {
                    if (response)
                        return response.json()
                    return undefined
                })
                .catch(err => console.log(`Cannot get the contents from the cache, error: ${err}`))
        },
        clear: () => {
            return caches.delete(CACHE_NAME)
        }
    }
}

export { GeoJsonStorage }