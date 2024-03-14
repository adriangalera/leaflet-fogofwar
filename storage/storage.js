const geoJsonPickerOpts = {
    types: [
        {
            description: 'JSON Files',
            accept: {
                'application/json': ['.json', '.geojson']
            }
        },
    ]
};
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
        },
        saveToFile: async () => {
            const fileHandle = await window.showSaveFilePicker(geoJsonPickerOpts);
            const writable = await fileHandle.createWritable();

            return cacheStorage.all()
                .then((contents) => writable.write(JSON.stringify(contents)))
                .then(() => writable.close())
        },
        reload: async () => {
            cacheStorage.clear()
            window.location.reload();
        }
    }
}

export { GeoJsonStorage }