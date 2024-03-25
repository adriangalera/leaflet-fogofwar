# leaflet-fogofwar

Based on https://github.com/ptma/Leaflet.Mask and using https://turfjs.org/ for geospatial analysis

Check the <a href="https://www.agalera.eu/leaflet-fogofwar/">demo</a>

## Download GPX Data

There's a script ready to download the GPX tracks from sportstracker, usage:

1. Go to http://www.sports-tracker.com/diary/workout-list
2. Extract the token and the IDs of the tracks to download with the JS functions written in the script.
3. Invoke the script
```bash
node scripts/sports-tracker-extractor.js
node scripts/sports-tracker-downloader.js
```
## Process GPX Data

All GPX tracks are processed into a very big GeoJSON loaded by leaflet-vt.

To process the GPX data, you should run:

```bash
node scripts/gpx-to-geojson.js
```