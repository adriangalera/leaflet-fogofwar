function GeoJsonStorage() {
    const key = "geojson"
    return {
        set: function (geojson) {
            window.localStorage.setItem(key, JSON.stringify(geojson))
        },

        get: function () {
            const contents = window.localStorage.getItem(key);
            if (contents) {
                return JSON.parse(contents)
            }
            return undefined
        }
    }
}


