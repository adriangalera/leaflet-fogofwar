make: download process

download:
	node scripts/sports-tracker-downloader.js
	cp out-of-sync-gpx/* gpx/.

process:
	node scripts/generate-points-geojson.js