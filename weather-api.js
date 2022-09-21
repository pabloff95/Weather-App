/* This script contains all the functions required to controll the OneWeather Map API
        - API 1: retrieves latitude and longitude from a town
        - API 2: retrieves weather data of current day of a given latitude and longitude
        - API 3: retrieves weather data for the next 5 days of a given latitude and longitude
*/

export {getWeatherData, getWeather5NextDays, get5DayDetailedData};

// ----------------------- FUNCTIONS TO QUERY API

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


// Query to API 3: Get data of 5 days next to current day 
async function retrieve5DaysData(url){
    let fiveDaysWeather = [];
    let date = new Date();
    let currentDay = date.getDate();
    const APIresult = await fetch(url)
        .then(response =>  response.json())
        .then(data => {
            data.list.forEach(record => {            
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


// ----------------------- FUNCTIONS TO OBTAIN DATA FROM QUERIES TO APIs
// Function to gather the data regarding to the CURRENT DAY
async function getWeatherData(city){
    const API_KEY = ""; // [INTRODUCE] OpenWeather API user key
    let limit = "1"; // Number of results returned per query (ex. multiple cities with similar names)

    // Do query 1: returns longitude and latitude of desired city
    let urlCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=" + limit + "&appid=" + API_KEY;
    const LOCATION = await retrieveCoordinates(urlCoordinates);

    // Do query 2: returns weather data of given city (requires query 1 to get latitude and longitude)
    let urlWeather = "https://api.openweathermap.org/data/2.5/weather?lat=" + LOCATION['latitude'] + "&lon=" + LOCATION['longitude'] + "&appid=" + API_KEY;       
    let cityWeather = await retrieveWeatherData(urlWeather);

    return cityWeather;
}

// Function to gather the data regarding to the a FUTURE 5 DAYS
async function getWeather5NextDays(city){
    const API_KEY = ""; // [INTRODUCE] OpenWeather API user key

    // Do query 1: get longitude and latitude of desired city
    let urlCoordinates = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + API_KEY;
    const LOCATION = await retrieveCoordinates(urlCoordinates);

    // Do query 2: (prepare URL and) query api to get next 5 days weather
    let url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + LOCATION['latitude'] + "&lon=" + LOCATION['longitude'] + "&appid=5a590164a400ad0b07b8d70c8f5ef674";
    let result = await retrieve5DaysData(url);

    return result;    
}

// ----------------------- FUNCTIONS TO MANAGE THE DATA
// Function to iterate raw data comming from API (getWeather5NextDays) and return an array of objects with useful and readable data of each of the 5 next days
function get5DayDetailedData(rawData) {
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
