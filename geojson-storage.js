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

const filePicketOpts = {
    types: [
        {
            description: 'JSON Files',
            accept: {
                'application/json': ['.json']
            }
        },
    ]
};

function Loader(storage, mask) {
    const load = async () => {
        [fileHandle] = await window.showOpenFilePicker(filePicketOpts);
        const file = await fileHandle.getFile();
        const content = await file.text();
        const contentObj = JSON.parse(content)
        storage.set(contentObj)
        mask.setData(contentObj)
    }
    var btn = L.easyButton('fa-upload', load);
    return btn;
}

function Saver(storage) {
    const save = async () => {
        const fileHandle = await window.showSaveFilePicker(filePicketOpts);
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(storage.get()));
        await writable.close();
    }
    var btn = L.easyButton('fa-save', save);
    return btn;
}
