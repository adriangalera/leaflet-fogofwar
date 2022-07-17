function GeoJsonStorage() {
    const CACHE_NAME = "geojson"
    const CACHE_KEY = "https://xxxx/geojson.json"
    return {
        set: function (geojson) {
            caches.open(CACHE_NAME)
                .then(function (cache) {
                    cache.put(CACHE_KEY, new Response(JSON.stringify(geojson)));
                })
                .catch(err => console.log(`Cannot open the cache, error: ${err}`))
        },

        get: async function () {
            return caches.open(CACHE_NAME)
                .then(cache => cache.match(CACHE_KEY))
                .then(response => {
                    if (response)
                        return response.json()
                    return undefined
                })
                .catch(err => console.log(`Cannot get the contents from the cache, error: ${err}`))
        },
        clear: function () {
            caches.delete(CACHE_NAME)
        }
    }
}

const geoJsonPickerOpts = {
    types: [
        {
            description: 'JSON Files',
            accept: {
                'application/json': ['.json']
            }
        },
    ]
};

const gpxPickerOpts = {
    types: [
        {
            description: 'GPX Files',
            accept: {
                'application/gpx+xml': ['.gpx']
            }
        }
    ],
    multiple: true
};

function GeoJsonLoader(storage, mask) {
    const load = async () => {
        [fileHandle] = await window.showOpenFilePicker(geoJsonPickerOpts);
        const file = await fileHandle.getFile();
        const content = await file.text();
        const contentObj = JSON.parse(content)
        storage.set(contentObj)
        mask.setData(contentObj)
    }
    var btn = L.easyButton('fa-upload', load);
    return btn;
}

function GpxAdder(drawer) {

    const addGpx = async () => {
        const fileHandlers = await window.showOpenFilePicker(gpxPickerOpts);
        //starts loading
        for (let fh of fileHandlers) {
            const file = await fh.getFile();
            const content = await file.text();
            var gpxDom = (new DOMParser()).parseFromString(content, 'text/xml');
            drawer.draw(gpxDom)
        }
        // ends loading

    }
    var btn = L.easyButton('fa-plus', addGpx);
    return btn;
}

function GeoJsonSaver(storage) {
    const save = async () => {
        const fileHandle = await window.showSaveFilePicker(geoJsonPickerOpts);
        const writable = await fileHandle.createWritable();

        storage.get()
            .then((geoJson) => writable.write(JSON.stringify(geoJson)))
            .then(() => writable.close())
    }
    var btn = L.easyButton('fa-save', save);
    return btn;
}