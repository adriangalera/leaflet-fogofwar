(function (factory, window) {
    // define an AMD module that relies on 'leaflet'
    if (typeof define === "function" && define.amd) {
        define(["leaflet"], factory);

        // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === "object") {
        module.exports = factory(require("leaflet"));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== "undefined" && window.L) {
        factory(L);
    }
})(function (L) {
    L.Mask = L.LayerGroup.extend({
        options: {
            color: "#3388FF",
            weight: 1,
            fillColor: "#FFFFFF",
            fillOpacity: 1,

            interactive: false,

            fitBounds: true,
            restrictBounds: true,
        },

        initialize: function (geojson, options) {
            L.Util.setOptions(this, options);
            this._layers = {};
            this._holes = []
            this._bounds = new L.LatLngBounds();
            this._allWorldCoordinates = [
                [-3600, -900],
                [-3600, 900],
                [3600, 900],
                [3600, -900],
            ]

            if (geojson) {
                if (typeof geojson === "string") {
                    var _that = this;
                    this._request(geojson, function (json) {
                        _that.addData(json);
                    });
                } else {
                    this.addData(geojson);
                }
            }
        },
        addData: function (geojson) {
            this._addObject(geojson);
            this._setMaskLayer();
        },
        setData: function (geojson) {
            this._holes = []
            this._addObject(geojson);
            this._setMaskLayer();
        },
        holes: function () {
            return this._holes
        },
        _addObject: function (json) {
            var i, len;
            if (L.Util.isArray(json)) {
                for (i = 0, len = json.length; i < len; i++) {
                    this._addObject(json[i]);
                }
            } else {
                switch (json.type) {
                    case "FeatureCollection":
                        var features = json.features;
                        for (i = 0, len = features.length; i < len; i++) {
                            this._addObject(features[i]);
                        }
                        return;
                    case "Feature":
                        this._addObject(json.geometry);
                        return;
                    case "GeometryCollection":
                        var geometries = json.geometries;
                        for (i = 0, len = geometries.length; i < len; i++) {
                            this._addObject(geometries[i]);
                        }
                        return;
                    case "Polygon":
                        this._addRemovalPolygonCoordinates(json.coordinates);
                        return;
                    case "MultiPolygon":
                        this._addRemovalMultiPolygonCoordinates(json.coordinates);
                        return;
                    default:
                        return;
                }
            }
        },
        _addRemovalPolygonCoordinates: function (coords) {
            for (var i = 0; i < coords.length; i++) {
                this._holes.push(coords[i])
            }
        },
        _addRemovalMultiPolygonCoordinates: function (coords) {
            for (var i = 0, len = coords.length; i < len; i++) {
                this._addRemovalPolygonCoordinates(coords[i]);
            }
        },
        _setMaskLayer: function () {
            if (this.masklayer) {
                this.removeLayer(this.masklayer)
            }

            var allWorld = this._coordsToLatLngs(this._allWorldCoordinates)
            var latlngs = [allWorld]

            this._holes.forEach((hole) => latlngs.push(this._coordsToLatLngs(hole)))

            var layer = new L.Polygon(latlngs, this.options);
            this.masklayer = layer
            this.addLayer(layer);
        },
        _dimension: function (arr) {
            var j = 1;
            for (var i in arr) {
                if (arr[i] instanceof Array) {
                    if (1 + this._dimension(arr[i]) > j) {
                        j = j + this._dimension(arr[i]);
                    }
                }
            }
            return j;
        },
        _coordsToLatLng: function (coords) {
            return new L.LatLng(coords[1], coords[0], coords[2]);
        },
        _coordsToLatLngs: function (coords) {
            var latlngs = [];
            var _dimensions = this._dimension(coords);
            for (var i = 0, len = coords.length, latlng; i < len; i++) {
                if (_dimensions > 2) {
                    latlng = this._coordsToLatLngs(coords[i]);
                } else {
                    latlng = this._coordsToLatLng(coords[i]);
                }
                latlngs.push(latlng);
            }

            return latlngs;
        }
    });

    L.mask = function (geojson, options) {
        return new L.Mask(geojson, options);
    };
}, window);