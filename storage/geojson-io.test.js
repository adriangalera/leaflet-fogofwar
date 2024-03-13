import { GeoJsonLoader, GeoJsonSaver } from './geojson-io'
import { mockEasyButton, mockOpenFilePicker, mockSaveFilePicker } from './geojson-io.test.mocks'

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

const progressBar = {
    load: jest.fn(),
    stop: jest.fn()
};

test("should load geojson file", async () => {
    const objValue = { "a": "b" }
    mockEasyButton()
    mockOpenFilePicker({ 'geo.json': JSON.stringify(objValue) })
    const storage = {
        putAll: jest.fn().mockResolvedValue(objValue),
        clear: jest.fn().mockResolvedValue()
    }
    const geojsoncontainer = {
        set: jest.fn()
    }
    const loaderBtn = new GeoJsonLoader(progressBar, storage, geojsoncontainer)
    expect(loaderBtn.name).toBe("fa-upload")

    return loaderBtn.click().then(() => {
        expect(global.window.showOpenFilePicker).toHaveBeenCalledWith(geoJsonPickerOpts)
        expect(storage.clear).toHaveBeenCalled()
        expect(storage.putAll).toHaveBeenCalledWith(objValue)
        expect(geojsoncontainer.set).toHaveBeenCalledWith(objValue)
    })
})

test("should save geojson file", () => {
    const geoJson = { "key": { "a": "b" } }
    mockEasyButton()
    const writable = mockSaveFilePicker()
    const storage = {
        all: jest.fn().mockResolvedValue(geoJson)
    }
    const saverBtn = new GeoJsonSaver(progressBar, storage)
    expect(saverBtn.name).toBe("fa-save")
    return saverBtn.click().then(() => {
        expect(writable.write).toHaveBeenCalledWith(JSON.stringify(geoJson))
        expect(writable.close).toHaveBeenCalled()
    })
})