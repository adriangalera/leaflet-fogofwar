make: download process minify

download:
	node scripts/sports-tracker-downloader.js
	cp out-of-sync-gpx/* gpx/.

process:
	node scripts/generate-points-geojson.js

minify:
	node_modules/json-minify/index.js data/tracks.geojson > /tmp/minified.json
	cp /tmp/minified.json data/tracks.geojson