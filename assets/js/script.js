// ----- Global Variables -------------------------------------------------------------------------------------------------------------- //
var searchForm = document.querySelector("#search-form");
var cityUserInputEl = document.querySelector("#city-input");
var invalidCity = document.getElementById("invalid-city");
var invalidFilter = document.getElementById("invalid-filter");
var columnTwoEl = document.querySelector("#column-two");
var foodFilterEl = document.getElementById("food-filter");
var eventFilterEl = document.getElementById("event-filter");
var clearCitiesButton = document.getElementById("clear-cities");
var mapScriptContainer = document.getElementById('map-script-container');
var historyHeaderEl = document.querySelector("#history-header");
var historyTitleEl = document.querySelector("#history-title");
var searchHistoryButtonsEl = document.querySelector("#search-history-buttons");

// created global object structure
var map;
var cityData = {
    userInput: {
        searchTerm: "",
        restFilter: "",
        attractFilter: ""
    },
    cityCoord: {
        lat: 0.0,
        lon: 0.0
    }
};
var restData = {
    restOne: {
        restName: "",
        lat: "",
        lon: "",
        url: ""
    },
    restTwo: {
        restName: "",
        lat: "",
        lon: "",
        url: ""
    }
};
var attractData = {
    eventOne: {
        eventName: "",
        lat: "",
        lon: "",
        url: ""
    },
    eventTwo: {
        eventName: "",
        lat: "",
        lon: "",
        url: ""
    }
};
var cityString = "";

// generates a random number to randomly select the password characters based on the appropriate array.
function randomNumber(min, max) {
    var value = Math.floor(Math.random() * (max - min + 1) + min);

    return value;
}

// ----- Grab User Input ----- //
// grab city, state input
// grab dietary filter checkbox input
// grab event filter input
// assign to data structure
// call function that converts city, state data to lat/lon
// ensure function has error handling
// handles the event listener for submit click
function getUserInput(event) {
    event.preventDefault();

    // grab user input
    cityData.userInput.searchTerm = cityUserInputEl.value.toLowerCase();
    cityData.userInput.restFilter = foodFilterEl.value;
    cityData.userInput.attractFilter = eventFilterEl.value;

    // reset input field
    searchForm.reset();

    // perform error handling
    cityString = cityData.userInput.searchTerm;
    cityString = " " + cityString.trim();
    cityString = cityString.replace(" ", "+");

    // grabs the input of the string after the , and checks if the length is not = 2 since the user has to enter in a two-letter state abbreviation. if it is not equal to 2, return an error.
    var check = cityString.substring(cityString.indexOf(", ") + 2);
    if (check.length !== 2) {
        invalidCity.className = 'invalid-search';
        console.log("error");
        return;
    }

    // hides the error if it's a valid city
    invalidCity.className = 'hide';
    city();
}

