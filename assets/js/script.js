var searchForm = document.querySelector("#search-form");
var cityUserInputEl = document.querySelector("#city-input");
var invalidCity = document.getElementById("invalid-city");
var columnTwoEl = document.querySelector("#column-two");
// ----- Global Variables -------------------------------------------------------------------------------------------------------------- //
// ----- Global Variables ----- //

// created global variables with object structure to organize each api call
var map;
var cityData = {
    userInput: {
        searchTerm: "",
        restFilter: "",
        attractFilter: ""
    },
    cityCoord: {
        lat: "",
        lon: ""
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

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- Grab User Input ----- //
// create function to obtain user input
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
    cityData.userInput.searchTerm = cityUserInputEl.value;

    // reset input field
    searchForm.reset();

    // perform error handling
    cityString = cityData.userInput.searchTerm
    cityString = " " + cityString.trim();
    cityString = cityString.replace(" ", "+");

    // grabs the input of the string after the , and checks if the length is not = 2 since the user has to enter in a two-letter state abbreviation. if it is not equal to 2, return an error.
    var check = cityString.substring(cityString.indexOf(", ") + 2);
    if (check.length !== 2) {
        invalidCity.className = 'invalid-search';
        console.log("error");
        return;
    }
    invalidCity.className = 'hide';
    city();
}

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Google geoCoding ----- //
// this function will fetch lat/lon of the user inputted (city, state)
// fetched data is assigned to global variable that will be used for another API
// in the future fetched data will be a part of the data structure
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
            console.log(cityData.cityCoord.lon, cityData.cityCoord.lat);

            restaurants();
        })
        .catch(function (error) {
            // Not a valid city
            // ----------------- we could have a text box show up above the search to let the user know they need to enter a valid city
            // invalidCity.className = 'invalid-search'; // should remove hide class to show error text p, but it's not working
            console.log("NOT A VALID CITY");
            console.log(error);
        })
}
// ------------------------------------------------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Trip Advisory  ----- //
// this function will fetch restaurant data using lat/lon
// fetched data will be assign to global vraiables to be used generate random itinerary
// in the future data will be assigned to data structure
// in the future use random number generator choose 3 random restaurants
// in the future function will take in dietary filter data parameter
// need to figure out algorithm for restOne/restTwo/dinner sorting
function restaurants() {
    fetch("https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng?limit=30&currency=USD&distance=2&lunit=km&lang=en_US&latitude="
        + cityData.cityCoord.lat + "&longitude=" + cityData.cityCoord.lon, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": "693350c65dmsh5ad1865d9215e1dp1a9131jsn53d32f4069ff"
        }
    })

        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            // stores restaurant data
            restData.restOne.lon = data.data[0].longitude;
            restData.restOne.lat = data.data[0].latitude;
            restData.restOne.restName = data.data[0].name;
            restData.restOne.url = data.data[0].web_url;
            restData.restTwo.lon = data.data[1].longitude;
            restData.restTwo.lat = data.data[1].latitude;
            restData.restTwo.restName = data.data[1].name;
            restData.restTwo.url = data.data[1].web_url;

            // hard coded for now
            var key = 'American';
            var arrFiltered = [];

            // loops through cuisine data to find filter
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i].name) {
                    for (var j = 0; j < data.data[i].cuisine.length; j++) {
                        if (data.data[i].cuisine[j].name === key) {
                            arrFiltered.push(data.data[i]);
                        }
                    }
                }
            }

            console.log(arrFiltered);
            attractions();
        })
        .catch(err => {
            console.log(err);
        });
}
// ------------------------------------------------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Trip Advisory  ----- //
// this function will fetch attraction data using lat/lon
// fetched data will be assign to global variables to be used generate random itinerary
// in the future data will be assigned to data structure
// in the future perhaps combine restaurants and attractions functions to keep code DRY
// in the future function will take in attraction filter (if possible)
function attractions() {
    fetch("https://tripadvisor1.p.rapidapi.com/attractions/list-by-latlng?lunit=km&currency=USD&limit=30&distance=5&lang=en_US&longitude="
        + cityData.cityCoord.lon + "&latitude=" + cityData.cityCoord.lat, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "tripadvisor1.p.rapidapi.com",
            "x-rapidapi-key": "693350c65dmsh5ad1865d9215e1dp1a9131jsn53d32f4069ff"
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            // stores attraction data
            attractData.eventOne.lon = data.data[0].longitude;
            attractData.eventOne.lat = data.data[0].latitude;
            attractData.eventOne.eventName = data.data[0].name;
            attractData.eventOne.url = data.data[0].web_url;
            attractData.eventTwo.lon = data.data[1].longitude;
            attractData.eventTwo.lat = data.data[1].latitude;
            attractData.eventTwo.eventName = data.data[1].name;
            attractData.eventTwo.url = data.data[1].web_url;

            var key = 'Nature & Parks';
            var arrFiltered2 = [];

            // loops through filtered subcategory list
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i]) {
                    for (var j = 0; j < data.data[i].subcategory.length; j++) {
                        if (data.data[i].subcategory[j].name === key) {
                            arrFiltered2.push(data.data[i]);
                        }
                    }
                }
            }

            console.log(arrFiltered2);
            createMap();
            displayItinerary();
        })
        .catch(err => {
            console.log(err);
        });
}
// ------------------------------------------------------------------------------------------------------------------------------------- //

