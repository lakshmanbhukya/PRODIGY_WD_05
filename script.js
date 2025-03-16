// API Key for OpenWeatherMap API
const API_KEY = "API_key_here"; // Replace with your actual API key
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM Elements
const locationInput = document.getElementById("location-input");
const searchButton = document.getElementById("search-button");
const currentLocationButton = document.getElementById(
  "current-location-button"
);
const weatherContainer = document.getElementById("weather-container");
const errorContainer = document.getElementById("error-container");
const loadingContainer = document.getElementById("loading-container"); //
const errorText = document.getElementById("error-text");

// Weather data elements
const locationElement = document.getElementById("location");
const dateTimeElement = document.getElementById("date-time");
const temperatureElement = document.getElementById("temperature");
const feelsLikeElement = document.getElementById("feels-like");
const weatherIconElement = document.getElementById("weather-icon");
const weatherDescriptionElement = document.getElementById(
  "weather-description"
);
const windSpeedElement = document.getElementById("wind-speed");
const humidityElement = document.getElementById("humidity");
const pressureElement = document.getElementById("pressure");
const visibilityElement = document.getElementById("visibility");
const sunriseElement = document.getElementById("sunrise");
const sunsetElement = document.getElementById("sunset");

// Event Listeners
searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (location) {
    getWeatherByLocation(location);
  }
});

locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const location = locationInput.value.trim();
    if (location) {
      getWeatherByLocation(location);
    }
  }
});

currentLocationButton.addEventListener("click", getWeatherByGeolocation);

// Functions
function showLoading() {
  loadingContainer.classList.remove("hidden");
  weatherContainer.classList.add("hidden");
  errorContainer.classList.add("hidden");
}

function hideLoading() {
  loadingContainer.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorContainer.classList.remove("hidden");
  weatherContainer.classList.add("hidden");
  hideLoading();
}

function showWeather() {
  weatherContainer.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  hideLoading();
}

