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