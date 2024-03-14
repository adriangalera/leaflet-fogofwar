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

test('should save to file', async () => {
    const writableMock = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
    }
    const mockFile = (fileContents) => {
        return { text: () => fileContents }
    }
    const mockFileHandle = (fileName, fileContents, writable) => {
        return {
            name: fileName,
            getFile: () => mockFile(fileContents),
            createWritable: () => writable
        }
    }
    global.window = {
        showSaveFilePicker: jest.fn().mockImplementation(() => {
            return mockFileHandle(undefined, undefined, writableMock)
        })
    }
    const geoJson = { "key": { "a": "b" } }
    const cacheStorage = {
        all: jest.fn().mockResolvedValue(geoJson)
    }
    const storage = new GeoJsonStorage(cacheStorage, {})
    storage.saveToFile().then(() => {
        expect(writableMock.write).toHaveBeenCalledWith(JSON.stringify(geoJson))
        expect(writableMock.close).toHaveBeenCalled()
    })
})

test('should reload', async () => {
    const cacheStorage = {
        clear: jest.fn()
    }
    global.window = {
        location: {
            reload: jest.fn()
        }
    }
    const storage = new GeoJsonStorage(cacheStorage, {})
    storage.reload()
    expect(cacheStorage.clear).toHaveBeenCalled()
    expect(window.location.reload).toHaveBeenCalled()
})