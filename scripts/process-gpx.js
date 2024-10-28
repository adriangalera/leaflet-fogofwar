const fs = require('fs');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;
const { QuadTreeNode } = require('../unique/quadtree');
const { point } = require('@turf/helpers');

const GPX_FOLDER = "gpx/";
const METERS_TOLERANCE = 10;

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

(async () => {
    const files = await fs.promises.readdir(GPX_FOLDER);
    let qtreesByTrack = {}
    let groupedTracks = {}
    let index = 0;
    for (const filename of files) {
        const filePath = path.join(GPX_FOLDER, filename)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const parsed = new DOMParser().parseFromString(fileContent)
        const points = parsed.getElementsByTagName("trkpt")
        if (points.length > 10) {
            //console.log(`Analyzing ${filename}`)
            let needsMerge = false
            for (let trackName of Object.keys(qtreesByTrack)) {
                let duplicatedFound = 0;
                const referenceQt = qtreesByTrack[trackName]
                for (var i = 0; i < points.length; i++) {
                    const point = points[i]
                    const lat = parseFloat(point.getAttribute("lat"))
                    const lng = parseFloat(point.getAttribute("lon"))
                    if (referenceQt.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                        duplicatedFound++
                    }
                }
                const dupPercentage = (duplicatedFound / points.length) * 100.0
                if (dupPercentage > 80) {
                    //console.log(`Compare ${filename} vs ${trackName} Found ${duplicatedFound} duplicated points: (${dupPercentage} %)`)
                    console.log(`Compare ${filename} vs ${trackName} http://localhost:3000/unique?t1=${filename}&t2=${trackName}`)
                    needsMerge = true
                }
            }
            if (!needsMerge)
                qtreesByTrack[filename] = buildQt(points)

        }
        index++
    }
})();