window.addEventListener("load", function(){
    // Prevent form from submitting on "enter" key pressed
    document.getElementById("weatherForm").addEventListener("keypress", function(event){
        if (event.key === "Enter"){
            event.preventDefault();
        }        
    });

    // Search button: print weather data of searched city
    document.getElementById("search").addEventListener("click", async function(event){  
        let city = document.getElementById("location").value;
        // Get Data from user introduced town and display it, if not available display error
        try {
            let data = await getWeatherData(city);
            // Get all data
            const MAIN = data['weather'][0].main; // Main text: clouds, rain, etc
            let description = data['weather'][0].description; // Description of main
            description = description.charAt(0).toUpperCase() + description.slice(1);
            const HUMIDITY = data['main'].humidity; // humidity percentage
            const ICON = data['weather'][0].icon; // icon used to obtain the picture form openweathermap url
            // Get temperature data and transform it from kelvin to celsius system and round to 2 decimals
            const TEMPERATURE = parseFloat((data['main'].temp) -  273.15).toFixed(2);        
            const MAX_TEMPERATURE = parseFloat((data['main'].temp_max) -  273.15).toFixed(2);
            const MIN_TEMPERATURE = parseFloat((data['main'].temp_min) -  273.15).toFixed(2);
            // Display data in the screen
            document.getElementById("weahter-results").innerHTML = displayData(city, ICON, MAIN, description, MIN_TEMPERATURE, TEMPERATURE, MAX_TEMPERATURE, HUMIDITY);
        } catch (error) {
            document.getElementById("weahter-results").innerHTML = `<h3>'${city}' not found in database</h3>`;
        }
        
        // Reset form
        document.getElementById("location").value = "";
    })    

});

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

// Function to gather the data by calling APIs and then it returns its data
async function getWeatherData(city){
    const API_KEY = "5a590164a400ad0b07b8d70c8f5ef674"; // OpenWeather API user key
    let limit = "1"; // Number of results returned per query (ex. multiple cities with similar names)

    // Do query 1: returns longitude and latitude of desired city
    let urlCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=" + limit + "&appid=" + API_KEY;
    const LOCATION = await retrieveCoordinates(urlCoordinates);

    // Do query 2: returns weather data of given city (requires query 1 to get latitude and longitude)
    let urlWeather = "https://api.openweathermap.org/data/2.5/weather?lat=" + LOCATION['latitude'] + "&lon=" + LOCATION['longitude'] + "&appid=" + API_KEY;       
    let cityWeather = await retrieveWeatherData(urlWeather);

    return cityWeather;
}


// Function to display all the data obtained from APIs --> display it in HTML elements
function displayData(city, icon, main, description, min, temperature, max, humidity){
    // Calculate number of pictures for humidity (1,2,3,4), according to percentage. Prepare the pictures HTML elements
    const HUMIDITY_LEVEL = Math.ceil(parseInt(humidity)/25);
    let humidityPictures ="";
    for (let i = 0; i < HUMIDITY_LEVEL; i++){
        humidityPictures += "<img src='humidity.png' class='humidity-picture'>";
    }

    return `
            <h2>${city.toUpperCase()}</h2>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}" id='weather-icon'><br>
            <p>${description}</p>
            <p><span><b>Min temperature: </b><span>${min}ºC</p>
            <p><span><b>Average temperature: </b><span>${temperature}ºC</p>
            <p><span><b>Max temperature: </b><span>${max}ºC</p>
            <p><span><b>Humidity: </b><span>${humidity}%</p>
            <div id='humidity-container'>${humidityPictures}</div>
    `;
}

