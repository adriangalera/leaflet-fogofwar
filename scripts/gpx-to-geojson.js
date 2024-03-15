const tj = require('@mapbox/togeojson');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const path = require('path');
const buffer = require('@turf/buffer');
const turf = require('@turf/helpers');

GPX_FOLDER = "gpx/";
DATA_FILE = "data/tracks.geojson";

const removeCoordTimes = (geojson) => {
    const feature = geojson.features[0];
    if (feature) {
        feature.properties.coordTimes.length = 0;
        return feature
    }
}

const geoJsonLineToPolygon = (feature) => {
    if (feature) {
        const linestring = turf.lineString(feature.geometry.coordinates);
        const buffered = buffer(linestring, 5, { units: 'meters' });
        return buffered
    }
}

const reducePoints = (feature) => {
    if (feature) {
        const factor = 10; //will consider only 1 of each <factor> points
        if (feature.geometry.coordinates.length > factor) {
            let newCoords = []
            for (i = 0; i < feature.geometry.coordinates.length; i = i + factor) {
                newCoords.push(feature.geometry.coordinates[i]);
            }
            feature.geometry.coordinates = newCoords
            return feature
        }
        return feature
    }
}

const gpxToGeoJson = async (filename) => {
    const filePath = path.join(GPX_FOLDER, filename)
    return fs.promises.readFile(filePath, 'utf-8')
        .then(fileContents => new DOMParser().parseFromString(fileContents))
        .then(gpx => tj.gpx(gpx))
        .then(geojson => removeCoordTimes(geojson))
        .then(feature => reducePoints(feature))
        .then(feature => geoJsonLineToPolygon(feature))
}

(async () => {
    const files = await fs.promises.readdir(GPX_FOLDER);
    const features = []
    const promises = []
    for (const file of files) {
        promises.push(
            gpxToGeoJson(file).then(geoJsonFeature => {
                if (geoJsonFeature) {
                    features.push(geoJsonFeature)
                }
            })
        )
    }
    await Promise.all(promises)

    const finalGeoJson = {
        "type": "FeatureCollection",
        "features": features
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(finalGeoJson));

    console.log("GeoJSON file written in " + DATA_FILE);
})();


