const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const { QuadTreeNode } = require('../unique/quadtree');
const xpath = require('xpath');

// Namespace resolver for the GPX default namespace
const namespaces = { gpx: 'http://www.topografix.com/GPX/1/1' };
const RAW_GPX_FOLDER = "gpx/";
const METERS_TOLERANCE = 10;
const DATA_FILE = "data/tracks.geojson";

// Create a function to select nodes with namespaces
const selectWithNamespace = (expression, node) => {
    return xpath.useNamespaces(namespaces)(expression, node);
};

// Load GPX files
const loadGPXFile = (filePath) => {
    return new DOMParser().parseFromString(fs.readFileSync(filePath, 'utf-8'), 'text/xml');
};

// Extract the lat,lng points from the given track
const getPointsFromTrack = (doc) => {
    const trkseg = selectWithNamespace('//gpx:trk/gpx:trkseg', doc)[0];
    if (!trkseg) {
        console.error('Error: Could not find trkseg elements.');
        return;
    }
    return selectWithNamespace('gpx:trkpt', trkseg);
}
// Save points into a GeoJSON file
const savePointsToFile = (points, filePath) => {
    let geojson = `
{
  "type": "FeatureCollection",
  "features": [
`
    points.forEach((point) => {
        geojson += `
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [${point[1]}, ${point[0]}]
      }
    },
    `
    })
    // remove last comma:
    geojson = geojson.substring(0, geojson.length - 6);
    geojson += `]}`

    fs.writeFileSync(filePath, geojson);
}

(async () => {
    let referenceQt = QuadTreeNode.empty()
    const files = await fs.promises.readdir(RAW_GPX_FOLDER);
    count = 0
    for (const filename of files) {
        const filePath = path.join(RAW_GPX_FOLDER, filename);
        const trackDoc = loadGPXFile(filePath)
        const points = getPointsFromTrack(trackDoc)
        let differentPoints = []

        for (var i = 0; i < points.length; i++) {
            const point = points[i]
            const lat = parseFloat(point.getAttribute("lat"))
            const lng = parseFloat(point.getAttribute("lon"))
            if (!referenceQt.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                referenceQt.insertLatLng(lat, lng)
                differentPoints.push(point)
            }
        }

        if (count % 50 == 0)
            console.log(`Detecting unique GPX points: ${count}/${files.length}`)

        count++
    }
    const points = referenceQt.points()
    savePointsToFile(points, DATA_FILE)
})();