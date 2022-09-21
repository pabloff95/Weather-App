// This script contains all the functions required to controll the Unsplash API (free api with huge photos database)

export {getPictureUrl};

// ----------------------- FUNCTION TO QUERY API
// Query 1: Unsplash API -> retrieve url according to searched town
async function retrievePictureUrl(url){
    // Get picture url
    let photoUrl;
    const PHOTO_API = await fetch(url)
        .then(element => element.json())
        .then(data => photoUrl = data['results']['0'].urls.full)
        .catch(error => console.log(error.message));
    return photoUrl;
}

// ----------------------- FUNCTION TO OBTAIN DATA FROM QUERY TO API
// Function to get the URL of a picture of a given town
async function getPictureUrl(city){
    const API_KEY = "0Jx0y2tQr8-I8slywV7H_nC6hhLPKir4mhygsmoW3As"; // Access key 
    // Do query: returns URL of a picture from the desired city
    let photoURL = "https://api.unsplash.com/search/photos?query=" + city + "&page=1&per_page=1&client_id=" + API_KEY; // Big DB --> limit query to 1 photo
    let resultAPI = await retrievePictureUrl(photoURL);

    return resultAPI;
}
