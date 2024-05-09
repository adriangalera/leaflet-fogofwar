// Download all tracks from sports-tracker (Suunto)
// From https://ivanderevianko.com/2016/04/export-all-workouts-from-sports-tracker
// Go to http://www.sports-tracker.com/diary/workout-list
const fs = require('fs');
const https = require('https');

const alreadyDownloaded = (id) => {
    return fs.existsSync(`./gpx/${id}.gpx`)
}

const downloadGpx = (id, current, total, token) => {
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
    const data = JSON.parse(fs.readFileSync("scripts/data.json"))
    const token = data.token
    const workoutIds = data.ids
    for (let i = 0; i < workoutIds.length; i++) {
        const workout = workoutIds[i]
        if (!alreadyDownloaded(workout.id)) {
            downloadGpx(workout.id, i + 1, workoutIds.length, token)
            await delay(1000)
        } else {
            console.log(`** Ignoring already downloaded ${workout.id}`)
        }
    }
}

downloadAllWorkouts()