
function GeoJsonStorage(cacheStorage, httpStorage) {
    return {
        get: async () => {
            // First it tries to retrieve the geoJSON from browser cache, if it cannot find it, go to search it in S3
            return cacheStorage.all()
                .then(response => {
                    if (Object.keys(response).length === 0) {
                        return httpStorage.get().then(response => {
                            cacheStorage.putAll(response)
                            return response
                        })
                    }
                    return response
                })
        }
    }
}

export { GeoJsonStorage }