import { config } from "../config/config.js"
const opacity = {
    // Min opacity at zoom level 11
    // Max opacity at zoom level 16
    compute: function (currentZoom) {
        if (currentZoom < 11) {
            return config.minOpacity
        }
        if (currentZoom > 16) {
            return config.maxOpacity
        }
        return currentZoom * 0.18 - 1.88
    }
}

export { opacity }