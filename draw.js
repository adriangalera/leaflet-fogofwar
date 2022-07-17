function Drawer(mask, storage, map) {
    const container = {
        markers: [],
        delete: function (e) {
            const circleToDelete = LGeo.circle(e.latlng, 25)
            storage.get().then((geoJson) => {
                if (geoJson) {
                    const diff = turf.difference(geoJson, circleToDelete.toGeoJSON())
                    if (diff !== null) {
                        mask.setData(diff)
                        storage.set(diff)
                    }
                }
            })
        },
        onAdd: function (e) {
            const marker = new L.Marker(e.latlng)
            marker.on('click', function (e) {
                this.remove()
            })
            container.markers.push(marker.addTo(map))
        },
        consolidateMakers: function () {
            if (container.markers.length == 1) {
                const circle = LGeo.circle(container.markers[0].getLatLng(), 5).toGeoJSON()
                _joinPolygonGeoJsonWithCurrentGeoJson(storage, mask, circle)
            }
            if (container.markers.length > 1) {
                const latlngs = container.markers.map((marker) => marker.getLatLng())
                const polygonLatLng = _joinLinesInPolygon(latlngs)
                const polygonGeoJSON = L.polygon(polygonLatLng).toGeoJSON()
                _joinPolygonGeoJsonWithCurrentGeoJson(storage, mask, polygonGeoJSON)
            }
            container.cleanMakers();
        },
        cleanMakers: function () {
            container.markers.forEach((marker) => marker.remove())
            container.markers = []
        }

    }
    return container
}

function DrawingButton(drawer) {
    return L.easyButton('fa-pencil', function (btn, map) {
        drawer.consolidateMakers();
    });
}

function GpxDrawer(mask, storage, map) {
    const container = {
        draw: (gpxDoc) => {
            const trackPoints = Array.from(gpxDoc.getElementsByTagName("trkpt"));
            const latlngs = trackPoints.map((trkpnt) => container._xmlTrackPointToLatLng(trkpnt))
            const groups = container._group(latlngs, 200)
            var polygonGeoJSON = undefined
            for (let group of groups) {
                const polLatLng = _joinLinesInPolygon(group)
                const pol = L.polygon(polLatLng).toGeoJSON()
                if (!polygonGeoJSON) {
                    polygonGeoJSON = pol
                } else {
                    polygonGeoJSON = turf.union(pol, polygonGeoJSON)
                }
            }
            _joinPolygonGeoJsonWithCurrentGeoJson(storage, mask, polygonGeoJSON)
        },
        _xmlTrackPointToLatLng: (trkpoint) => {
            return [parseFloat(trkpoint.attributes.lat.nodeValue), parseFloat(trkpoint.attributes.lon.nodeValue)]
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

const _joinLinesInPolygon = (points) => {
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
}

const _joinPolygonGeoJsonWithCurrentGeoJson = (storage, mask, polygonGeoJson) => {

    storage.get().then((geoJson) => {
        if (geoJson) {
            polygonGeoJson = turf.union(geoJson, polygonGeoJson);
        }
        mask.setData(polygonGeoJson)
        storage.set(polygonGeoJson)
        map.fitBounds(L.geoJSON(polygonGeoJson).getBounds())
    })
}