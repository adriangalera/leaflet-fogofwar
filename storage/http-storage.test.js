import { HttpGeoJsonStorage } from './http-storage'


test('should retrieve file from S3', async () => {
    const expectedResponse = { "k": "v" }
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve(expectedResponse),
        })
    );
    const s3 = new HttpGeoJsonStorage({ geoJsonOriginFile: '' })
    const response = await s3.get()
    expect(response).toBe(expectedResponse)
})

test('should not return when fetch fails', async () => {
    global.fetch = jest.fn(() =>
        Promise.reject("error")
    );
    const s3 = new HttpGeoJsonStorage({ geoJsonOriginFile: '' })
    const response = await s3.get()
    expect(response).toBe(undefined)
})