import { formatDate, formatDay, kelvinToUnit } from './utils.js';

// Update the UI with weather data
export function updateUI(weatherData, forecastData, unit) {
  // Update current weather
  updateCurrentWeather(weatherData, unit);
  
  // Update forecast
  updateForecast(forecastData, unit);
}

// Update current weather display
function updateCurrentWeather(data, unit) {
  const cityNameEl = document.getElementById('city-name');
  const dateTimeEl = document.getElementById('date-time');
  const temperatureEl = document.getElementById('temperature');
  const weatherDescEl = document.getElementById('weather-description');
  const weatherIconEl = document.getElementById('weather-icon');
  const feelsLikeEl = document.getElementById('feels-like');
  const humidityEl = document.getElementById('humidity');
  const windSpeedEl = document.getElementById('wind-speed');
  
  // Set city name
  cityNameEl.textContent = data.name;
  
  // Set date and time
  const localTime = new Date(data.dt * 1000);
  dateTimeEl.textContent = formatDate(localTime);
  
  // Set temperature
  const temp = kelvinToUnit(data.main.temp, unit);
  temperatureEl.textContent = `${Math.round(temp)}°${unit === 'celsius' ? 'C' : 'F'}`;
  
  // Set weather description and icon
  weatherDescEl.textContent = data.weather[0].description;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIconEl.alt = data.weather[0].description;
  
  // Set additional weather details
  const feelsLike = kelvinToUnit(data.main.feels_like, unit);
  feelsLikeEl.textContent = `${Math.round(feelsLike)}°${unit === 'celsius' ? 'C' : 'F'}`;
  humidityEl.textContent = `${data.main.humidity}%`;
  
  // Convert wind speed from m/s to km/h
  const windSpeed = data.wind.speed * 3.6;
  windSpeedEl.textContent = `${Math.round(windSpeed)} km/h`;
}

// Update forecast display
function updateForecast(forecastData, unit) {
  const forecastEl = document.getElementById('forecast');
  forecastEl.innerHTML = '';
  
  forecastData.forEach((forecast, index) => {
    const date = new Date(forecast.dt_txt);
    const dayName = formatDay(date);
    const temp = kelvinToUnit(forecast.main.temp, unit);
    const icon = forecast.weather[0].icon;
    const description = forecast.weather[0].description;
    
    const forecastItem = document.createElement('div');
    forecastItem.classList.add('forecast-item');
    
    forecastItem.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <img 
        src="https://openweathermap.org/img/wn/${icon}.png" 
        alt="${description}" 
        class="forecast-icon"
      />
      <div class="forecast-temp">${Math.round(temp)}°${unit === 'celsius' ? 'C' : 'F'}</div>
    `;
    
    forecastEl.appendChild(forecastItem);
  });
}

// Set weather background based on weather condition and time
export function setWeatherBackground(weatherMain, currentTime, sunrise, sunset) {
  const body = document.body;
  
  // Remove all weather classes
  body.classList.remove('clear-day', 'clear-night', 'rain', 'clouds', 'snow');
  
  const isDay = currentTime > sunrise && currentTime < sunset;
  
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      body.classList.add(isDay ? 'clear-day' : 'clear-night');
      break;
    case 'clouds':
      body.classList.add('clouds');
      break;
    case 'rain':
    case 'drizzle':
    case 'thunderstorm':
      body.classList.add('rain');
      break;
    case 'snow':
      body.classList.add('snow');
      break;
    default:
      body.classList.add(isDay ? 'clear-day' : 'clear-night');
  }
}

// Show error message
export function showError(message) {
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
}

// Clear error message
export function clearError() {
  const errorContainer = document.getElementById('error-container');
  errorContainer.classList.add('hidden');
}