async function getWeatherByLocation(location) {
  showLoading();
  try {
    const response = await fetch(
      `${BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error(
        "Location not found. Please try again with a valid city or zip code."
      );
    }
    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    showError(error.message);
  }
}

function getWeatherByGeolocation() {
  showLoading();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          if (!response.ok) {
            throw new Error(
              "Unable to fetch weather data. Please try again later."
            );
          }
          const data = await response.json();
          displayWeatherData(data);
        } catch (error) {
          showError(error.message);
        }
      },
      (error) => {
        showError(
          "Location access denied. Please enable location services or enter a location manually."
        );
      }
    );
  } else {
    showError(
      "Geolocation is not supported by your browser. Please enter a location manually."
    );
  }
}

function displayWeatherData(data) {
  // Set location and date
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  dateTimeElement.textContent = formatDate(new Date());

  // Set temperature and feels like
  temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
  feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;

  // Set weather description and icon
  weatherDescriptionElement.textContent = data.weather[0].description;
  weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIconElement.alt = data.weather[0].description;

  // Set additional weather data
  windSpeedElement.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
  humidityElement.textContent = `${data.main.humidity}%`;
  pressureElement.textContent = `${data.main.pressure} hPa`;

  // Set visibility (convert from meters to km)
  const visibilityKm = data.visibility / 1000;
  visibilityElement.textContent = `${visibilityKm.toFixed(1)} km`;

  // Set sunrise and sunset times
  sunriseElement.textContent = formatTime(new Date(data.sys.sunrise * 1000));
  sunsetElement.textContent = formatTime(new Date(data.sys.sunset * 1000));

  // Show the weather container
  showWeather();
}

function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(date) {
  const options = { hour: "2-digit", minute: "2-digit" };
  return date.toLocaleTimeString("en-US", options);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Check if there's a previously searched location in local storage
  const lastLocation = localStorage.getItem("lastLocation");
  if (lastLocation) {
    locationInput.value = lastLocation;
    getWeatherByLocation(lastLocation);
  } else {
    // If no previous location, try to get current location
    getWeatherByGeolocation();
  }
});

// Save the last searched location to local storage
function saveLastLocation(location) {
  localStorage.setItem("lastLocation", location);
}

// Update saveLastLocation functionality
searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (location) {
    saveLastLocation(location);
    getWeatherByLocation(location);
  }
});

// Extend the keypress event to include saving location
locationInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const location = locationInput.value.trim();
    if (location) {
      saveLastLocation(location);
      getWeatherByLocation(location);
    }
  }
});

// Temperature unit toggle functionality
let isMetric = true;
const toggleUnitButton = document.getElementById("toggle-unit");

if (toggleUnitButton) {
  toggleUnitButton.addEventListener("click", () => {
    isMetric = !isMetric;
    toggleUnitButton.textContent = isMetric ? "Switch to °F" : "Switch to °C";

    // Re-fetch weather with new units if there's a current location
    const location = locationInput.value.trim();
    if (location) {
      getWeatherByLocation(location);
    } else {
      getWeatherByGeolocation();
    }
  });
}

// Update API calls to use the correct units
async function getWeatherByLocation(location) {
  showLoading();
  try {
    const units = isMetric ? "metric" : "imperial";
    const response = await fetch(
      `${BASE_URL}?q=${location}&appid=${API_KEY}&units=${units}`
    );
    if (!response.ok) {
      throw new Error(
        "Location not found. Please try again with a valid city or zip code."
      );
    }
    const data = await response.json();
    displayWeatherData(data);
  } catch (error) {
    showError(error.message);
  }
}

// Update geolocation API call to use the correct units
function getWeatherByGeolocation() {
  showLoading();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const units = isMetric ? "metric" : "imperial";
          const response = await fetch(
            `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}`
          );
          if (!response.ok) {
            throw new Error(
              "Unable to fetch weather data. Please try again later."
            );
          }
          const data = await response.json();
          displayWeatherData(data);
        } catch (error) {
          showError(error.message);
        }
      },
      (error) => {
        showError(
          "Location access denied. Please enable location services or enter a location manually."
        );
      }
    );
  } else {
    showError(
      "Geolocation is not supported by your browser. Please enter a location manually."
    );
  }
}

// Update display function to handle imperial units
function displayWeatherData(data) {
  // Set location and date
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  dateTimeElement.textContent = formatDate(new Date());

  // Set temperature and feels like with correct unit
  const tempUnit = isMetric ? "°C" : "°F";
  temperatureElement.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
  feelsLikeElement.textContent = `${Math.round(
    data.main.feels_like
  )}${tempUnit}`;

  // Set weather description and icon
  weatherDescriptionElement.textContent = data.weather[0].description;
  weatherIconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIconElement.alt = data.weather[0].description;

  // Set additional weather data
  const speedUnit = isMetric ? "km/h" : "mph";
  const windSpeed = isMetric
    ? (data.wind.speed * 3.6).toFixed(1)
    : data.wind.speed.toFixed(1);
  windSpeedElement.textContent = `${windSpeed} ${speedUnit}`;

  humidityElement.textContent = `${data.main.humidity}%`;
  pressureElement.textContent = `${data.main.pressure} hPa`;

  // Set visibility (convert from meters to km or miles)
  let visibilityValue, visibilityUnit;
  if (isMetric) {
    visibilityValue = (data.visibility / 1000).toFixed(1);
    visibilityUnit = "km";
  } else {
    visibilityValue = (data.visibility / 1609).toFixed(1);
    visibilityUnit = "mi";
  }
  visibilityElement.textContent = `${visibilityValue} ${visibilityUnit}`;

  // Set sunrise and sunset times
  sunriseElement.textContent = formatTime(new Date(data.sys.sunrise * 1000));
  sunsetElement.textContent = formatTime(new Date(data.sys.sunset * 1000));

  // Show the weather container
  showWeather();
}
