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
const MINIMUM_NUM_POINTS = 10;
const PERCENTAGE_DUPLICATED_POINTS = 95.0 //TODO: try different duplicated percentages

const buildQt = (points) => {
    let qt = QuadTreeNode.empty()
    for (var i = 0; i < points.length; i++) {
        const point = points[i]
        const lat = parseFloat(point.getAttribute("lat"))
        const lng = parseFloat(point.getAttribute("lon"))
        if (!qt.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
            qt.insertLatLng(lat, lng)
        }
    }
    return qt
}

const saveGPXFile = (doc, filePath) => {
    const xml = new XMLSerializer().serializeToString(doc);
    fs.writeFileSync(filePath, xml);
};

const appendDifferentPointsIntoGpxAndBuildQt = (differentPoints, referenceTrackFilename) => {
    const filePath = path.join(RAW_GPX_FOLDER, referenceTrackFilename);
    const referenceTrackDoc = loadGPXFile(filePath);

    // Get trkseg elements using the namespace resolver
    const trkseg = selectWithNamespace('//gpx:trk/gpx:trkseg', referenceTrackDoc)[0];

    if (!trkseg) {
        console.error('Error: Could not find trkseg elements in one of the files.');
        return;
    }

    differentPoints.forEach(point => {
        const importedPoint = referenceTrackDoc.importNode(point, true)
        trkseg.appendChild(importedPoint)
    })

    const referencePointsPlusDifferent = selectWithNamespace('gpx:trkpt', trkseg);
    const dedupFilePath = path.join(DEDUP_GPX_FOLDER, referenceTrackFilename);
    saveGPXFile(referenceTrackDoc, dedupFilePath)
    return buildQt(referencePointsPlusDifferent)
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
    let qtreesByTrack = {}
    const files = await fs.promises.readdir(RAW_GPX_FOLDER);
    count = 0
    for (const filename of files) {
        const filePath = path.join(RAW_GPX_FOLDER, filename);
        const trackDoc = loadGPXFile(filePath)
        const points = getPointsFromTrack(trackDoc)
        if (!points) {
            console.error(`Error: Could not find any point in ${filename}`);
            return;
        }
        if (points.length > MINIMUM_NUM_POINTS) {
            let needsMerge = false
            for (let referenceTrackName of Object.keys(qtreesByTrack)) {
                let duplicatedFound = 0;
                let differentPoints = []
                const referenceQt = qtreesByTrack[referenceTrackName]
                for (var i = 0; i < points.length; i++) {
                    const point = points[i]
                    const lat = parseFloat(point.getAttribute("lat"))
                    const lng = parseFloat(point.getAttribute("lon"))
                    if (referenceQt.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                        duplicatedFound++
                    } else {
                        differentPoints.push(point)
                    }
                }
                const dupPercentage = (duplicatedFound / points.length) * 100.0
                if (dupPercentage > PERCENTAGE_DUPLICATED_POINTS) {
                    console.log(`Compare ${filename} vs ${referenceTrackName} Found ${duplicatedFound} duplicated points: (${dupPercentage} %)`)
                    //console.log(`Compare candidate ${filename} vs reference ${referenceTrackName} http://localhost:3000/unique?t1=${filename}&t2=${referenceTrackName}`)
                    needsMerge = true
                    const qt = appendDifferentPointsIntoGpxAndBuildQt(differentPoints, referenceTrackName)
                    qtreesByTrack[referenceTrackName] = qt
                }
            }
            if (!needsMerge) {
                qtreesByTrack[filename] = buildQt(points)
                const dedupFilePath = path.join(DEDUP_GPX_FOLDER, filename);
                saveGPXFile(trackDoc, dedupFilePath)
            }

        }
        console.log(`Unique tracks count: ${Object.keys(qtreesByTrack).length}. Processed tracks: ${count}`)
        count++
    }
})();