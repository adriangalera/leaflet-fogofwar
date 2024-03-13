import { opacity } from "./opacity";

describe('Set opacity based on zoom', () => {

    const minOpacity = 0.1;
    const maxOpacity = 1;

    const table = [
        [0, minOpacity],
        [1, minOpacity],
        [2, minOpacity],
        [3, minOpacity],
        [4, minOpacity],
        [5, minOpacity],
        [5, minOpacity],
        [6, minOpacity],
        [7, minOpacity],
        [8, minOpacity],
        [9, minOpacity],
        [10, minOpacity],
        [11, minOpacity],
        [12, 0.28],
        [13, 0.46],
        [14, 0.64],
        [15, 0.82],
        [16, maxOpacity],
        [17, maxOpacity]
    ]
    it.each(table)('zoom %s opacity= %s', (zoomLevel, expectedOpacity) => {
        expect(opacity.compute(zoomLevel, minOpacity, maxOpacity)).toBeCloseTo(expectedOpacity, 3)
    })
})

