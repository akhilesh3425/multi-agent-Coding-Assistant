const axios = require('axios');

async function fetchWeatherData(location) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Format the data for usage in the dashboard
        return {
            location: data.location.name,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            icon: data.current.condition.icon
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Unable to fetch weather data.');
    }
}

module.exports = { fetchWeatherData };