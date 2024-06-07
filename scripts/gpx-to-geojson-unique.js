const tj = require('@mapbox/togeojson');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const path = require('path');
const turf = require("@turf/turf");

GPX_FOLDER = "gpx/";
DATA_FILE = "data/tracks.geojson";
DEBUG = true
/*
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
*/
/*
const reducePoints = (feature) => {
    if (feature) {
        const factor = 7; //will consider only 1 of each <factor> points
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
*/
/*
const gpxToGeoJson = async (filename) => {
    const filePath = path.join(GPX_FOLDER, filename)
    return fs.promises.readFile(filePath, 'utf-8')
        .then(fileContents => new DOMParser().parseFromString(fileContents))
        .then(gpx => tj.gpx(gpx))
        .then(geojson => removeCoordTimes(geojson))
        .then(feature => reducePoints(feature))
        .then(feature => geoJsonLineToPolygon(feature))
}
        */

const parseGpx = async (filename) => {
    const filePath = path.join(GPX_FOLDER, filename)
    return fs.promises.readFile(filePath, 'utf-8')
        .then(fileContents => new DOMParser().parseFromString(fileContents))
}

const extractLatLonToCompare = (gpx) => {
    const trkpts = gpx.getElementsByTagName("trkpt")
    return Array.from(trkpts).map(trkpt => [trkpt.getAttribute("lat"), trkpt.getAttribute("lon")])
}

const selectPoints = (arr, num_points = 50) => {
    let points = []
    const idx_ind = Math.floor(arr.length / num_points)
    for (let i = 0; i < num_points - 1; i++) {
        points.push(arr[i * idx_ind])
    }
    points.push(arr[arr.length - 1])
    return points
}

const stats = (distances) => {
    var min = distances.reduce(
        function (a, b) { return Math.min(a, b); },
        Infinity);
    var max = distances.reduce(
        function (a, b) { return Math.max(a, b); },
        -Infinity);
    var mean = distances.reduce(function (a, b) { return a + b; }, 0)
        / distances.length;
    return { min, max, mean }
}

const compareLatLons = (features1, features2) => {
    let distances = []
    for (let i = 0; i < features1.length; i++) {
        const diff = turf.distance(
            turf.point(features1[i]), turf.point(features2[i]),
            { units: "kilometers" })
        distances.push(diff)
    }
    return stats(distances)
}

const similarTrack = (fileLatLon, latlons) => {
    for (const [filename, latlon] of Object.entries(fileLatLon)) {
        const { min, max, mean } = compareLatLons(latlons, latlon)
        if (max < 0.5 && mean < 0.5) {
            return { hasSimilarTrack: true, foundFilename: filename }
        }
    }
    return { hasSimilarTrack: false, foundFilename: "" }
}


(async () => {
    const files = await fs.promises.readdir(GPX_FOLDER);
    const fileLatLon = {}
    let similarTracks = []
    num_lat_lon_compare = 100
    for (const file of files) {
        const gpx = await parseGpx(file)
        const latlons = extractLatLonToCompare(gpx)
        if (latlons.length > num_lat_lon_compare) {
            const pointsToCompare = selectPoints(latlons, num_points = num_lat_lon_compare)
            const { hasSimilarTrack, foundFilename } = similarTrack(fileLatLon, pointsToCompare)
            if (hasSimilarTrack) {
                similarTracks.push([file, foundFilename])
            } else {
                fileLatLon[file] = pointsToCompare
            }
        }
    }

    console.log(`Detected ${Object.keys(fileLatLon).length} unique tracks`)

    if (DEBUG) {
        for (let similarFiles of similarTracks) {
            cmd = `node unique/compare-two-tracks.js ${GPX_FOLDER}${similarFiles[0]} ${GPX_FOLDER}${similarFiles[1]} --debug`
            console.log(cmd)
        }
    }

    /*
    const finalGeoJson = {
        "type": "FeatureCollection",
        "features": features
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(finalGeoJson));

    console.log("GeoJSON file written in " + DATA_FILE);
    */
})();


