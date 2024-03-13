import { loader } from "./loader.js";

const addProgressBar = (map) => {
    L.Control.Watermark = L.Control.extend(loader);
    L.control.watermark = function (opts) {
        return new L.Control.Watermark(opts);
    }
    return L.control.watermark({ position: 'bottomleft' }).addTo(map);
}

export { addProgressBar }