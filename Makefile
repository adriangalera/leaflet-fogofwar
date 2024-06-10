make: download process

#extract:
#	node scripts/sports-tracker-extractor.js

download:
	node scripts/sports-tracker-downloader.js
	cp out-of-sync-gpx/* gpx/.

process:
	node scripts/gpx-to-geojson.js