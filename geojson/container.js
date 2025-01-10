import { config } from '../config/config.js'

const geojsonStyle = {
    color: "#3388FF",
    weight: 2,
    fillOpacity: 0.2,
};

const options = {
    maxZoom: config.maxZoom,
    tolerance: 3,
    debug: 0,
    style: geojsonStyle,
    zIndex: 2,
};

function GeoJsonContainer() {
    return {
        set: function (geojson) {
            return L.geoJson.vt(geojson, options);
        }
    };
}

export { GeoJsonContainer }