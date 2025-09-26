import { fetchWeatherData, fetchForecastData } from './api.js';
import { updateUI, setWeatherBackground, showError, clearError } from './ui.js';
import { getFavorites, addFavorite, removeFavorite } from './storage.js';

// App state
const state = {
  unit: 'celsius', // 'celsius' or 'fahrenheit'
  currentCity: '',
  favorites: getFavorites()
};

// DOM elements
const citySearchInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const geolocationBtn = document.getElementById('geolocation-btn');
const unitToggleBtn = document.getElementById('unit-toggle');
const themeToggleBtn = document.getElementById('theme-toggle');
const favoritesListEl = document.getElementById('favorites-list');

// Initialize app
async function initApp() {
  // Load theme preference
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // Load unit preference
  if (localStorage.getItem('unit') === 'fahrenheit') {
    state.unit = 'fahrenheit';
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Load favorites
  renderFavorites();
  
  // Try to load weather for default city or geolocation
  if (state.favorites.length > 0) {
    await getWeatherData(state.favorites[0]);
  } else {
    getLocationWeather();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search form submission
  searchBtn.addEventListener('click', handleSearch);
  citySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  // Geolocation button
  geolocationBtn.addEventListener('click', getLocationWeather);
  
  // Unit toggle
  unitToggleBtn.addEventListener('click', toggleUnit);
  
  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Handle search
async function handleSearch() {
  const city = citySearchInput.value.trim();
  if (city) {
    await getWeatherData(city);
    citySearchInput.value = '';
  }
}

// Get weather data for a city
async function getWeatherData(city) {
  try {
    clearError();
    const weatherData = await fetchWeatherData(city);
    
    if (weatherData.cod === '404') {
      showError('City not found. Please try another city.');
      return;
    }
    
    state.currentCity = weatherData.name;
    
    // Fetch forecast data
    const forecastData = await fetchForecastData(weatherData.coord.lat, weatherData.coord.lon);

    // Update document title
    document.title = 'Weather App | ' +state.currentCity;
    
    // Update UI
    updateUI(weatherData, forecastData, state.unit);
    
    // Update background
    setWeatherBackground(weatherData.weather[0].main, weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset);
    
    // Setup favorite button
    setupFavoriteButton(weatherData.name);
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showError('Failed to fetch weather data. Please try again later.');
  }
}

// Get weather based on geolocation
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        clearError();
        const { latitude, longitude } = position.coords;
        
        const weatherData = await fetchWeatherData(null, latitude, longitude);
        state.currentCity = weatherData.name;
        
        // Fetch forecast data
        const forecastData = await fetchForecastData(latitude, longitude);

        // Update document title
        document.title = 'Weather App | ' +state.currentCity;
        
        // Update UI
        updateUI(weatherData, forecastData, state.unit);
        
        // Update background
        setWeatherBackground(weatherData.weather[0].main, weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset);
        
        // Setup favorite button
        setupFavoriteButton(weatherData.name);
        
      } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to fetch weather data. Please try again later.');
      }
    }, () => {
      showError('Geolocation permission denied. Please search for a city manually.');
    });
  } else {
    showError('Geolocation is not supported by your browser. Please search for a city manually.');
  }
}

// Setup favorite button
function setupFavoriteButton(cityName) {
  const isFavorite = state.favorites.includes(cityName);
  const favoritesContainer = document.querySelector('.favorites-container');
  
  // Add favorite button if it doesn't exist
  if (!document.getElementById('favorite-btn')) {
    const favoriteBtn = document.createElement('button');
    favoriteBtn.id = 'favorite-btn';
    favoriteBtn.classList.add('toggle-btn');
    favoriteBtn.style.marginTop = '16px';
    
    document.querySelector('.location-info').appendChild(favoriteBtn);
    
    favoriteBtn.addEventListener('click', () => {
      if (state.favorites.includes(state.currentCity)) {
        removeFavorite(state.currentCity);
        state.favorites = getFavorites();
        favoriteBtn.innerHTML = `Add to Favorites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      } else {
        addFavorite(state.currentCity);
        state.favorites = getFavorites();
        favoriteBtn.innerHTML = `Remove from Favorites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      }
      renderFavorites();
    });
  }
  
  // Update favorite button text
  const favoriteBtn = document.getElementById('favorite-btn');
  if (isFavorite) {
    favoriteBtn.innerHTML = `Remove from Favorites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  } else {
    favoriteBtn.innerHTML = `Add to Favorites <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  }
  
  // Show/hide favorites container
  if (state.favorites.length > 0) {
    favoritesContainer.classList.remove('hidden');
  } else {
    favoritesContainer.classList.add('hidden');
  }
}

// Render favorites
function renderFavorites() {
  favoritesListEl.innerHTML = '';
  
  if (state.favorites.length === 0) {
    document.querySelector('.favorites-container').classList.add('hidden');
    return;
  }
  
  document.querySelector('.favorites-container').classList.remove('hidden');
  
  state.favorites.forEach(city => {
    const favoriteEl = document.createElement('div');
    favoriteEl.classList.add('favorite-city');
    favoriteEl.textContent = city;
    
    // Add click handler to load weather for this city
    favoriteEl.addEventListener('click', () => {
      getWeatherData(city);
    });
    
    // Add remove button
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    removeBtn.classList.add('remove-favorite');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFavorite(city);
      state.favorites = getFavorites();
      renderFavorites();
      
      // Update favorite button if currently viewing this city
      if (state.currentCity === city) {
        setupFavoriteButton(city);
      }
    });
    
    favoriteEl.appendChild(removeBtn);
    favoritesListEl.appendChild(favoriteEl);
  });
}

// Toggle temperature unit
function toggleUnit() {
  state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
  localStorage.setItem('unit', state.unit);
  
  // Update temperature display
  const tempEl = document.getElementById('temperature');
  const feelsLikeEl = document.getElementById('feels-like');
  const currentTemp = parseFloat(tempEl.textContent);
  const feelsLikeTemp = parseFloat(feelsLikeEl.textContent);
  
  let newTemp, newFeelsLike;
  
  if (state.unit === 'celsius') {
    // Convert from F to C
    newTemp = (currentTemp - 32) * 5/9;
    newFeelsLike = (feelsLikeTemp - 32) * 5/9;
    tempEl.textContent = `${Math.round(newTemp)}°C`;
    feelsLikeEl.textContent = `${Math.round(newFeelsLike)}°C`;
  } else {
    // Convert from C to F
    newTemp = (currentTemp * 9/5) + 32;
    newFeelsLike = (feelsLikeTemp * 9/5) + 32;
    tempEl.textContent = `${Math.round(newTemp)}°F`;
    feelsLikeEl.textContent = `${Math.round(newFeelsLike)}°F`;
  }
  
  // Update forecast temperatures
  const forecastItems = document.querySelectorAll('.forecast-item');
  forecastItems.forEach(item => {
    const tempEl = item.querySelector('.forecast-temp');
    const currentTemp = parseFloat(tempEl.textContent);
    
    let newTemp;
    if (state.unit === 'celsius') {
      // Convert from F to C
      newTemp = (currentTemp - 32) * 5/9;
      tempEl.textContent = `${Math.round(newTemp)}°C`;
    } else {
      // Convert from C to F
      newTemp = (currentTemp * 9/5) + 32;
      tempEl.textContent = `${Math.round(newTemp)}°F`;
    }
  });
}

// Toggle theme
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  
  // Update theme toggle icon
  if (isDarkMode) {
    themeToggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  } else {
    themeToggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);