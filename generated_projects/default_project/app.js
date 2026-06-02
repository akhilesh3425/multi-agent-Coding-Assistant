import { fetchWeatherData } from './data.js';

async function fetchHistoricalData(location) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Historical data for the last 30 days

    const endDate = new Date();
    try {
        const response = await fetch(`https://api.weather.com/v1/location/${location}/historical.json?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}&apiKey=YOUR_API_KEY`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
}

async function updateWeather(location) {
    try {
        const weatherData = await fetchWeatherData(location);
        renderWeatherData(weatherData);
        const historicalData = await fetchHistoricalData(location);
        const chartData = {
            labels: historicalData.dates,
            data: historicalData.temperatures,
        };
        renderChart(chartData);
    } catch (error) {
        console.error('Error updating weather:', error);
    }
}

function renderWeatherData(weatherData) {
    // Update the DOM to display current weather
    const weatherContainer = document.getElementById('weather');
    weatherContainer.innerHTML = `
        <h2>${weatherData.location}</h2>
        <p>Temperature: ${weatherData.temperature} °C</p>
        <p>Condition: ${weatherData.condition}</p>
        <img src='${weatherData.icon}' alt='Weather icon' />
    `;
}

function renderChart(chartData) {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Temperature Over Time',
                data: chartData.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function handleLocationSearch() {
    const locationInput = document.getElementById('locationInput').value;
    updateWeather(locationInput);
}

// Assume there's a button to trigger the search
document.getElementById('searchButton').addEventListener('click', handleLocationSearch);