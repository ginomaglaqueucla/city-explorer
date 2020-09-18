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

function restaurants(cityLon, cityLat) {
    fetch("https://tripadvisor1.p.rapidapi.com/restaurants/list-by-latlng?limit=30&currency=USD&distance=2&lunit=km&lang=en_US&latitude=" + cityLat + "&longitude=" + cityLon, {
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

            attractions(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat);
        })
        .catch(err => {
            console.log(err);
        });
}

function attractions(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat) {
    fetch("https://tripadvisor1.p.rapidapi.com/attractions/list-by-latlng?lunit=km&currency=USD&limit=30&distance=5&lang=en_US&longitude=" + cityLon + "&latitude=" + cityLat, {
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

            createMap(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat, attractionOneLon, attractionOneLat, attractionTwoLon, attractionTwoLat);
        })
        .catch(err => {
            console.log(err);
        });
}

function createMap(cityLon, cityLat, restaurantOneLon, restaurantOneLat, restaurantTwoLon, restaurantTwoLat, attractionOneLon, attractionOneLat, attractionTwoLon, attractionTwoLat) {
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

city();