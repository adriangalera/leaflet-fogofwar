/*
This script takes two tracks and compares them to see if its' the same
*/
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const turf = require("@turf/turf");

track1 = "gpx/608afd8ffc669f0409be19ff.gpx"
track2 = "gpx/601ecf604a3d506328ccae7d.gpx"

const generateLeafletHtml = (tracksHtml) => {
    return `
<html>
<head>
    <style type="text/css">
        body {
            padding: 0;
            margin: 0;
        }

        html,
        body,
        #map {
            height: 100%;
        }

        .track1 {
            background-color: red;
        }

        .track2 {
            background-color: blue;
        }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <!-- Make sure you put this AFTER Leaflet's CSS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/gpx.min.js"></script>

</head>
<body>
    <div id="map"></div>
</body>

<script>

    const map = L.map("map", {
        center: [41.53289317099601, 2.104000992549118],
        zoom: 14
    });

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        zoom: 14,
        zIndex: 1,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    osm.addTo(map);
    ${tracksHtml}
    </script>
</html>
    `
}

const gpxFeatures = async (filename) => {
    const latlongs = fs.promises.readFile(filename, 'utf-8')
        .then(fileContents => new DOMParser().parseFromString(fileContents))
        .then(gpx => gpx.getElementsByTagName("trkpt"))
        .then(trkpts => Array.from(trkpts).map(trkpt => [trkpt.getAttribute("lat"), trkpt.getAttribute("lon")]))
        .then(trkpts => selectPoints(trkpts))
    return latlongs
}

const selectPoints = (arr, num_points = 10) => {
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
    return {min, max, mean}
}


(async () => {
    const features1 = await gpxFeatures(track1)
    const features2 = await gpxFeatures(track2)
    let leafletHtml = "";
    let distances = []
    for (let i = 0; i < features1.length; i++) {
        const diff = turf.distance(turf.point(features1[i]),
            turf.point(features2[i]),
            { units: "kilometers" })
        distances.push(diff)
        msg = `Comparing point ${features1[i]} vs ${features2[i]}. Distance (km): ${diff}`
        leafletHtml += `
        marker = L.marker([${features1[i]}]).addTo(map);
        marker._icon.classList.add("track1");
        L.circle([${features1[i]}], 500).addTo(map);
        marker = L.marker([${features2[i]}]).addTo(map);
        marker._icon.classList.add("track2");
        `
    }
    const html = generateLeafletHtml(leafletHtml)
    fs.writeFileSync("unique/index.html", html)

    const { min, max, mean } = stats(distances)
    console.log(`Distances stats: max: ${max}, min: ${min}, mean: ${mean}`)

})();