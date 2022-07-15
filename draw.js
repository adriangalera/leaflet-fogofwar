function Drawer(mask, storage) {
    const container = {

        delete: function (e) {
            const circleToDelete = LGeo.circle(e.latlng, 25)
            const currentGeoJson = storage.get()
            if (currentGeoJson) {
                const diff = turf.difference(currentGeoJson, circleToDelete.toGeoJSON())
                if (diff !== null) {
                    mask.setData(diff)
                    storage.set(diff)
                }
            }
        },

        add: function (e) {
            var holes = LGeo.circle(e.latlng, 25).toGeoJSON()
            const currentGeoJson = storage.get()
            if (currentGeoJson) {
                holes = turf.union(currentGeoJson, holes);
            }
            mask.setData(holes)
            storage.set(holes)
        }
    }
    return container
}

function GpxDrawer(mask, storage, map) {
    const container = {
        draw: (gpxDoc) => {
            const trackPoints = Array.from(gpxDoc.getElementsByTagName("trkpt"));
            const latlngs = trackPoints.map((trkpnt) => container._xmlTrackPointToLatLng(trkpnt))
            const groups = container._group(latlngs, 50)
            var polygonGeoJSON = undefined
            for (let group of groups) {
                const polLatLng = container._joinLinesInPolygon(group)
                const pol = L.polygon(polLatLng).toGeoJSON()
                if (!polygonGeoJSON) {
                    polygonGeoJSON = pol
                } else {
                    polygonGeoJSON = turf.union(pol, polygonGeoJSON)
                }
            }

            const currentGeoJson = storage.get()
            if (currentGeoJson) {
                polygonGeoJSON = turf.union(currentGeoJson, polygonGeoJSON);
            }
            mask.setData(polygonGeoJSON)
            storage.set(polygonGeoJSON)
        },
        _xmlTrackPointToLatLng: (trkpoint) => {
            return [parseFloat(trkpoint.attributes.lat.nodeValue), parseFloat(trkpoint.attributes.lon.nodeValue)]
        },
        _joinLinesInPolygon: (points) => {
            const pointToGeomCoordinate = (p) => {
                if (p.lat && p.lng)
                    return new jsts.geom.Coordinate(p.lat, p.lng)
                return new jsts.geom.Coordinate(p[0], p[1])
            }

            const toLeafletPoint = (p) => {
                return [p.x, p.y]
            }

            const meters = 40
            const distance = (meters * 0.0001) / 111.12;
            const geometryFactory = new jsts.geom.GeometryFactory();
            const pathCoords = points.map((p) => pointToGeomCoordinate(p));
            const shell = geometryFactory.createLineString(pathCoords);
            const polygon = shell.buffer(distance);
            const polygonCoords = polygon.getCoordinates();
            return polygonCoords.map((coord) => toLeafletPoint(coord))
        },
        _group: (arr, n) => {
            const res = [];
            let limit = 0;
            while (limit + n <= arr.length) {
                res.push(arr.slice(limit, n + limit));
                limit += n
            }
            return res
        }
    }
    return container
}