# leaflet-fogofwar

Based on https://github.com/ptma/Leaflet.Mask and using https://turfjs.org/ for geospatial analysis

Check the <a href="https://www.agalera.eu/leaflet-fogofwar/">demo</a>

## Add new GPX from Suunto sportstracker

Go to `scripts/sports-tracker-extractor-manual.js` and follow the instructions in the comments.

You must run the js code in the browser. It will generate and download a `data.json` file and should move it to the scripts folder.

```bash
mv ~/Downloads/data.json scripts/.
```

Run 
```bash
make download
```

To download the GPX files from sportstracker and build the quadtree.

## Process GPX Data

All GPX track points are added first to a quadtree to discard repeated points.

Later the quadtree is dumped into a very big GeoJSON loaded by leaflet-vt.

To process the GPX data, you should run:

```bash
make
```