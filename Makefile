make: download process

dedup:
	node scripts/deduplicate-gpx.js

# dedup-gpx folder contents is safe to delete since it can be re-created locally
clean:
	rm -rf gpx-dedup && mkdir gpx-dedup
	./scripts/empty-gpx.sh > gpx-dedup/merged.gpx

#extract:
#	node scripts/sports-tracker-extractor.js

download:
	node scripts/sports-tracker-downloader.js
	cp out-of-sync-gpx/* gpx/.

process:
	node scripts/gpx-to-geojson.js