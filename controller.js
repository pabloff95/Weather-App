// This file contains the rest of the functions that control the dates and DOM elements manipulation

export {getCurrentDate, updateButtonsValues, displayMainData, displayDataCurrentDay, displayDataNextDays};


// ----------------------- FUNCTIONS THAT CONTROL THE DATES
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

// ----------------------- FUNCTIONS THAT CONTROL DOM ELEMENTS
// Function to update values of the buttons to display the 5 next days of the week
function updateButtonsValues(){
    let buttons = document.querySelectorAll(".next-day-button");
    let days = getNext5Days();
    let i = 0;
    buttons.forEach(button => {
        button.innerText = days[i];
        i++;
    });
}

// Function to display all the main data (main titles in right element) obtained from weather APIs --> display it in HTML elements
function displayMainData(city, icon, main, temperature, date = getCurrentDate()){
    // Return information to display
    return `
        <div id='wheather-results-information'>
            <p id='temperature-title'>${Math.round(temperature)}ºC</p>
            <div id='town-date'>
                <p class='title town'>${city.toUpperCase()}</p>
                <p id='date'>${date}</p>
            </div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}" id='weather-icon'><br>            
        </div>
    `;
}

// Function to display all the data details obtained from APIs --> display it in HTML elements
function displayDataCurrentDay(description, min, temperature, max, humidity){
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
function displayDataNextDays(description, temperature, feeling, wind, humidity){
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
