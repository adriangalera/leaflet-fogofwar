// Download all tracks from sports-tracker (Suunto)
// From https://ivanderevianko.com/2016/04/export-all-workouts-from-sports-tracker
// Go to http://www.sports-tracker.com/diary/workout-list
const printToken = () => {
    const key = "sessionkey=";
    const valueStartIndex = document.cookie.indexOf(key) + key.length;
    const token = document.cookie.substring(valueStartIndex, document.cookie.indexOf(';', valueStartIndex));
    return token
}

const visibleWorkouts = () => {
    let ids = []
    const items = document.querySelectorAll("ul.diary-list__workouts li a");
    for (let i = 0; i < items.length; i++) {
        const href = items[i].getAttribute("href");
        const id = href.substr(href.lastIndexOf('/') + 1, 24);
        ids.push(id)
    }
    return ids
}

const showMore = () => {
    console.log("Showing more workouts");
    const showMoreButton = document.querySelector("#content > div > div.diary-list > div.diary-list__list.diary-list__ordered-by-date > div")
    showMoreButton.click()
}

let workoutCount = 0;

const interval = setInterval(function () {
    showMore();
    let workouts = visibleWorkouts();

    if (workouts.length > 0 && workouts.length == workoutCount) {
        console.log("All loaded!")
        clearInterval(interval)
        console.log(`Your token is: ${printToken()} `)
        console.log(workouts.join(","))
    }

    workoutCount = workouts.length
}, 500)