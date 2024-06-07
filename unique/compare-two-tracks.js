#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const turf = require("@turf/turf");
const tmp = require('tmp');
const { exec } = require("child_process");

const generateLeafletHtml = (tracksHtml, distances) => {
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
        #chart_div {
            width: 600px;
            height: 400px;
            position: absolute;
            top: 100px;
            left: 10px;
            z-index: 1000;
        }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <!-- Make sure you put this AFTER Leaflet's CSS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-gpx/1.7.0/gpx.min.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</head>
<body>
    <div id="map">
            <div id="chart_div">
        </div>
    </div>
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
    <script>
        const distances = ${JSON.stringify(distances)}
        google.charts.load("current", {packages:["corechart"]});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
                const dataset = []
        dataset.push(["Distance"])
        for (let d of distances) {
            dataset.push([d])
        }
        const data = google.visualization.arrayToDataTable(dataset)
            var options = {
                title: 'Distances',
                legend: { position: 'none' },
            };
   
            var chart = new google.visualization.Histogram(document.getElementById('chart_div'));
            chart.draw(data, options);
        }

    </script>
</html>
    `
}

const gpxFeatures = async (filename, num_points) => {
    const latlongs = fs.promises.readFile(filename, 'utf-8')
        .then(fileContents => new DOMParser().parseFromString(fileContents))
        .then(gpx => gpx.getElementsByTagName("trkpt"))
        .then(trkpts => Array.from(trkpts).map(trkpt => [trkpt.getAttribute("lat"), trkpt.getAttribute("lon")]))
        .then(trkpts => selectPoints(trkpts, num_points))
    return latlongs
}

const selectPoints = (arr, num_points) => {
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

(async () => {

    const parser = new ArgumentParser({
        description: 'Compares two GPX tracks'
    });

    parser.add_argument('first-track', { type: 'str', help: 'First track to compare' })
    parser.add_argument('second-track', { type: 'str', help: 'Second track to compare' })
    parser.add_argument('--debug', { help: 'Debug', action: 'store_true' });
    parser.add_argument('--num-points', { help: 'Number of points to compare', const: 100, default: 100, nargs: '?' });

    let args = parser.parse_args()

    const features1 = await gpxFeatures(args["first-track"], args.num_points)
    const features2 = await gpxFeatures(args["second-track"], args.num_points)
    let leafletHtml = "";
    let distances = []
    for (let i = 0; i < features1.length; i++) {
        const diff = turf.distance(turf.point(features1[i]),
            turf.point(features2[i]),
            { units: "kilometers" })
        distances.push(diff)

        //L.circle([${features1[i]}], 500).addTo(map);

        leafletHtml += `
        marker = L.marker([${features1[i]}]).addTo(map);
        marker._icon.classList.add("track1");
        
        marker = L.marker([${features2[i]}]).addTo(map);
        marker._icon.classList.add("track2");
        `
    }
    if (args.debug) {
        const html = generateLeafletHtml(leafletHtml, distances)
        const tmpobj = tmp.fileSync({ postfix: '.html' });
        fs.writeFileSync(tmpobj.fd, html)
        exec(`open ${tmpobj.name}`, {});
    }

    const { min, max, mean } = stats(distances)
    console.log(`Distances stats: max: ${max}, min: ${min}, mean: ${mean}`)

})();
