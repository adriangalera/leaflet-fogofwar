const extractToken = () => {
    const key = "sessionkey=";
    const valueStartIndex = document.cookie.indexOf(key) + key.length;
    return document.cookie.substring(valueStartIndex, document.cookie.indexOf(';', valueStartIndex));
}

const extractWorkouts = () => {
    let workouts = []
    const items = document.querySelectorAll("ul.diary-list__workouts li a");
    for (let i = 0; i < items.length; i++) {
        const href = items[i].getAttribute("href");
        const km = items[i].children[4].innerText
        const id = href.substr(href.lastIndexOf('/') + 1, 24);
        workouts.push({ id: id, distance: km })
    }
    return workouts
}

const showMore = () => {
    document.getElementsByClassName("show-more")[0].click()
}

function download(data, filename) {
    // data is the string type, that contains the contents of the file.
    // filename is the default file name, some browsers allow the user to change this during the save dialog.

    // Note that we use octet/stream as the mimetype
    // this is to prevent some browsers from displaying the 
    // contents in another browser tab instead of downloading the file
    var blob = new Blob([data], { type: 'octet/stream' });

    //IE 10+
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        //Everything else
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = filename;

        setTimeout(() => {
            //setTimeout hack is required for older versions of Safari

            a.click();

            //Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 1);
    }
}

for (var i = 0; i < 100; i++) {
    showMore()
}
const workouts = extractWorkouts()
console.log(`Extracted ${workouts.length} workouts`)
data = {
    token: extractToken(),
    ids: workouts
}

download(JSON.stringify(data), 'data.json')