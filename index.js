const express = require('express')
const cors = require('cors');
const geoData = require('./data/geo.js');
const weatherData = require('./data/weather.js');
const app = express()
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.static('public'));

function getWeather(lat, lon) {
    //TODO: we make an API call to get the weather
    const data = weatherData.data;
    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000)
        };
    });

    return forecastArray
}

function getLatLong(cityName){
    //pretend we made an API call -- for now it's hard coded
    const city = geoData[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

app.get('/location', (req, res) => {
    const userInput = req.query.search; 
try {
    const mungedData = getLatLong(userInput);
    res.json(mungedData);
} catch (e) {
    res.status(500).json({ error: e.message })
}
});

app.get('/weather', (req, res) => {
    const userLat = req.query.latitude;
    const userLon = req.query.longitude; 
try {
    const mungedData = getWeather(userLat, userLon);
    res.json(mungedData);
} catch (e) {
    res.status(500).json({ error: e.message })
}
});

//this is what allows us to connect to the localhost!
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})