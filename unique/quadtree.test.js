const QuadTree = require('./quadtree');
const QuadTreeNode = QuadTree.QuadTreeNode;
const LngLat = QuadTree.LngLat;

test('Creates an empty quadtree representing the world', () => {
  const qt = QuadTreeNode.empty()
  expect(qt.northEastCoord).toEqual(new LngLat(180, 90))
  expect(qt.northWestCoord).toEqual(new LngLat(-180, 90))
  expect(qt.southEastCoord).toEqual(new LngLat(180, -90))
  expect(qt.southWestCoord).toEqual(new LngLat(-180, -90))

  expect(qt.nortEastChild).toEqual(undefined)
  expect(qt.nortWestChild).toEqual(undefined)
  expect(qt.southEastChild).toEqual(undefined)
  expect(qt.southWestChild).toEqual(undefined)

  expect(qt.values).toEqual([])
  expect(qt.hasChildNodes()).toBe(false)
});

test('point belongs to quad tree node', () => {
  const qt = QuadTreeNode.empty()
  //center
  expect(qt.belongsLatLng(0, 0)).toBe(true)

  //boundaries of latitude
  expect(qt.belongsLatLng(90, 0)).toBe(true)
  expect(qt.belongsLatLng(90.01, 0)).toBe(false)
  expect(qt.belongsLatLng(-90.01, 0)).toBe(false)

  //boundaries of longitude
  expect(qt.belongsLatLng(0, 179.999)).toBe(true)
  expect(qt.belongsLatLng(0, 180)).toBe(true)
  expect(qt.belongsLatLng(0, 180.01)).toBe(false)
  expect(qt.belongsLatLng(0, -180.01)).toBe(false)

  //boundaries of both
  expect(qt.belongsLatLng(90, 180)).toBe(true)
  expect(qt.belongsLatLng(-90, -180)).toBe(false)
});

test('insert point into quad tree', () => {
  const qt = QuadTreeNode.empty()
  let result = qt.insert(new LngLat(0, 0))
  expect(result).toBe(true)
  expect(qt.values).toEqual([new LngLat(0, 0)])

  result = qt.insert(new LngLat(1000, 1000))
  expect(result).toBe(false)
})


test('quad tree is splitted when reaches capacity', () => {
  const maxCapacity = 2
  const qt = QuadTreeNode.empty(maxCapacity)
  qt.insert(new LngLat(0, 0))
  qt.insert(new LngLat(0, 1))

  expect(qt.hasChildNodes()).toBe(true)

  // North east child
  expect(qt.northEastChild.northEastCoord).toEqual(new LngLat(180, 90))
  expect(qt.northEastChild.northWestCoord).toEqual(new LngLat(0, 90))
  expect(qt.northEastChild.southEastCoord).toEqual(new LngLat(180, 0))
  expect(qt.northEastChild.southWestCoord).toEqual(new LngLat(0, 0))

  //North west child
  expect(qt.northWestChild.northEastCoord).toEqual(new LngLat(0, 90))
  expect(qt.northWestChild.northWestCoord).toEqual(new LngLat(-180, 90))
  expect(qt.northWestChild.southEastCoord).toEqual(new LngLat(0, 0))
  expect(qt.northWestChild.southWestCoord).toEqual(new LngLat(-180, 0))

  //South east child
  expect(qt.southEastChild.northEastCoord).toEqual(new LngLat(180, 0))
  expect(qt.southEastChild.northWestCoord).toEqual(new LngLat(0, 0))
  expect(qt.southEastChild.southEastCoord).toEqual(new LngLat(180, -90))
  expect(qt.southEastChild.southWestCoord).toEqual(new LngLat(0, -90))

  //South west child
  expect(qt.southWestChild.northEastCoord).toEqual(new LngLat(0, 0))
  expect(qt.southWestChild.northWestCoord).toEqual(new LngLat(-180, 0))
  expect(qt.southWestChild.southEastCoord).toEqual(new LngLat(0, -90))
  expect(qt.southWestChild.southWestCoord).toEqual(new LngLat(-180, -90))
})

test('quad tree can find point before splitting', () => {
  const qt = QuadTreeNode.empty()
  qt.insert(new LngLat(0, 0))
  qt.insert(new LngLat(10, 10))
  expect(qt.locationIsOnTree(0, 0, 0)).toBe(true)
  expect(qt.locationIsOnTree(1, 1, 0)).toBe(false)
})

test('quad tree can find point after split', () => {
  const maxCapacity = 2
  const qt = QuadTreeNode.empty(maxCapacity)
  qt.insert(new LngLat(0, 0))
  qt.insert(new LngLat(0, 1))

  expect(qt.hasChildNodes()).toBe(true)
  expect(qt.locationIsOnTree(0, 0, 0)).toBe(true)
})

