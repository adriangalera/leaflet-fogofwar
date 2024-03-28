make: extract download process

extract:
	node scripts/sports-tracker-extractor.js

download:
	node scripts/sports-tracker-downloader.js

process:
	node scripts/gpx-to-geojson.js