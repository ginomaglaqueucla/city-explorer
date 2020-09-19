// ----- Event Listener Call-outs -------------------------------
var columnTwoEl = document.querySelector("#column-2");

// ----- Global Variables -------------------------------------------------------------------------------------------------------------- //
// ----- Global Variables ----- //
// create a data structure for variables to clean up code
var cityLon;
var cityLat;
var restaurantOneLon;
var restaurantOneLat;
var restaurantTwoLon;
var restaurantTwoLat;
var attractionOneLon;
var attractionOneLat;
var attractionTwoLon;
var attractionTwoLat;
var map;
// ------------------------------------------------------------------------------------------------------------------------------------- //

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
// ------------------------------------------------------------------------------------------------------------------------------------- //

// var input = document.getElementById("input").value;



// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Google geoCoding ----- //
// this function will fetch lat/lon of the user inputted (city, state)
// fetched data is assigned to global variable that will be used for another API
// in the future fetched data will be a part of the data structure
// call trip advisory api functions
function city() {
    var cityInput = "Beverly Hills, CA";
    cityInput = " " + cityInput.trim();
    cityInput = cityInput.replace(" ", "+");

    console.log(cityInput.indexOf(", "));

    var check = cityInput.substring(cityInput.indexOf(", ") + 2);
    if (check.length !== 2) {
        console.log("error");
    }

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${cityInput}&key=AIzaSyCv_iF_YniNOH9mI6WvJc66w5bo3_PXXCg`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            cityLon = data.results[0].geometry.location.lng;
            cityLon = parseFloat(cityLon);
            cityLat = data.results[0].geometry.location.lat;
            cityLat = parseFloat(cityLat);
            console.log(cityLon, cityLat);

            restaurants(cityLon, cityLat);
        })
        .catch(function (error) {
            console.log(error);
        })
}
// ------------------------------------------------------------------------------------------------------------------------------------- //


// ------------------------------------------------------------------------------------------------------------------------------------- //
// ----- fetch Trip Advisory  ----- //
// this function will fetch restaurant data using lat/lon
// fetched data will be assign to global variables to be used generate random itinerary
// in the future data will be assigned to data structure
// in the future use random number generator choose 3 random restaurants
// in the future function will take in dietary filter data parameter
// need to figure out algorithm for breakfast/lunch/dinner sorting
function restaurants(cityLon, cityLat) {
    fetch("https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng?limit=30&currency=USD&distance=2&lunit=km&lang=en_US&latitude="
        + cityLat + "&longitude=" + cityLon, {
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
            // console.log(data.data[0]);
            // console.log(data.data[1])
            restaurantOneLon = data.data[0].longitude;
            restaurantOneLat = data.data[0].latitude;
            restaurantTwoLon = data.data[1].longitude;
            restaurantTwoLat = data.data[1].latitude;

            var key = 'American';
            var arrFiltered = [];

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

            // createMap(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat)
            attractions(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat);
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
function attractions(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat) {
    fetch("https://tripadvisor1.p.rapidapi.com/attractions/list-by-latlng?lunit=km&currency=USD&limit=30&distance=5&lang=en_US&longitude="
        + cityLon + "&latitude=" + cityLat, {
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
            attractionOneLon = data.data[0].longitude;
            attractionOneLat = data.data[0].latitude;
            attractionTwoLon = data.data[1].longitude;
            attractionTwoLat = data.data[1].latitude;

            var key = 'Nature & Parks';
            var arrFiltered2 = [];

            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i]) {
                    for (var j = 0; j < data.data[i].subcategory.length; j++) {
                        // for (var k = 0; k < key.length; k++) {
                        //  if(data.data[i].subcategory[j].name === key[k];
                        //  arrFiltered2.push(data.data[i]);
                        // }
                        if (data.data[i].subcategory[j].name === key) {
                            arrFiltered2.push(data.data[i]);
                        }
                    }
                }
            }

            console.log(arrFiltered2);

            createMap(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat,
                attractionOneLon, attractionOneLat, attractionTwoLon, attractionTwoLat);
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
function createMap(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat,
    attractionOneLon, attractionOneLat, attractionTwoLon, attractionTwoLat) {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCv_iF_YniNOH9mI6WvJc66w5bo3_PXXCg&callback=initMap';
    script.defer = true;

    // Attach your callback function to the `window` object

    window.initMap = function () {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        // location variable to store lat/lng
        var location = { lat: cityLat, lng: cityLon };

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

    function calculateAndDisplayRoute(directionsService, directionsRenderer) {
        restaurantOneLon = restaurantOneLon.toString();
        restaurantOneLat = restaurantOneLat.toString();
        restaurantTwoLon = restaurantTwoLon.toString();
        restaurantTwoLat = restaurantTwoLat.toString();
        attractionOneLon = attractionOneLon.toString();
        attractionOneLat = attractionOneLat.toString();
        attractionTwoLon = attractionTwoLon.toString();
        attractionTwoLat = attractionTwoLat.toString();

        directionsService.route(
            {
                origin: restaurantOneLat + ", " + restaurantOneLon,
                destination: attractionOneLat + ", " + attractionOneLon,
                waypoints: [{ location: restaurantTwoLat + ", " + restaurantTwoLon }, { location: attractionTwoLat + ", " + attractionTwoLon }],
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
// itinerary includes breakfast -> attraction -> lunch -> attraction -> dinner
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

function displayItinerary(city, time, place) {

    // clear old data
    columnTwoEl.textContent = "";

    // create Foundation card element
    var cardEl = document.createElement("div");
    cardEl.classList = "card itinerary";
    cardEl.setAttribute("id", "itinerary");

    // create element for card title
    var titleEl = document.createElement("div");
    titleEl.textContent = "Itinerary for " + city;
    titleEl.classList = "card-divider";
    titleEl.setAttribute("id", "itinerary-title");
    cardEl.appendChild(titleEl);

    // create element for itinerary section
    var listEl = document.createElement("div");
    listEl.classList = "card-section";
    listEl.setAttribute("id", "itinerary-list");

    // for loop ? create element for each location
    // need time, place name, place website
    var placeEl = document.createElement("a");
    placeEl.classList = "button event";
    placeEl.setAttribute("href", "https://www.hollywoodbowl.com/");
    placeEl.textContent = time + " " + place;
    listEl.appendChild(placeEl);

    cardEl.appendChild(listEl);
    columnTwoEl.appendChild(cardEl);

    saveHistory(city, time, place);
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

city();