test('quad tree can find point after split and with default tolerance', () => {
  const maxCapacity = 2
  const qt = QuadTreeNode.empty(maxCapacity)
  qt.insert(new LngLat(0, 0))
  qt.insert(new LngLat(0, 1))

  expect(qt.hasChildNodes()).toBe(true)
  expect(qt.lngLatIsOnTree(new LngLat(0, 0))).toBe(true)
})

test("lnglat equals with tolerance", () => {
  const tolerance_meters = 10
  const lngLat1 = new LngLat(10, 10)
  const lngLat2 = new LngLat(20, 20)
  const qt = QuadTreeNode.empty()

  // from  const { lat_diff, long_diff } = qt.latLngTolerance(10, 10, 10)
  const latTolerance = 0.00008983111749910169
  const latDiffWithinTolerance = latTolerance - 0.00001
  const latDiffOutsideTolerance = latTolerance - 0.00001
  const lngTolerance = 0.00009121637776757113
  const lngDiffWithinTolerance = lngTolerance - 0.00001
  const lngDiffOutsideTolerance = lngTolerance + 0.00001

  const lngLat3 = new LngLat(lngLat1.lng - lngDiffWithinTolerance, lngLat1.lat - latDiffWithinTolerance) // inside tolerance
  const lngLat4 = new LngLat(lngLat1.lng - lngDiffOutsideTolerance, lngLat1.lat - latDiffOutsideTolerance) // outside tolerance

  expect(qt.equalsWithTolerance(lngLat1, lngLat1, tolerance_meters)).toBe(true)
  expect(qt.equalsWithTolerance(lngLat1, lngLat2, tolerance_meters)).toBe(false)
  expect(qt.equalsWithTolerance(lngLat1, lngLat3, tolerance_meters)).toBe(true)
  expect(qt.equalsWithTolerance(lngLat1, lngLat4, tolerance_meters)).toBe(false)
})

test("meters to lat/lng", () => {
  const qt = QuadTreeNode.empty()
  const { lat_drift_allowed, lng_drift_allowed } = qt.latLngTolerance(41.367228, 2.076431, 10)
  expect(lat_drift_allowed).toEqual(0.00008983111749910169)
  expect(lng_drift_allowed).toEqual(0.00011968239493702266)
})

test("reproduce bug in unique/index.html", () => {
  const latLngs = [
    [41.541482, 2.116323],
    [41.541522, 2.116437],
    [41.541557, 2.116552],
    [41.54151, 2.11667],
    [41.541413, 2.116737],
    [41.541327, 2.116807],
    [41.541235, 2.11685],
    [41.541085, 2.116917],
    [41.540962, 2.116977],
    [41.54084, 2.11703],
    [41.540743, 2.11709]
  ]

  const meters_tolerance = 5
  const quadTree = QuadTreeNode.empty(2)

  for (let latLng of latLngs) {
    const lat = latLng[0]
    const lng = latLng[1]

    if (!quadTree.locationIsOnTree(lat, lng, meters_tolerance)) {
      quadTree.insertLatLng(lat, lng)
    }
  }
  for (let latLng of latLngs) {
    const lat = latLng[0]
    const lng = latLng[1]
    expect(quadTree.locationIsOnTree(lat, lng, meters_tolerance)).toBe(true)
  }
})

test("QT returns all points before splitting", () => {
  const qt = QuadTreeNode.empty()
  expect(qt.points()).toEqual([])
  qt.insert(new LngLat(20, 10))
  expect(qt.points()).toEqual([[10, 20]])
  qt.insert(new LngLat(30, 20))
  expect(qt.points()).toEqual([[10, 20], [20, 30]])
})

test("QT returns all points after splitting", () => {
  const latLngs = [
    [41.541482, 2.116323],
    [41.541522, 2.116437],
    [41.541557, 2.116552],
    [41.54151, 2.11667],
    [41.541413, 2.116737],
    [41.541327, 2.116807],
    [41.541235, 2.11685],
    [41.541085, 2.116917],
    [41.540962, 2.116977],
    [41.54084, 2.11703],
    [41.540743, 2.11709]
  ]

  const quadTree = QuadTreeNode.empty(2)

  for (let latLng of latLngs) {
    const lat = latLng[0]
    const lng = latLng[1]
    quadTree.insertLatLng(lat, lng)
  }
  const points = quadTree.points()
  expect(points.length).toBe(latLngs.length)
  expect(points.sort()).toStrictEqual(latLngs.sort())
})