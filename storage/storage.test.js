import { GeoJsonStorage } from './storage'

const particularCacheMock = {
    put: jest.fn(),
    match: jest.fn(),
    matchAll: jest.fn(),
    delete: jest.fn()
}

const mockEmptyCache = () => {
    particularCacheMock.match.mockResolvedValue(false)
}

const mockCacheWithContents = (contents) => {
    particularCacheMock.match.mockResolvedValue({ json: jest.fn().mockResolvedValue(contents) })
}

const mockCacheMatchingAll = (contents) => {
    particularCacheMock.matchAll.mockResolvedValue([{
        json: jest.fn().mockResolvedValue(JSON.parse(contents.payload)),
        statusText: contents.statusText
    }])
}

const mockGlobalCaches = () => {
    global.caches = {
        open: jest.fn().mockResolvedValue(particularCacheMock),
        delete: jest.fn()
    }
}

const mockedError = "Mocked cache error"

const mockNotOpeningCache = () => {
    global.caches = {
        open: jest.fn().mockRejectedValue(mockedError)
    }
}

function StubResponse(payload, options) {
    this.payload = payload
    this.options = options
    this.statusText = options ? options.statusText : ""
}

const mockResponse = () => {
    global.Response = StubResponse
}

test('should put item in cache', async () => {
    mockGlobalCaches()
    mockResponse()
    const storage = GeoJsonStorage()
    const geojson = { 'a': 'b' }
    const key = "abcd"
    storage.put(key, geojson)
    const expectedResponse = new Response(JSON.stringify(geojson), { statusText: key })
    expect(global.caches.open).toHaveBeenCalledWith("geojson")
    return global.caches.open().then(() => {
        expect(particularCacheMock.put).toHaveBeenCalledWith("https://abcd/geojson.json", expectedResponse)
    })
})

test('should put all', async () => {
    mockGlobalCaches()
    mockResponse()
    const storage = GeoJsonStorage()
    const geojson = { 'a': 'b' }
    const key = "abcd"
    const contents = {
        "abcd": geojson
    }
    const expectedResponse = new Response(JSON.stringify(geojson), { statusText: key })
    return storage.putAll(contents).then(() => {
        expect(particularCacheMock.put).toHaveBeenCalledWith("https://abcd/geojson.json", expectedResponse)
    })
})

test('should retrieve all contents', async () => {
    const geojson = { 'a': 'b' }
    const key = "abcd"
    mockGlobalCaches()
    mockResponse()
    const contents = new Response(JSON.stringify(geojson), { statusText: key })
    mockCacheMatchingAll(contents)
    const expectedContents = { "abcd": { 'a': 'b' } }
    const storage = GeoJsonStorage()
    return storage.all().then((cacheContents) => {
        expect(cacheContents).toEqual(expectedContents)
    })
})

test('should delete all geojson stored', () => {
    mockGlobalCaches()
    const storage = GeoJsonStorage()
    storage.clear()
    expect(global.caches.delete).toHaveBeenCalledWith("geojson")
})

test('should retrieve not existing geojson as undefined', async () => {
    mockGlobalCaches()
    mockResponse()
    mockEmptyCache()
    const storage = GeoJsonStorage()
    return storage.get().then((contents) => expect(contents).toBe(undefined))
})

test('should retrieve existing geojson as object', async () => {
    const contents = { 'a': 'b' }
    mockGlobalCaches()
    mockResponse()
    mockCacheWithContents(contents)
    const storage = new GeoJsonStorage()
    return storage.get().then((contents) => expect(contents).toBe(contents))
})

test('cache does not open in put', async () => {
    mockNotOpeningCache()
    const storage = new GeoJsonStorage()
    return storage.put('', '').catch((err) => expect(err).toBe(mockedError))
})

test('cache does not open in putAll', async () => {
    mockNotOpeningCache()
    const storage = new GeoJsonStorage()
    storage.putAll({})
    return global.caches.open().catch((err) => expect(err).toBe(mockedError))
})

test('cache does not open in all', async () => {
    mockNotOpeningCache()
    const storage = new GeoJsonStorage()
    const geojson = { 'a': 'b' }
    storage.all(geojson)
    return global.caches.open().catch((err) => expect(err).toBe(mockedError))
})

test('cache does not open in get', async () => {
    mockNotOpeningCache()
    const storage = new GeoJsonStorage()
    return storage.get().catch((err) => expect(err).toBe(mockedError))
})

test('cache does not open in remove', async () => {
    mockNotOpeningCache()
    const storage = new GeoJsonStorage()
    return storage.remove().catch((err) => expect(err).toBe(mockedError))
})

test('should remove entry', async () => {
    mockGlobalCaches()
    mockResponse()
    const storage = GeoJsonStorage()
    const geojson = { 'a': 'b' }
    const key = "abcd"
    storage.put(key, geojson).then(() => {
        storage.remove(key).then(() => {
            expect(particularCacheMock.delete).toHaveBeenCalledWith("https://abcd/geojson.json")
        })
    })
})

afterAll(() => {
    global.caches.open.mockReset()
})