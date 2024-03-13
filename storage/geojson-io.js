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

function GeoJsonLoader(progressbar, storage, geojsoncontainer) {
    const load = async () => {
        const fileHandles = await window.showOpenFilePicker(geoJsonPickerOpts);
        progressbar.load()
        const file = await fileHandles[0].getFile();
        const content = await file.text();
        const contentObj = JSON.parse(content)
        storage.clear().then(() => {
            storage.putAll(contentObj)
            geojsoncontainer.set(contentObj)
            progressbar.stop()
        })
    }
    var btn = L.easyButton('fa-upload', load);
    return btn;
}

function GeoJsonSaver(progressbar, storage) {
    const save = async () => {
        const fileHandle = await window.showSaveFilePicker(geoJsonPickerOpts);
        const writable = await fileHandle.createWritable();
        progressbar.load()

        return storage.all()
            .then((contents) => writable.write(JSON.stringify(contents)))
            .then(() => writable.close())
            .then(() => progressbar.stop())
    }
    var btn = L.easyButton('fa-save', save);
    return btn;
}

export { GeoJsonLoader, GeoJsonSaver }