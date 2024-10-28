const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('xmldom');
const { QuadTreeNode } = require('../unique/quadtree');
const xpath = require('xpath');

// Namespace resolver for the GPX default namespace
const namespaces = { gpx: 'http://www.topografix.com/GPX/1/1' };
const RAW_GPX_FOLDER = "gpx/";
const DEDUP_GPX_FOLDER = "gpx-dedup/";
const METERS_TOLERANCE = 10;

const saveGPXFile = (doc, filePath) => {
    const xml = new XMLSerializer().serializeToString(doc);
    fs.writeFileSync(filePath, xml);
};

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

(async () => {
    let referenceQt = QuadTreeNode.empty()
    const files = await fs.promises.readdir(RAW_GPX_FOLDER);
    count = 0
    for (const filename of files) {
        const filePath = path.join(RAW_GPX_FOLDER, filename);
        const trackDoc = loadGPXFile(filePath)
        const points = getPointsFromTrack(trackDoc)
        let duplicatedFound = 0;
        let differentPoints = []

        for (var i = 0; i < points.length; i++) {
            const point = points[i]
            const lat = parseFloat(point.getAttribute("lat"))
            const lng = parseFloat(point.getAttribute("lon"))
            if (referenceQt.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                duplicatedFound++
            } else {
                referenceQt.insertLatLng(lat, lng)
                differentPoints.push(point)
            }
        }

        if (count % 50 == 0)
            console.log(`Accumulating points: ${count}/${files.length}`)

        //console.log(`Analysing ${filename}. Duplicates found: ${(duplicatedFound / points.length) * 100}`)
        count++
    }

})();