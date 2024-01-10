// Welcome to Ben's Scraping Experience. The purpose of this script is to scrape a set number of websites, store the information as JSON, and append it to a JSON file.
// If the site cannot be reached, the JSON file will be unaffected. Every site requires a different scraper, and the scraper functions will convert the scraped data to JSON. The JSON writing function will write the JSON if the site could successfully be scraped. Error or no new data = no new JSON written.
// This app will not do anything else, and a public API will be written to handle the data on ben's server (ben api). Sara's website will access this API to get the data. the API server will run this script daily to get up-to-date movie info.
// The JSON format will contain the name of the event, the date, the showtime and the theatre location.
// Might make this run locally and then be uploaded to ben api by a human. Will see if gcloud instances can run it.

const axios = require('axios');
const cheerio = require('cheerio');
const { writeFile } = require('fs');
const fs = require("fs");
const writePath = './theatreinfo.json'
let permanentJsonArray = [];
// let todayDate = new Date().toISOString().split('T')[0];

function writeJsonToFile() {
    writeFile(writePath, JSON.stringify(permanentJsonArray, null, 2), (error) => {
        if (error) {
            console.log('An error has occurred ', error);
            return;
        }
        console.log('Data written successfully to disk');
    });
}
async function scraperTheRevue() {
    let location = "The Revue"
    let tempJsonArray = []
    let url = 'https://revuecinema.ca/schedule/'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const table = $('td.InsideDate');

    table.each((i, node) => {
        let events = $(node).find('.Item');
        let date = $(node).find(".Date");
        events.each((i, event) => {
            let title = $(event).find(".Name").text();
            let time = $(event).find(".Time").text();
            let tempJson = {
                "Location": location,
                "Date": date.text(),
                "Time": time,
                "Title": title
            }
            tempJsonArray.push(tempJson)
        })
    })
    permanentJsonArray.push(tempJsonArray);

}
async function scraperImagineCarlton() {
    let location = "Imagine Cinemas : Carlton"
    for (let i = 0; i < 10; i++) {
        let date = new Date();
        let tempJsonArray = []
        date.setDate(date.getDate() + i);
        date = date.toISOString();
        date = date.split('T')[0];

        let url = 'https://imaginecinemas.com/cinema/carlton/?date=' + date;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const elements = $('.movie-showtime');

        elements.each((i, node) => {
            let title = $(node).find('.movie-title');
            let times = $(node).find(".times");
            times.each((i, time) => {
                let temp = $(time).find(".movie-performance").text();
                let showtime = temp.split("PM")
                for (let j = 0; j < showtime.length; j++) {
                    if (showtime[j]) {
                        let tempJson = {
                            "Location": location,
                            "Date": date,
                            "Time": showtime[j] + "PM",
                            "Title": title.text()
                        }
                        console.log("Now adding : " + title.text() + " at " + showtime[j] + ".")
                        tempJsonArray.push(tempJson)
                    }
                }
            })
            // remove dubs go here
        })
        // let cleanJsonArray = tempJsonArray.filter((tempJsonArray, index, self) =>
        //     index === self.findIndex((t) => (t.Time === tempJsonArray.Time && t.Title === tempJsonArray.Title)))
        // permanentJsonArray.push(cleanJsonArray);
        permanentJsonArray.push(tempJsonArray);
    }

}
async function scraperImagineFront() {
    let location = "Imagine Cinemas : Front"
    for (let i = 0; i < 10; i++) {
        let date = new Date();
        let tempJsonArray = []
        date.setDate(date.getDate() + i);
        date = date.toISOString();
        date = date.split('T')[0];

        let url = 'https://imaginecinemas.com/cinema/market-square/?date=' + date;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const elements = $('.movie-showtime');

        elements.each((i, node) => {
            let title = $(node).find('.movie-title');
            let times = $(node).find(".times");
            times.each((i, time) => {
                let temp = $(time).find(".movie-performance").text();
                // this is a string of all the times combined. Split this into multiple strings, add to list deliminate by PM, for each to tempJSON it
                let showtimes = temp.split("PM")
                for (let j = 0; j < showtimes.length; j++) {
                    if (showtimes[j]) {
                        let tempJson = {
                            "Location": location,
                            "Date": date,
                            "Time": showtimes[j] + "PM",
                            "Title": title.text()
                        }
                        console.log("Now adding : " + title.text() + " at " + showtimes[j] + ".")
                        tempJsonArray.push(tempJson)
                    }
                }
            })
        // remove dubs go here
        })
        // let cleanJsonArray = tempJsonArray.filter((tempJsonArray, index, self) =>
        //     index === self.findIndex((t) => (t.Time === tempJsonArray.Time && t.Title === tempJsonArray.Title)))
        // permanentJsonArray.push(cleanJsonArray);
        permanentJsonArray.push(tempJsonArray);
    }

}
async function scraperParadiseTheatre() {
    let location = "Paradise Theatre"
    let tempJsonArray = []
    let url = 'https://paradiseonbloor.com/calendar'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const elements = $('div.calendar-event');

    elements.each((i, node) => {
        // let event = $(node).find(".calendar-event").text();
        let date = $(node).find(".event-date-time").text();
        let title = $(node).find(".event-title").text();
        date = date.split('-')
        let time = date[1].trim()
        date = date[0].trim()
        let tempJson = {
            "Location": location,
            "Date": date,
            "Time": time,
            "Title": title
        }
        tempJsonArray.push(tempJson)

    })
    permanentJsonArray.push(tempJsonArray);
}
async function scraperHotDocs() {
    let location = "Hot Docs"
    let tempJsonArray = []
    let url = 'https://boxoffice.hotdocs.ca/websales/feed.ashx?guid=e23c888b-cc14-4afd-a8a3-f4b7d24cc9cf&format=json&showslist=true&kw=KenticoInclude&cphide=false&fulldescription=true&withmedia=true&v=5'
    const response = await axios.get(url);
    let json_array = response.data.ArrayOfShows;
    json_array.forEach((element) => {
        if (element.Folder === "Cinema Films") {
            element.CurrentShowings.forEach((showing) => {
                let tempDate = showing.StartDate;
                tempDate = tempDate.split('T')
                let time = tempDate[1];
                let date = tempDate[0];
                let tempJson = {
                    "Location": location,
                    "Date": date,
                    "Time": time,
                    "Title": element.Name
                }
                tempJsonArray.push(tempJson)

            })
        }


    }
    )
    permanentJsonArray.push(tempJsonArray);
}
function tiffJsonChecker() {
    let tempJsonArray = [];
    const fs = require('fs');
    let tiffData = fs.readFileSync('tiffjson.json')
    tiffData = JSON.parse(tiffData);
    console.log(tiffData[0]);
    for (let i = 0; i < tiffData.length; i++) {
        for (let j = 0; j < tiffData[i].scheduleItems.length; j++) {
            try {
                let dateAndTime = tiffData[i].scheduleItems[1].startTime;
                dateAndTime = dateAndTime.split(' ');
                let tem = {
                    "Location" : "TIFF LightBox",
                    "Date" : dateAndTime[0],
                    "Time" : dateAndTime[1],
                    "Title" : tiffData[i].title
                }
                tempJsonArray.push(tem);
            }
            catch (e) {
                console.log('i love movies :DDD: DD');
            }
        }
    }
    permanentJsonArray.push(tempJsonArray);
}
const doAllScrapes = async () => {
    // yea i know
    tiffJsonChecker();
    const result = await scraperTheRevue();
    const result2 = await scraperParadiseTheatre();
    const result3 = await scraperHotDocs();
    const result4 = await scraperImagineCarlton();
    const result5 = await scraperImagineFront();

    console.log("writing to txt file : ")
    let myJSON = JSON.stringify(permanentJsonArray);
    console.log(myJSON)
    writeJsonToFile();
}
console.log("Program Begins")
doAllScrapes();
console.log("Program Ends")