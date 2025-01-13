make: download process minify

quadtree:
	node scripts/build-quadtree.js

download:
	node scripts/sports-tracker-downloader.js
	cp out-of-sync-gpx/* gpx/.

process: quadtree
	node scripts/generate-points-geojson.js

minify:
	node_modules/json-minify/index.js data/tracks.geojson > /tmp/minified.json
	cp /tmp/minified.json data/tracks.geojson

find-cims-in-tracks:
	wget -q https://www.agalera.eu/100cims/data/100cims/cims.json -O /tmp/100cims.json
	wget -q  https://www.agalera.eu/100cims/data/mendikat/cims.json -O /tmp/mendikat.json
	cp out-of-sync-gpx/* gpx/.
	node scripts/find-cims-in-tracks.js
