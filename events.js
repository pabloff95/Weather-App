// Gather functions from other files
import * as weatherApi from "./weather-api.js";
import * as photoApi from "./photo-api.js";
import * as controller from "./controller.js";

// ------------ EVENT CONTROLLER
window.addEventListener("load", async function(){
    // --------------- PREPARE ELEMENTS
    let fiveDaysRawData; // Filled with API call, writing it here allows to use in different sections
    let city; // Filled by text introduced by user

    // Not display button section until town is searched
    let buttonsSection = document.getElementById("next-days-container");
    buttonsSection.style.display = "none";

    // Control the background img to be displayed according to the town selected. Initial state always the same picture
    let rightContainer = document.getElementById("weather-results");
    rightContainer.style.backgroundImage = "url('pictures/main-background.jpg')";    


    // --------------- EVENTS
    // Prevent form from submitting on "enter" key pressed (default -html- submit behaviour for only button in form)
    document.getElementById("weatherForm").addEventListener("keypress", function(event){
        if (event.key === "Enter"){
            event.preventDefault();
            document.getElementById("search").click(); // "submit" information calling click event (bellow)
        }        
    });    

    // Search button: print weather data of city introduced by the user
    document.getElementById("search").addEventListener("click", async function(event){  
        city = document.getElementById("location").value;
        // Change right section img to img of the searched town
        try{           
            var pictureUrl = await photoApi.getPictureUrl(city);
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
            controller.updateButtonsValues(); // Update their values --> show 5 next days of the week
            // Get weather data of the city
            let data = await weatherApi.getWeatherData(city); // Information of current day
            fiveDaysRawData = await weatherApi.getWeather5NextDays(city); // Information of next 5 days
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
            rightContainer.innerHTML = controller.displayMainData(city, ICON, MAIN, TEMPERATURE);
            document.getElementById("weather-information").innerHTML = controller.displayDataCurrentDay(description, MIN_TEMPERATURE, TEMPERATURE, MAX_TEMPERATURE, HUMIDITY);
        } catch (error) {
            document.getElementById("weather-information").innerHTML = `<h3>'${city}' not found in database</h3>`;
            rightContainer.innerHTML = "";
            rightContainer.style.backgroundImage = "url('pictures/main-background.jpg')";    
            buttonsSection.style.display = "none";
            console.log(error);
        }        

        // Reset input type:text
        document.getElementById("location").value = "";
    })
    
    // Prepare events to display data of the next five days of the week on button click
    for (let i = 0; i < 5; i++) {
        let elementID = "nextDay" + (i+1).toString();
        document.getElementById(elementID).addEventListener("click", function(){
            let data = weatherApi.get5DayDetailedData(fiveDaysRawData)[i];
            // Prepare data
            const TEMPERATURE = parseFloat(data['average'] -  273.15).toFixed(2);        
            const FEELING = parseFloat(data['feeling'] -  273.15).toFixed(2);        
            const WIND = data['wind'] + "km/h";
            const DESCRIPTION = data['mainDescription'].charAt(0).toUpperCase() + data['mainDescription'].slice(1);
                // Get date of next days
            let day = parseInt(controller.getCurrentDate().substring(0,2)) + i + 1;
            let monthYear = controller.getCurrentDate().substring(2,11);
            let date = day + monthYear;
            // Display data in the screen
            rightContainer.innerHTML = controller.displayMainData(city, data['icon'], data['main'], TEMPERATURE, date);
            document.getElementById("weather-information").innerHTML = controller.displayDataNextDays(DESCRIPTION, TEMPERATURE, FEELING, WIND, data['humidity']);
        });
    }    
});
