
function HttpGeoJsonStorage(config) {
    return {
        get: async () => {
            return fetch(config.geoJsonOriginFile)
                .then((response) => response.json())
                .catch(err => console.log(`Cannot retrieve the file from S3, error: ${err}`))
        }
    }
}

export { HttpGeoJsonStorage }