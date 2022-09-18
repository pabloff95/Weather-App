window.addEventListener("load", function(){

    document.getElementById("search").addEventListener("click", async function(){
        let city = document.getElementById("location").value;
        // Get Data from user introduced town
        let data = await getWeatherData(city);
            // Get data from kelvin to celsius system and round to 2 decimals
        const TEMPERATURE = parseFloat((data['main'].temp) -  273.15).toFixed(2);        
        const MAX_TEMPERATURE = parseFloat((data['main'].temp_max) -  273.15).toFixed(2);
        const MIN_TEMPERATURE = parseFloat((data['main'].temp_min) -  273.15).toFixed(2);
            // Display data in the screen
        document.getElementById("weahter-results").innerHTML = displayData(city, TEMPERATURE, MAX_TEMPERATURE, MIN_TEMPERATURE);
        // Reset form
        document.getElementById("location").value = "";
    })    

});

function displayData(city, temperature, max, min){
    return `
            <h2>${city.toUpperCase()}</h2>
            <p><span><b>Min temperature: </b><span>${min}ºC</p>
            <p><span><b>Average temperature: </b><span>${temperature}ºC</p>
            <p><span><b>Max temperature: </b><span>${max}ºC</p>
    `;
}

async function getWeatherData(city){
    const API_KEY = "14150f4c93ebeebcf4a4101c2d5b9069"; // OpenWeather API user key
    let limit = "1"; // Number of results returned per query (ex. multiple cities with similar names)

    // Do query 1: returns longitude and latitude of desired city
    let urlCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=" + limit + "&appid=" + API_KEY;
    const LOCATION = await retrieveCoordinates(urlCoordinates);

    // Do query 2: returns weather data of given city (requires query 1 to get latitude and longitude)
    let urlWeather = "https://api.openweathermap.org/data/2.5/weather?lat=" + LOCATION['latitude'] + "&lon=" + LOCATION['longitude'] + "&appid=" + API_KEY;       
    let cityWeather = await retrieveWeatherData(urlWeather);

    return cityWeather;
}

// Query to API 1: Use API to retrieve coordinates of a town (latitude and longitude)
async function retrieveCoordinates(url){
    let townCoordinates;
    // Fetch Data
    const APIresult = await fetch(url)
        .then(response => response.json()) // Transform result to JSON
        .then( data => {                    // Retrieve data
            townCoordinates = {
                    "latitude" : data[0].lat,
                    "longitude" : data[0].lon
                }
            })
        .catch(error => {                   // Catch errors
            console.log("Error retrieving the data");
            console.log(error.message);
        } );
    
    return townCoordinates;
}

// Query to API 2: Use API to retrieve weather data from a given longitude and latitude (--> city)
async function retrieveWeatherData(url){
    let weahterData;
    // Fetch Data
    const APIresult = await fetch(url)
        .then(response => weahterData = response.json()) // Transform result to JSON and save data
        .catch(error => {                                // Catch errors
            console.log("Error retrieving the city weather data");
            console.log(error.message);
        });

    return weahterData;
}


