const fs = require('fs');
const { QuadTreeNode } = require('../unique/quadtree');
const DATA_FILE = "data/tracks.geojson";

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
    const quadtreeData = fs.readFileSync("scripts/quadtree.bin");
    const referenceQt = QuadTreeNode.deserialize(quadtreeData);
    const points = referenceQt.points()
    savePointsToFile(points, DATA_FILE)
})();