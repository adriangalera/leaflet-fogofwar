const { chromium } = require('playwright-extra')
// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require('puppeteer-extra-plugin-stealth')()
var read = require('read')
const { writeFileSync } = require('fs');

// Add the plugin to playwright (any number of plugins can be added)
chromium.use(stealth)

const login = async (page) => {
    let frames = page.mainFrame().childFrames().length;
    const username = await read.read({
        prompt: "Username: ",
    });
    await page.locator("#username").pressSequentially(username)
    await page.waitForTimeout(2000);
    const password = await read.read({
        prompt: "Password: ",
        silent: true,
        replace: "*"
    });
    await page.getByPlaceholder("Password").pressSequentially(password)
    await page.waitForTimeout(2000);
    await aceptCaptcha(page);
    await page.waitForTimeout(500);
    await page.locator("#content > div > form > input.submit").click()
}

const aceptCaptcha = async (page) => {
    const captchaFrame = page.mainFrame().childFrames()[0]
    await captchaFrame.waitForSelector('.recaptcha-checkbox-border')
    const elementHandle = await captchaFrame.$('.recaptcha-checkbox-border')
    elementHandle.click()
}

const waitForWorkouts = async (page) => {
    console.log("Waiting for workouts ...")
    await page.waitForSelector("#content > div > div.diary-list > div.workout-totals > ul.workout-totals__activity-types.workout-total__bars > button")
}

const displayAllWorkouts = async (page) => {
    let workoutCount = 0;
    let workouts = await extractIds(page);

    let allLoaded = false;

    while (!allLoaded) {
        try {
            const showMoreButton = page.locator("#content > div > div.diary-list > div.diary-list__list.diary-list__ordered-by-date > div")
            await showMoreButton.click()
        } catch (err) { }
        console.log("Loaded workouts: " + workouts)
        await page.waitForTimeout(500);
        workouts = await extractIds(page);
        allLoaded = workouts.length > 0 && workouts.length == workoutCount
        workoutCount = workouts.length
    }
    console.log("All workouts displayed ...")
}
const extractToken = async (page) => {
    console.log("Extracting token ...")
    const downloadToken = await page.evaluate(() => {
        const key = "sessionkey=";
        const valueStartIndex = document.cookie.indexOf(key) + key.length;
        return document.cookie.substring(valueStartIndex, document.cookie.indexOf(';', valueStartIndex));
    })
    return downloadToken
}
const extractIds = async (page) => {
    const ids = await page.evaluate(() => {
        let ids = []
        const items = document.querySelectorAll("ul.diary-list__workouts li a");
        for (let i = 0; i < items.length; i++) {
            const href = items[i].getAttribute("href");
            const id = href.substr(href.lastIndexOf('/') + 1, 24);
            ids.push(id)
        }
        return ids
    })
    return ids

}

(async () => {
    // Setup
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("http://www.sports-tracker.com/diary/workout-list");
    await login(page)
    await waitForWorkouts(page)
    await displayAllWorkouts(page)
    const token = await extractToken(page)
    const ids = await extractIds(page)

    // Teardown
    await context.close();
    await browser.close();

    data = {
        token: token,
        ids: ids
    }
    path = "scripts/data.json"
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');

})();