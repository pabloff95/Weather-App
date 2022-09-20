window.addEventListener("load", async function(){

    getNext5Days();
    // Prepare variables
    let fiveDaysRawData;
    let city;

    // Not display button section until town is searched
    let buttonsSection = document.getElementById("next-days-container");
    buttonsSection.style.display = "none";

    // Prevent form from submitting on "enter" key pressed
    document.getElementById("weatherForm").addEventListener("keypress", function(event){
        if (event.key === "Enter"){
            event.preventDefault();
        }        
    });

    // Control the background img to be displayed according to the town selected. Initial state always the same picture
    let rightContainer = document.getElementById("weather-results");
    rightContainer.style.backgroundImage = "url('pictures/main-background.jpg')";    

    // Search button: print weather data of searched city
    document.getElementById("search").addEventListener("click", async function(event){  
        city = document.getElementById("location").value;
        // Change right section img to img of the searched town
        try{           
            var pictureUrl = await getPictureUrl(city);
            if (pictureUrl !== undefined) {
                rightContainer.style.backgroundImage = "url('" + pictureUrl + "')";  
            } else {
                rightContainer.style.backgroundImage = "url('pictures/main-background.jpg')";        
            }            
        } catch (error) {
            console.log(error.message);
            rightContainer.style.backgroundImage = "url('pictures/main-background.jpg')";    
        }

        // Get Data from the town introduced by the user and display it, if not available display error
        try {
            buttonsSection.style.display = ""; // Display button section
            updateButtonsValues(); // Update their values --> show 5 next days of the week
            // Get weather data of the city
            let data = await getWeatherData(city); // Information of current day
            fiveDaysRawData = await retrieve5DaysData(city); // Information of next 5 days
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
            rightContainer.innerHTML = displayMainData(city, ICON, MAIN, TEMPERATURE);
            document.getElementById("weather-information").innerHTML = displayDataDetails(description, MIN_TEMPERATURE, TEMPERATURE, MAX_TEMPERATURE, HUMIDITY);
        } catch (error) {
            document.getElementById("weather-information").innerHTML = `<h3>'${city}' not found in database</h3>`;
            rightContainer.innerHTML = "";
            console.log(error);
        }        

        // Reset form
        document.getElementById("location").value = "";
    })
    
    // SHOW DATA OF THE NEXT 5 DAYS 
    for (let i = 0; i < 5; i++) {
        let elementID = "nextDay" + (i+1).toString();
        document.getElementById(elementID).addEventListener("click", function(){
            let data = get5DaysDetailData(fiveDaysRawData)[i];
            // Prepare data
            const TEMPERATURE = parseFloat(data['average'] -  273.15).toFixed(2);        
            const FEELING = parseFloat(data['feeling'] -  273.15).toFixed(2);        
            const WIND = data['wind'] + "km/h";
            const DESCRIPTION = data['mainDescription'].charAt(0).toUpperCase() + data['mainDescription'].slice(1);
            // Display data in the screen
            rightContainer.innerHTML = displayMainData(city, data['icon'], data['main'], TEMPERATURE);
            document.getElementById("weather-information").innerHTML = displayDataDetailsNextDays(DESCRIPTION, TEMPERATURE, FEELING, WIND, data['humidity']);
        });
    }    
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

// Get data of 5 days next to current day (using OpenWeather map API)
async function retrieve5DaysData(city){
    // Do query to get longitude and latitude of desired city
    let urlCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=5a590164a400ad0b07b8d70c8f5ef674";
    const LOCATION = await retrieveCoordinates(urlCoordinates);
    // Prepare URL
    let url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + LOCATION['latitude'] + "&lon=" + LOCATION['longitude'] + "&appid=5a590164a400ad0b07b8d70c8f5ef674";
    // Get raw data
    let fiveDaysWeather = [];
    const APIresult = await fetch(url)
        .then(response =>  response.json())
        .then(data => {
            let currentDay = getCurrentDate().substring(0,2);
            data.list.forEach(record => {            
                console.log(record);
                // Skip records of current day
                if (currentDay === record['dt_txt'].substring(8,10)){ 
                    return;
                }                
                // Take 12:00:00 as weather data reference of the next five days
                if (record['dt_txt'].substring(11, 19) === "12:00:00") {                    
                    fiveDaysWeather.push(record);
                }
            })
        })
        .catch(error => {                                // Catch errors
            console.log("Error retrieving the city weather data for the next 5 days");
            console.log(error.message);
        });
    
    return fiveDaysWeather;
}

// Function to iterate raw data comming from API (retrieve5DaysData function) and return an array of objects with useful data
function get5DaysDetailData(rawData) {
    let allData = [];
    rawData.forEach(record => {
        let weatherObject = {
            "average": record['main'].temp,
            "feeling" : record['main'].feels_like,            
            "wind" : record['wind'].speed,
            "humidity": record['main'].humidity,
            "icon": record['weather']['0'].icon,
            "main": record['weather']['0'].main,
            "mainDescription": record['weather']['0'].description
        }
        allData.push(weatherObject);
    });

    return allData;
}

// Unsplash API: retrieve url according to searched town
async function getPictureUrl(city){
    const ACCESS_KEY = "0Jx0y2tQr8-I8slywV7H_nC6hhLPKir4mhygsmoW3As";
    //const SECRET_KEY = "RCdj8QujELgEyVIewusGtCA3rU9lS8VYbFkNN2GdCLU";
    let photosURL = "https://api.unsplash.com/search/photos?query=" + city + "&page=1&per_page=1&client_id=" + ACCESS_KEY; // Big DB --> limit query to 1 photo
    // Get picture url
    let url;
    const PHOTO_API = await fetch(photosURL)
        .then(element => element.json())
        .then(data => url = data['results']['0'].urls.full)
        .catch(error => console.log(error.message));
    return url;
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

// Get current date format example: 16/may/2022
function getCurrentDate(){
    let date = new Date();
    let month = date.getMonth();
    let monthNames =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep", "Oct","Nov","Dec"];
    month = monthNames[month];
    let currentDate = `${date.getDate()}/${month}/${date.getFullYear()}`;

    return currentDate;
}

// Get next five days of the week (as text)
function getNext5Days(){
    const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let date = new Date();
    let day = date.getDay() + 1; // Current day: Sunday = 0 (...); +1 --> function adds the NEXT 5 days
    let result = [];
    for (let i = 0; i < 5; i++){
        if (WEEK_DAYS[day] !== undefined) {
            result.push(WEEK_DAYS[day]);
        } else {
            day = 0;
            result.push(WEEK_DAYS[day]);
        }        
        day++;
    }
    
    return result;
}

// Update values of the buttons to display the 5 next days of the week
function updateButtonsValues(){
    let buttons = document.querySelectorAll(".next-day-button");
    let days = getNext5Days();
    let i = 0;
    buttons.forEach(button => {
        button.innerText = days[i];
        i++;
    });
}


// Function to display all the main data obtained from APIs --> display it in HTML elements
function displayMainData(city, icon, main, temperature){
    let currentDate = getCurrentDate();

    // Return information to display
    return `
        <div id='wheather-results-information'>
            <p id='temperature-title'>${Math.round(temperature)}ºC</p>
            <div id='town-date'>
                <p class='title town'>${city.toUpperCase()}</p>
                <p id='date'>${currentDate}</p>
            </div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}" id='weather-icon'><br>            
        </div>
    `;
}

// Function to display all the data details obtained from APIs --> display it in HTML elements
function displayDataDetails(description, min, temperature, max, humidity){
    // Calculate number of pictures for humidity (1,2,3,4), according to percentage. Prepare the pictures HTML elements
    const HUMIDITY_LEVEL = Math.ceil(parseInt(humidity)/25);
    let humidityPictures ="";
    for (let i = 0; i < HUMIDITY_LEVEL; i++){
        humidityPictures += "<img src='pictures/humidity.png' class='humidity-picture'>";
    }
    // Return information to display
    return `
            <p class='title'>Weather Details</p>
            <div id='details-description'>
                <p class='subtitle'>${description}</p>
                <div class='weather-description-item'>
                    <p>Min temperature</p>
                    <p>${min}ºC</p>
                </div>
                <div class='weather-description-item'>
                    <p>Average temperature</p>
                    <p>${temperature}ºC</p>
                </div>
                <div class='weather-description-item'>
                    <p>Max temperature</p>
                    <p>${max}ºC</p>
                </div>
                <div class='weather-description-item'>
                    <p>Humidity</p>
                    <p>${humidity}%</p>
                </div></br>
                <div id='humidity-container'>${humidityPictures}</div>
            </div>
    `;
}

// Function to display all the data details (used for the next 5 days!) obtained from APIs --> display it in HTML elements
function displayDataDetailsNextDays(description, temperature, feeling, wind, humidity){
    // Calculate number of pictures for humidity (1,2,3,4), according to percentage. Prepare the pictures HTML elements
    const HUMIDITY_LEVEL = Math.ceil(parseInt(humidity)/25);
    let humidityPictures ="";
    for (let i = 0; i < HUMIDITY_LEVEL; i++){
        humidityPictures += "<img src='pictures/humidity.png' class='humidity-picture'>";
    }
    // Return information to display
    return `
            <p class='title'>Weather Details</p>
            <div id='details-description'>
                <p class='subtitle'>${description}</p>                
                <div class='weather-description-item'>
                    <p>Average temperature</p>
                    <p>${temperature}ºC</p>
                </div>
                <div class='weather-description-item'>
                    <p>Temp. feeling </p>
                    <p>${feeling}ºC</p>
                </div>
                <div class='weather-description-item'>
                    <p>Wind</p>
                    <p>${wind}</p>
                </div>
                <div class='weather-description-item'>
                    <p>Humidity</p>
                    <p>${humidity}%</p>
                </div></br>
                <div id='humidity-container'>${humidityPictures}</div>
            </div>
    `;
}