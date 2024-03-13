import { addProgressBar } from './progressbar/creator.js'
import { opacity } from './opacity/opacity.js'
import { GeoJsonLoader, GeoJsonSaver } from './storage/geojson-io.js'
import { GeoJsonStorage } from './storage/storage.js'
import { GeoJsonContainer } from './geojson/container.js'
import { config } from './config/config.js'

const map = L.map("map", {
    center: [41.53289317099601, 2.104000992549118],
    zoom: config.initialZoom
});

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    zoom: config.initialZoom,
    maxZoom: config.maxZoom,
    zIndex: 1,
    opacity: config.minOpacity,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

osm.addTo(map);
const progressBar = addProgressBar(map)
progressBar.stop()

const geoJsonContainer = new GeoJsonContainer(map)
const storage = new GeoJsonStorage()

new GeoJsonLoader(progressBar, storage, geoJsonContainer).addTo(map)
//new GeoJsonSaver(progressBar, storage).addTo(map)

progressBar.load()
storage.all()
    .then((contents) => geoJsonContainer.set(contents))
    .then(() => progressBar.stop())


map.on('zoomend', function () {
    const currentZoom = map.getZoom();
    const newOpacity = opacity.compute(currentZoom, config.minOpacity, config.maxOpacity)
    osm.setOpacity(newOpacity);
});