// ----- fetch Google geoCoding ----- //
// this function fetches lat/lon of the user inputted (city, state)
// fetched data is assigned to global variable that will be used for another API
// call trip advisory api functions
function city() {
    // google geocode api to search for user input
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityString}&key=AIzaSyCv_iF_YniNOH9mI6WvJc66w5bo3_PXXCg`)
        .then(function (response) {
            return response.json();
        })
        //  assigns city coords to cityData variable
        .then(function (data) {
            cityData.cityCoord.lon = data.results[0].geometry.location.lng;
            cityData.cityCoord.lon = parseFloat(cityData.cityCoord.lon);
            cityData.cityCoord.lat = data.results[0].geometry.location.lat;
            cityData.cityCoord.lat = parseFloat(cityData.cityCoord.lat);

            restaurants();
        })
        // error for invalid city
        .catch(function (error) {
            console.log("NOT A VALID CITY");
            console.log(error);
        })
}

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Trip Advisory  ----- //
// this function fetches restaurant data using lat/lon
// fetched data is assign to global vraiables to be used generate random itinerary
// takes in dietary filter data parameter
function restaurants() {
    fetch("https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng?limit=30&currency=USD&distance=2&lunit=km&lang=en_US&latitude="
        + cityData.cityCoord.lat + "&longitude=" + cityData.cityCoord.lon, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": "df019328ffmsha32c19b7bd011fcp1d0dcdjsn4478570b6189"
        }
    })

        .then(response => {
            return response.json();
        })
        .then(data => {

            // Food Filter
            var key = cityData.userInput.restFilter;
            switch (key) {
                case "Italian":
                    key = ['Italian', 'Pizza'];
                    break;
                case "Asian":
                    key = ['Asian', 'Japanese', 'Chinese', 'Sushi'];
                    break;
            }

            // filtered array
            var arrFiltered = [];

            // if there is a filter then run the for loop below
            if (key !== " ") {
                // loops through cuisine data to find filter
                for (var k = 0; k < key.length; k++) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].name) {
                            for (var j = 0; j < data.data[i].cuisine.length; j++) {
                                if (data.data[i].cuisine[j].name === key[k]) {
                                    arrFiltered.push(data.data[i]);
                                }
                            }
                        }
                    }
                }

                // run duplicate filter twice because we're splicing the array within the loop
                for (let i = 0; i < arrFiltered.length; i++) {
                    for (let j = 1 + i; j < arrFiltered.length; j++) {
                        if (arrFiltered[i].latitude === arrFiltered[j].latitude && arrFiltered[i].longitude === arrFiltered[j].longitude) {
                            arrFiltered.splice(j, 1);
                        }
                    }
                }

                for (let i = 0; i < arrFiltered.length; i++) {
                    for (let j = 1 + i; j < arrFiltered.length; j++) {
                        if (arrFiltered[i].latitude === arrFiltered[j].latitude && arrFiltered[i].longitude === arrFiltered[j].longitude) {
                            arrFiltered.splice(j, 1);
                        }
                    }
                }

                // if there's one or less filter options do the search on the whole data array and return error to let user know
                invalidFilter.className = 'hide';

                if (arrFiltered.length <= 1) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].name) {
                            arrFiltered.push(data.data[i]);
                        }
                    }
                    invalidFilter.className = 'invalid-filter-input';
                }

                // index variables for restaurant data
                var restOneIdx = 0;
                var restTwoIdx = 0;

                // as long as the two random indexs are the same keep calling the random number function to get two different random numbers
                while (restOneIdx === restTwoIdx) {
                    restOneIdx = randomNumber(0, arrFiltered.length - 1);
                    restTwoIdx = randomNumber(0, arrFiltered.length - 1);
                }

                // updates restaurant information
                restData.restOne.lon = arrFiltered[restOneIdx].longitude;
                restData.restOne.lat = arrFiltered[restOneIdx].latitude;
                restData.restOne.restName = arrFiltered[restOneIdx].name;
                restData.restOne.url = arrFiltered[restOneIdx].web_url;
                restData.restTwo.lon = arrFiltered[restTwoIdx].longitude;
                restData.restTwo.lat = arrFiltered[restTwoIdx].latitude;
                restData.restTwo.restName = arrFiltered[restTwoIdx].name;
                restData.restTwo.url = arrFiltered[restTwoIdx].web_url;
            }
            // else search all options 
            else {
                // filters out advertisements
                for (var i = 0; i < data.data.length; i++) {
                    if (data.data[i].name) {
                        arrFiltered.push(data.data[i]);
                    }
                }

                // index variables for restaurant data
                var restOneIdx = 0;
                var restTwoIdx = 0;

                if (arrFiltered.length > 1) {
                    // as long as the two random indexs are the same keep calling the random number function to get two different random numbers
                    while (restOneIdx === restTwoIdx) {
                        restOneIdx = randomNumber(0, arrFiltered.length - 1);
                        restTwoIdx = randomNumber(0, arrFiltered.length - 1);
                    }
                }

                // updates restaurant information
                restData.restOne.lon = arrFiltered[restOneIdx].longitude;
                restData.restOne.lat = arrFiltered[restOneIdx].latitude;
                restData.restOne.restName = arrFiltered[restOneIdx].name;
                restData.restOne.url = arrFiltered[restOneIdx].web_url;
                restData.restTwo.lon = arrFiltered[restTwoIdx].longitude;
                restData.restTwo.lat = arrFiltered[restTwoIdx].latitude;
                restData.restTwo.restName = arrFiltered[restTwoIdx].name;
                restData.restTwo.url = arrFiltered[restTwoIdx].web_url;
            }

            // go to attraction tripadvisor api
            attractions();
        })
        .catch(err => {
            console.log(err);
        });
}

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Trip Advisory  ----- //
// this function fetches attraction data using lat/lon
// fetched data is assigned to global variables to be used generate random itinerary
// takes in attraction filter
function attractions() {
    fetch("https://tripadvisor1.p.rapidapi.com/attractions/list-by-latlng?lunit=km&currency=USD&limit=30&distance=5&lang=en_US&longitude="
        + cityData.cityCoord.lon + "&latitude=" + cityData.cityCoord.lat, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": "df019328ffmsha32c19b7bd011fcp1d0dcdjsn4478570b6189"
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {

            // event filter
            var key = cityData.userInput.attractFilter;
            var arrFiltered2 = [];

            // if there is a filter then run the for loop below
            if (key !== " ") {
                // loops through subcategory data to find filter
                for (var i = 0; i < data.data.length; i++) {
                    if (data.data[i].subcategory) {
                        for (var j = 0; j < data.data[i].subcategory.length; j++) {
                            if (data.data[i].subcategory[j].name === key) {
                                arrFiltered2.push(data.data[i]);
                            }
                        }
                    }
                }

                // run duplicate filter twice because we're splicing the array within the loop
                for (let i = 0; i < arrFiltered2.length; i++) {
                    for (let j = 1 + i; j < arrFiltered2.length; j++) {
                        if (arrFiltered2[i].latitude === arrFiltered2[j].latitude && arrFiltered2[i].longitude === arrFiltered2[j].longitude) {
                            arrFiltered2.splice(j, 1);
                        }
                    }
                }

                for (let i = 0; i < arrFiltered2.length; i++) {
                    for (let j = 1 + i; j < arrFiltered2.length; j++) {
                        if (arrFiltered2[i].latitude === arrFiltered2[j].latitude && arrFiltered2[i].longitude === arrFiltered2[j].longitude) {
                            arrFiltered2.splice(j, 1);
                        }
                    }
                }

                // if there's one or less filter options do the search on the whole data array and return error to let user know
                invalidFilter.className = 'hide';

                if (arrFiltered2 <= 1) {
                    for (var i = 0; i < data.data.length; i++) {
                        arrFiltered2.push(data.data[i]);
                    }
                    invalidFilter.className = 'invalid-filter-input';
                }

                // event indexes for random numbers
                var eventOneIdx = 0;
                var eventTwoIdx = 0;

                // as long as the two random indexs are the same keep calling the random number function to get two different random numbers
                while (eventOneIdx === eventTwoIdx) {
                    eventOneIdx = randomNumber(0, arrFiltered2.length - 1);
                    eventTwoIdx = randomNumber(0, arrFiltered2.length - 1);
                }

                // updates event information
                attractData.eventOne.lon = arrFiltered2[eventOneIdx].longitude;
                attractData.eventOne.lat = arrFiltered2[eventOneIdx].latitude;
                attractData.eventOne.eventName = arrFiltered2[eventOneIdx].name;
                attractData.eventOne.url = arrFiltered2[eventOneIdx].web_url;
                attractData.eventTwo.lon = arrFiltered2[eventTwoIdx].longitude;
                attractData.eventTwo.lat = arrFiltered2[eventTwoIdx].latitude;
                attractData.eventTwo.eventName = arrFiltered2[eventTwoIdx].name;
                attractData.eventTwo.url = arrFiltered2[eventTwoIdx].web_url;
            }
            // else search all options 
            else {
                // pushes to arrFiltered2
                for (var i = 0; i < data.data.length; i++) {
                    arrFiltered2.push(data.data[i]);
                }

                // checks if there's more then one in the array then filter
                var eventOneIdx = 0;
                var eventTwoIdx = 0;

                if (arrFiltered2.length > 1) {
                    // as long as the two random indexs are the same keep calling the random number function to get two different random numbers
                    while (eventOneIdx === eventTwoIdx) {
                        eventOneIdx = randomNumber(0, arrFiltered2.length);
                        eventTwoIdx = randomNumber(0, arrFiltered2.length);
                    }
                }

                // stores attraction data
                attractData.eventOne.lon = arrFiltered2[eventOneIdx].longitude;
                attractData.eventOne.lat = arrFiltered2[eventOneIdx].latitude;
                attractData.eventOne.eventName = arrFiltered2[eventOneIdx].name;
                attractData.eventOne.url = arrFiltered2[eventOneIdx].web_url;
                attractData.eventTwo.lon = arrFiltered2[eventTwoIdx].longitude;
                attractData.eventTwo.lat = arrFiltered2[eventTwoIdx].latitude;
                attractData.eventTwo.eventName = arrFiltered2[eventTwoIdx].name;
                attractData.eventTwo.url = arrFiltered2[eventTwoIdx].web_url;
            }

            // generates the intinerary
            generateItinerary();
        })
        .catch(err => {
            console.log(err);
        });
}

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ------ generate Itinerary  ------ //
// this function pulls recently fetched data and contains it into an object
// the object includes the city name, waypoints, fetched restaurants/event locations, and respective urls
// calls display Itinerary function
function generateItinerary() {
    var displayCity = cityData.userInput.searchTerm.toUpperCase();
    var cityLatCoord = cityData.cityCoord.lat;
    var cityLonCoord = cityData.cityCoord.lon;
    var wayPointArray = ["A", "B", "C", "D"];
    var placeArray = [restData.restOne.restName, attractData.eventOne.eventName, restData.restTwo.restName, attractData.eventTwo.eventName];
    var urlArray = [restData.restOne.url, attractData.eventOne.url, restData.restTwo.url, attractData.eventTwo.url];
    var latArray = [restData.restOne.lat, attractData.eventOne.lat, restData.restTwo.lat, attractData.eventTwo.lat];
    var lonArray = [restData.restOne.lon, attractData.eventOne.lon, restData.restTwo.lon, attractData.eventTwo.lon];

    var itineraryObject = { "city": displayCity, "cityLat": cityLatCoord, "cityLong": cityLonCoord, "waypoint": wayPointArray, "place": placeArray, "url": urlArray, "lat": latArray, "long": lonArray };

    saveHistory(itineraryObject);
    displayItinerary(itineraryObject);
}

// ------ save history  ------ //
// this function saves data for recently fetched itineraries
// this function saves to local storage
function saveHistory(saveObject) {
    // pulls in previously saved data
    var searchHistory = JSON.parse(localStorage.getItem("search-history"));

    // displays search history header and button -------------------------------------
    historyTitleEl.textContent = "Search History";
    clearCitiesButton.innerHTML = "<i class='fas fa-trash'></i>"
    historyTitleEl.appendChild(clearCitiesButton);

    // creates button ----------------------------------------------------------------
    var buttonEl = document.createElement("button");
    buttonEl.classList = "button expanded";
    buttonEl.textContent = saveObject.city;
    // determines next id number to assign and assigns it
    var nextId = searchHistory.length;
    buttonEl.setAttribute("id", nextId);
    searchHistoryButtonsEl.appendChild(buttonEl);

    searchHistory.push(saveObject);
    localStorage.setItem("search-history", JSON.stringify(searchHistory));
}

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ------ display Itinerary  ------ //
// this function will DOM display recently generated or favorite/searched event click onto page
// DOM create button for user to re-generate a new itinerary if desired
// DOM create button for user to save
//
// (event listener) if save call save to local storage "favorites or bookmarks" unless function was called by user clicking from favorites
// (event listener) if user decides to regenerate, call city function
// create algorithm logic to identify if this function was called from a favorite click, search click, or submit click
// in the future error handle to exclude already generated restaurants/attractions ?
function displayItinerary(displayObject) {

    // clear old data
    columnTwoEl.textContent = "";

    // create Foundation card element
    var cardEl = document.createElement("div");
    cardEl.classList = "card itinerary";
    cardEl.setAttribute("id", "itinerary");

    // create element for card title (city name)
    var titleEl = document.createElement("div");
    titleEl.textContent = "Itinerary for " + displayObject.city;
    titleEl.classList = "card-divider";
    titleEl.setAttribute("id", "itinerary-title");
    cardEl.appendChild(titleEl);

    // create element for itinerary section
    var listEl = document.createElement("div");
    listEl.classList = "card-section";
    listEl.setAttribute("id", "itinerary-list");

    for (var i = 0; i < 4; i++) {
        // create element for each place
        var placeEl = document.createElement("a");
        placeEl.classList = "button event";
        placeEl.setAttribute("href", displayObject.url[i]);
        placeEl.setAttribute("target", "_blank");
        placeEl.textContent = displayObject.waypoint[i] + ": " + displayObject.place[i];

        listEl.appendChild(placeEl);

        cardEl.appendChild(listEl);
        columnTwoEl.appendChild(cardEl);
    }

    // updates global variables from local storage
    restData.restOne.lon = displayObject.long[0];
    restData.restOne.lat = displayObject.lat[0];
    restData.restTwo.lon = displayObject.long[2];
    restData.restTwo.lat = displayObject.lat[2];
    attractData.eventOne.lon = displayObject.long[1];
    attractData.eventOne.lat = displayObject.lat[1];
    attractData.eventTwo.lon = displayObject.long[3];
    attractData.eventTwo.lat = displayObject.lat[3];
    cityData.cityCoord.lat = displayObject.cityLat;
    cityData.cityCoord.lon = displayObject.cityLong;

    initMap();
}

// ----- create Google Map  ----- //
// this function pin points on google map that given restuarant & attraction lat/lon
// dependent on completion of geocCoding & trip advisory data fetch
// in the future will take in data structure as parameter
// assign map data to data structure 
window.initMap = function () {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    if (!cityData.cityCoord.lat || !cityData.cityCoord.lon) {
        return;
    }

    // location variable to store lat/lng
    var location = { lat: cityData.cityCoord.lat, lng: cityData.cityCoord.lon };

    // create map
    map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 12
    });

    directionsRenderer.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsRenderer);
};

// calculates and displays route on google maps
function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    restData.restOne.lon = restData.restOne.lon.toString();
    restData.restOne.lat = restData.restOne.lat.toString();
    restData.restTwo.lon = restData.restTwo.lon.toString();
    restData.restTwo.lat = restData.restTwo.lat.toString();

    attractData.eventOne.lon = attractData.eventOne.lon.toString();
    attractData.eventOne.lat = attractData.eventOne.lat.toString();
    attractData.eventTwo.lon = attractData.eventTwo.lon.toString();
    attractData.eventTwo.lat = attractData.eventTwo.lat.toString();

    directionsService.route(
        {
            origin: restData.restOne.lat + ", " + restData.restOne.lon,
            waypoints: [{ location: attractData.eventOne.lat + ", " + attractData.eventOne.lon, stopover: true }, { location: restData.restTwo.lat + ", " + restData.restTwo.lon, stopover: true }],
            destination: attractData.eventTwo.lat + ", " + attractData.eventTwo.lon,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}

// ------ load from search history button  ------ //
// this function loads data from previously fetched itineraries
// this function gets from local storage and display onto page
// ------------------------------------------------------------------------------------------------------------------------------------- //
function loadFromButton(event) {
    // pulls in previously saved data
    var searchHistory = JSON.parse(localStorage.getItem("search-history"));
    var buttonIndex = event.target.id;
    var currentLoad = searchHistory[buttonIndex];

    displayItinerary(currentLoad);
}

// ------ load page  ------ //
// this function will load the static homepage
// this function will get local storage (favorites & search history) and display onto page
// ------------------------------------------------------------------------------------------------------------------------------------- //
function loadPage() {

    var getHistory = JSON.parse(localStorage.getItem("search-history"));

    // if no prior search data exists in local storage
    if (!getHistory) {
        var getHistory = [];
        localStorage.setItem("search-history", JSON.stringify(getHistory));
        console.log("there is no history");
    }
    else {
        for (var i = 0; i < getHistory.length; i++) {
            // create buttons to display search history
            var addButtonEl = document.createElement("button");
            addButtonEl.classList = "button expanded";
            addButtonEl.textContent = getHistory[i].city;
            addButtonEl.setAttribute("id", i);
            searchHistoryButtonsEl.appendChild(addButtonEl);
        }
    }
}

// clear local storage
var clearCitiesHandler = function () {
    localStorage.removeItem("search-history");
    location.reload();
}

// globally call load page function 
loadPage();

// event listener for submit click (user input)
// event listener for favorites click
// event listener for search history click
searchForm.addEventListener("submit", getUserInput)
searchHistoryButtonsEl.addEventListener("click", loadFromButton);
clearCitiesButton.addEventListener("click", clearCitiesHandler)