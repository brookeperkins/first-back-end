require('dotenv').config();
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000;
const request = require('superagent');
const { GEOCODE_API_KEY } = process.env;
const { WEATHER_API_KEY } = process.env;
const { HIKING_API_KEY } = process.env;

app.use(cors());
app.use(express.static('public'));

async function getLatLong (cityName){
    //1)replace hard-coded data with a call to the API
    //2) add the GEOCODE_API_KEY to .env and pop it in the url
    //3) add the city name from the query params
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    //4)go find the first city in response
    const city = response.body[0];

    //5)change its shape to fit the contract with the front end
    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

    //6)make route async
app.get('/location', async(req, res) => {
    const userInput = req.query.search; 
try {    //await
    const mungedData = await getLatLong(userInput);

    res.json(mungedData);
} catch (e) {
    res.status(500).json({ error: e.message })
}
});

async function getWeather(lat, lon) {
    // const data = weatherData.data;
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`);

    const weatherData = response.body.data;

    const forecastArray = weatherData.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000)
        };
    });
    return forecastArray.slice(0, 3);
}

app.get('/weather', async (req, res) => {
    const userLat = req.query.latitude;
    const userLon = req.query.longitude; 
try {
    const mungedData = await getWeather(userLat, userLon);

    res.json(mungedData);
} catch (e) {
    res.status(500).json({ error: e.message })
}
});

async function getTrails(lat, lon) {
    console.log(lat, lon, HIKING_API_KEY);
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${HIKING_API_KEY}`);

    const hikes = response.body.trails;
    console.log(response.body);

    const hikeArray = hikes.map(hike => {
        return {
            trail_url: hike.url,
            name: hike.name,
            location: hike.location,
            length: hike.length,
            condition_date: new Date(hike.conditionDate).toDateString(),
            condition_time: new Date(hike.conditionDate).toTimeString(),
            conditions: hike.conditionStatus,
            stars: hike.stars,
            star_votes: hike.starVotes,
            summary: hike.summary
        };
    });
    return hikeArray;
}

app.get('/trails', async (req, res) => {
    
try {
    const userLat = req.query.latitude;
    const userLon = req.query.longitude;
    const mungedData = await getTrails(userLat, userLon);
    
    res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
    });

//this is what allows us to connect to the localhost!
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})