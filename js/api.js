// API configuration
const API_KEY = '3de17bda9297f58ab64bd91e66b33515';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fetch current weather data
export async function fetchWeatherData(city, lat, lon) {
  let url;
  
  if (city) {
    url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
  } else if (lat && lon) {
    url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  } else {
    throw new Error('Either city name or coordinates must be provided');
  }
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Fetch 5-day forecast data
export async function fetchForecastData(lat, lon) {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Process the forecast data to get daily forecasts
    return processForecastData(data);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
}

// Process forecast data to get one forecast per day
function processForecastData(data) {
  const dailyForecasts = [];
  const forecastsByDay = {};
  
  // Group forecasts by day
  data.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!forecastsByDay[day]) {
      forecastsByDay[day] = [];
    }
    
    forecastsByDay[day].push(forecast);
  });
  
  // Get midday forecast for each day (around 12:00)
  Object.keys(forecastsByDay).forEach(day => {
    const forecasts = forecastsByDay[day];
    let middayForecast = forecasts[0];
    
    // Find forecast closest to 12:00
    forecasts.forEach(forecast => {
      const forecastHour = new Date(forecast.dt * 1000).getHours();
      const middayHour = new Date(middayForecast.dt * 1000).getHours();
      
      if (Math.abs(forecastHour - 12) < Math.abs(middayHour - 12)) {
        middayForecast = forecast;
      }
    });
    
    dailyForecasts.push(middayForecast);
  });
  
  // Take only the next 5 days
  return dailyForecasts.slice(0, 5);
}