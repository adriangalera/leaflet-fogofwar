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
            var circle = LGeo.circle(e.latlng, 25).toGeoJSON()
            mask.addData(circle)
            const joinedPolygon = container._joinCircles()
            storage.set(joinedPolygon)
        },

        _joinCircles: function() {
            const maskHoles = mask.holes()
            for (var i = 0; i < maskHoles.length; ++i) {
                if (i == 0) {
                    var joinedPolygon = turf.polygon([maskHoles[i]]);
                } else {
                    joinedPolygon = turf.union(joinedPolygon, turf.polygon([maskHoles[i]]));
                }
            }
            mask.setData(joinedPolygon)
            return joinedPolygon
        }
    }
    return container
}