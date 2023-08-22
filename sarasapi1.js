// Welcome to Ben's Scraping Experience. The purpose of this script is to scrape a set number of websites, store the information as JSON, and append it to a JSON file.
// If the site cannot be reached, the JSON file will be unaffected. Every site requires a different scraper, and the scraper functions will convert the scraped data to JSON. The JSON writing function will write the JSON if the site could successfully be scraped. Error or no new data = no new JSON written.
// This app will not do anything else, and a public API will be written to handle the data on ben's server (fuggolol). Sara's website will access this API to get the data. the API server will run this script daily to get up to date movie info.
// The JSON format will contain the name of the event, the date, the showtime and the theatre location.
// Might make this run locally and then be uploaded to fuggolol by a human. Will see if gcloud instances can run it.
const axios = require('axios');


const cheerio = require('cheerio');

async function scraperTheRevue() {
    let location = "The Revue"
    let tempJsonArray = []
    url = 'https://revuecinema.ca/schedule/'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const elements = $('div.wpt_listing');

    elements.each((i, node) => {
        let date = $(node).find(".wpt_listing_group").text();
        let events = $(node).find('.wp_theatre_event');
        events.each((i, event) => {
            let time = $(event).find(".wp_theatre_event_starttime").text();
            let title = $(event).find(".wp_theatre_event_title").text();
            var tempJson = {
                "Location": location,
                "Date": date,
                "Time": time,
                "Title": title
            }
            tempJsonArray.push(tempJson)
        })
        // we are now going to parse the "event" variable and log the time/movie HREF, then we are eventually going to return it as JSON, then we move on to next.
    });
    // console.log(tempJsonArray)
}
async function scraperParadiseTheatre() {
    let location = "Paradise Theatre"
    let tempJsonArray = []
    url = 'https://paradiseonbloor.com/calendar'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const elements = $('div.calendar-event');

    elements.each((i, node) => {
        // let event = $(node).find(".calendar-event").text();
        let date = $(node).find(".event-date-time").text();
        let title = $(node).find(".event-title").text();
        date = date.split('-')
        time = date[1].trim()
        date = date[0].trim()
        var tempJson = {
            "Location": location,
            "Date": date,
            "Time": time,
            "Title": title
        }
        tempJsonArray.push(tempJson)

    })

    console.log(tempJsonArray);
}
async function scraperHotDocs() {
    let location = "Hot Docs"
    let tempJsonArray = []
    let today = new Date().toISOString().slice(0, 10)

    url = 'https://boxoffice.hotdocs.ca/websales/feed.ashx?guid=e23c888b-cc14-4afd-a8a3-f4b7d24cc9cf&format=json&showslist=true&kw=KenticoInclude&cphide=false&fulldescription=true&withmedia=true&v=5'
    const response = await axios.get(url);
    json_array = response.data.ArrayOfShows;
    json_array.forEach((element) => {
        if (element.Folder === "Cinema Films") {
            element.CurrentShowings.forEach((showing) => {
                tempDate = showing.StartDate;
                tempDate = tempDate.split('T')
                time = tempDate[1];
                date = tempDate[0];
                var tempJson = {
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
    console.log(tempJsonArray)



        // var tempJson = {
        //     "Location": location,
        //     "Date": date,
        //     "Time": time,
        //     "Title": title
        // }
        // tempJsonArray.push(tempJson)
    // console.log(tempJsonArray);
}

// scraperTheRevue();
// scraperParadiseTheatre();
scraperHotDocs();