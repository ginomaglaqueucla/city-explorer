var userFormEl = document.querySelector("#zip-form");
var zipCodeInputEl = document.getElementById("zip-code");
var learnMoreContainer = document.getElementById("learn-more-container");
var localNewsContainer = document.getElementById("local-news-container");
var map;
var marker;
var placeName;
var lat;
var lon;
var articleUrl;
var newsUrl;

var formSubmitHandler = function (event) {
    event.preventDefault();

    var zip = zipCodeInputEl.value.trim();
    zipCode(zip);
}

function zipCode(zip) {
    var apiUrl = "https://api.zippopotam.us/us/" + zip;

    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            console.log(response);
            console.log(response.places[0]['place name']);

            placeName = response.places[0]['place name'];
            lat = response.places[0].latitude;
            lat = parseFloat(lat);
            lon = response.places[0].longitude;
            lon = parseFloat(lon);

            console.log(lat, lon);

            createMap(placeName, lat, lon)
        })
}

function createMap(placeName, placeLat, placeLon) {
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCv_iF_YniNOH9mI6WvJc66w5bo3_PXXCg&callback=initMap';
    script.defer = true;

    // Attach your callback function to the `window` object

    window.initMap = function () {
        // JS API is loaded and available

        // location variable to store lat/lng
        var location = { lat: placeLat, lng: placeLon };

        // create map
        map = new google.maps.Map(document.getElementById("map"), {
            center: location,
            zoom: 12
        });

        // marker
        marker = new google.maps.Marker({ position: location, map: map, label: placeName });

    };

    // Append the 'script' element to 'head'
    document.head.appendChild(script);

    wiki(placeName);
}

function wiki(placeName) {
    var url = "https://en.wikipedia.org/w/api.php";

    var params = {
        action: "query",
        list: "search",
        srsearch: placeName,
        format: "json",
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });
    console.log(url);

    fetch(url)
        .then(function (response) { return response.json(); })
        .then(function (response) {
            console.log(response.query.search[0]);
            var pageId = response.query.search[0].pageid;
            console.log("https://en.wikipedia.org/wiki?curid=" + pageId);
            articleUrl = "https://en.wikipedia.org/wiki?curid=" + pageId;
        })
        .catch(function (error) { console.log(error); });

    // clears out old buttons
    learnMoreContainer.innerHTML = "";

    var article = document.createElement("BUTTON");
    article.innerHTML = "Learn More";
    article.classList = "learn-more-btn";
    article.onclick = function () {
        window.open(articleUrl);
    }
    learnMoreContainer.appendChild(article);

    news(placeName);
}

function news(placeName) {
    var apiUrl = 'https://gnews.io/api/v3/search?q=' + placeName + '&token=150db8737914007f6a69392f228ed36e';

    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            newsUrl = data.articles[0].url;
        });

    var news = document.createElement("button");
    news.innerHTML = "Local News";
    news.classList = "local-news-btn";
    news.onclick = function () {
        window.open(newsUrl);
    }
    localNewsContainer.appendChild(news);
}

userFormEl.addEventListener("submit", formSubmitHandler);