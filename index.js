import { addProgressBar } from './progressbar/creator.js'
import { opacity } from './opacity/opacity.js'
import { GeoJsonStorage } from './storage/storage.js'
import { GeoJsonContainer } from './geojson/container.js'
import { config } from './config/config.js'
import { CacheGeoJsonStorage } from './storage/cache-storage.js'
import { HttpGeoJsonStorage } from './storage/http-storage.js'

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

let geoJsonLayer;

const geoJsonContainer = new GeoJsonContainer(map)
const storage = new GeoJsonStorage(new CacheGeoJsonStorage(), new HttpGeoJsonStorage(config))

progressBar.load()
const tracksPromise = storage.get()
    .then((contents) => {
        geoJsonLayer = geoJsonContainer.set(contents)
        geoJsonLayer.addTo(map)
    })
    .then(() => progressBar.stop())


map.on('zoomend', function () {
    const currentZoom = map.getZoom();
    const newOpacity = opacity.compute(currentZoom, config.minOpacity, config.maxOpacity)
    osm.setOpacity(newOpacity);
});

var saveButton = L.easyButton('fa-save', storage.saveToFile);
saveButton.addTo(map);
var refreshButton = L.easyButton('fa-refresh', () => {
    const hash = "ead992c2a075406ce53dbc975db99656ffaa63b7751797bf42efc411243c8f67eef43ebb81cbbb9bd065cb517e44d1802565f5ea745eb0db45b9b164d8cc1f54";
    let password = prompt("Please enter the password");
    if (hash === sha3_512(password)) {
        storage.reload()
    }
});
refreshButton.addTo(map);

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
let centCims = []
var centPromise = fetch('https://www.agalera.eu/100cims/data/100cims/cims.json')
    .then(response => response.json())
    .then(cims => {
        for (let cim of cims) {
            var marker = L.marker([cim.lat, cim.lng], { icon: cim["fet"] ? greenIcon : greyIcon })
                .bindPopup(`<a href="${cim.link}" target="_blank" rel="noopener noreferrer" >${cim.name}</a><br>${cim.area}, ${cim.height} m`)
            centCims.push(marker);
        }
    })
    .catch(error => console.log(error));
let mendikat = []
var menPromise = fetch('https://www.agalera.eu/100cims/data/mendikat/cims.json')
    .then(response => response.json())
    .then(cims => {
        for (let cim of cims) {
            var marker = L.marker([cim.lat, cim.lng], { icon: cim["fet"] ? greenIcon : blueIcon })
                .bindPopup(`<a href="${cim.link}" target="_blank" rel="noopener noreferrer" >${cim.name}</a><br>${cim.area}, ${cim.height} m`)
            mendikat.push(marker);
        }
    })
    .catch(error => console.log(error));

Promise.all([
    menPromise,
    centPromise,
    tracksPromise
]).then(() => {
    let initialLatLng = new L.LatLng(41.53289317099601, 2.104000992549118)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude)
            map.panTo(initialLatLng)
        })
    }

    var mcgLayerSupportGroup = L.markerClusterGroup.layerSupport({ disableClusteringAtZoom: 11 }),
        centCimsGroup = L.layerGroup(),
        mendikatGroup = L.layerGroup(),
        control = L.control.layers(null, null, { collapsed: false });

    mcgLayerSupportGroup.addTo(map);

    mendikat.forEach(m => m.addTo(mendikatGroup));
    centCims.forEach(m => m.addTo(centCimsGroup));

    mcgLayerSupportGroup.checkIn([centCimsGroup, mendikatGroup]);

    control.addOverlay(centCimsGroup, "100 cims");
    control.addOverlay(mendikatGroup, "Mendikat");
    control.addOverlay(geoJsonLayer, "Tracks");

    control.addTo(map);

    centCimsGroup.addTo(map);
});