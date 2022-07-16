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
        },
    ]
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
        [fileHandle] = await window.showOpenFilePicker(gpxPickerOpts);
        const file = await fileHandle.getFile();
        const content = await file.text();
        var gpxDom = (new DOMParser()).parseFromString(content, 'text/xml');
        drawer.draw(gpxDom)
    }
    var btn = L.easyButton('fa-plus', addGpx);
    return btn;
}

function GeoJsonSaver(storage) {
    const save = async () => {
        const fileHandle = await window.showSaveFilePicker(geoJsonPickerOpts);
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(storage.get()));
        await writable.close();
    }
    var btn = L.easyButton('fa-save', save);
    return btn;
}