// ----- create Google Map  ----- //
// this function pin points on google map that given restuarant & attraction lat/lon
// dependent on completion of geocCoding & trip advisory data fetch
// in the future will take in data structure as parameter
// assign map data to data structure 
function createMap() {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCv_iF_YniNOH9mI6WvJc66w5bo3_PXXCg&callback=initMap';
    script.defer = true;

    // initates function to create google map
    window.initMap = function () {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

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

    // Append the 'script' element to 'head'
    document.head.appendChild(script);

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
                destination: attractData.eventOne.lat + ", " + attractData.eventOne.lon,
                waypoints: [{ location: restData.restTwo.lat + ", " + restData.restTwo.lon }, { location: attractData.eventTwo.lat + ", " + attractData.eventTwo.lon }],
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

}
// ------------------------------------------------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------------------------------------------------- //
// ------ generate Itinerary  ------ //
// this function will use recently fetched data that is contained in data structure and create itinerary
// itinerary includes restOne -> attraction -> restTwo -> attraction -> dinner
// itinerary will be save to local storage "search history"
// call display Itinerary function
// ------------------------------------------------------------------------------------------------------------------------------------- //

// ------------------------------------------------------------------------------------------------------------------------------------- //
// ------ load page  ------ //
// this function will load the static homepage
// this function will get local storage (favorites & search history) and display onto page
// ------------------------------------------------------------------------------------------------------------------------------------- //


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
// ------------------------------------------------------------------------------------------------------------------------------------- //
function displayItinerary() {

    var placeArray = [restData.restOne.restName, attractData.eventOne.eventName, restData.restTwo.restName, attractData.eventTwo.eventName];
    var urlArray = [restData.restOne.url, attractData.eventOne.url, restData.restTwo.url, attractData.eventTwo.url];
    var wayPointArray = ["A", "B", "C", "D"];

    // clear old data
    columnTwoEl.textContent = "";

    // create Foundation card element
    var cardEl = document.createElement("div");
    cardEl.classList = "card itinerary";
    cardEl.setAttribute("id", "itinerary");

    // create element for card title (city name)
    var titleEl = document.createElement("div");
    titleEl.textContent = "Itinerary for " + cityData.userInput.searchTerm;
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
        placeEl.setAttribute("href", urlArray[i]);
        placeEl.setAttribute("target", "_blank");
        placeEl.textContent = wayPointArray[i] +": " + placeArray[i];
        listEl.appendChild(placeEl);

        cardEl.appendChild(listEl);
        columnTwoEl.appendChild(cardEl);
    }

    // saveHistory(city, time, place);
}

function saveHistory(saveCity, saveTime, savePlace) {
    console.log(saveCity, saveTime, savePlace);
    var save = {city: saveCity, time: saveTime, place: savePlace};
    console.log(save);
    localStorage.setItem("city-explorer-save", JSON.stringify(save));
}


// globally call load page function 

// event listener for submit click (user input)
// event listener for favorites click
// event listener for search history click
searchForm.addEventListener("submit", getUserInput)