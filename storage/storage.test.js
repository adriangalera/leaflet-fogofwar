import { CacheGeoJsonStorage } from "./cache-storage"
import { HttpGeoJsonStorage } from "./http-storage"
import { GeoJsonStorage } from "./storage"


test('should load geojson from cache', async () => {
    const cacheResponse = { "k": "cache" }
    const cache = new CacheGeoJsonStorage()
    jest.spyOn(cache, 'all').mockResolvedValue(cacheResponse);

    const http = new HttpGeoJsonStorage()
    const storage = new GeoJsonStorage(cache, http)

    await expect(storage.get()).resolves.toBe(cacheResponse)
})

test('should load geojson from s3 when cache is missing', async () => {
    const s3Response = { "k": "s3" }
    const cache = new CacheGeoJsonStorage()
    const http = new HttpGeoJsonStorage()
    jest.spyOn(cache, 'all').mockResolvedValue({});
    jest.spyOn(cache, 'putAll').mockResolvedValue({});
    jest.spyOn(http, 'get').mockResolvedValue(s3Response);

    const storage = new GeoJsonStorage(cache, http)

    await expect(storage.get()).resolves.toBe(s3Response)
    await expect(cache.putAll).toHaveBeenCalled()
})