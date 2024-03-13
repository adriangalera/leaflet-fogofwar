// Download all tracks from sports-tracker (Suunto)
// From https://ivanderevianko.com/2016/04/export-all-workouts-from-sports-tracker
// Go to http://www.sports-tracker.com/diary/workout-list
const fs = require('fs');
const https = require('https');

const myArgs = process.argv.slice(2);
if (myArgs.length != 2) {
    console.log("Usage: node scripts/sports-tracker-downloader.js <token> <file.csv>")
    console.log("Go to http://www.sports-tracker.com/diary/workout-list to retrieve the token and the IDs. Run the methods in this file")
    return
}

const token = myArgs[0]
const idsCsv = myArgs[1]

const loadIds = () => {
    try {
        const data = fs.readFileSync(idsCsv, 'utf8');
        return data.toString().split(",")
    } catch (e) {
        console.log('Error:', e.stack);
    }
}

const alreadyDownloaded = (id) => {
    return fs.existsSync(`./gpx/${id}.gpx`)
}

const downloadGpx = (id, current, total) => {
    const url = `https://api.sports-tracker.com/apiserver/v1/workout/exportGpx/${id}?token=${token}`;
    https.get(url, (res) => {
        const fileName = `./gpx/${id}.gpx`

        if (res.statusCode == 200) {
            const file = fs.createWriteStream(fileName);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`GPX downloaded: ${fileName} (${current}/${total})`);
            });
            return;
        }

        console.log(`Error downloading ${fileName}: `, res.statusCode, res.statusMessage);

    }).on("error", (err) => {
        console.log(`Error downloading ${fileName}: `, err.message);
    });
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const downloadAllWorkouts = async () => {
    const workoutIds = loadIds()
    for (let i = 0; i < workoutIds.length; i++) {
        const id = workoutIds[i]
        if (!alreadyDownloaded(id)) {
            downloadGpx(id, i + 1, workoutIds.length)
            await delay(1000)
        } else {
            console.log(`** Ignoring already downloaded ${id}`)
        }
    }
}

downloadAllWorkouts()