const apiKey = "333db0046b1e44018cc131847230209";

window.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const cityInput = document.getElementById("city-input");
  const toggleDarkBtn = document.getElementById("toggle-dark");

  // Load dark mode preference
  if(localStorage.getItem("darkMode") === "enabled"){
    document.body.classList.add("dark");
  }

  toggleDarkBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if(document.body.classList.contains("dark")){
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });

  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);
    }
  });

  // Try geolocation on load
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    }, () => {
      // If denied or error, fallback to default city or empty
      // Could show a message or leave blank
    });
  }

});

async function getWeather(cityName) {
  const weatherBox = document.getElementById("weather");
  const forecastBox = document.getElementById("forecast");
  weatherBox.innerHTML = "Loading...";
  forecastBox.innerHTML = "";

  try {
    // Current weather + 7-day forecast in one API call
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=7&aqi=no&alerts=no`
    );
    const data = await response.json();

    if (data.error) {
      weatherBox.innerHTML = `<p>${data.error.message}</p>`;
      forecastBox.innerHTML = "";
      return;
    }

    displayWeather(data);
  } catch (error) {
    weatherBox.innerHTML = `<p>Failed to fetch weather data. Please try again.</p>`;
    console.error(error);
  }
}

async function getWeatherByCoords(lat, lon) {
  const weatherBox = document.getElementById("weather");
  const forecastBox = document.getElementById("forecast");
  weatherBox.innerHTML = "Loading...";
  forecastBox.innerHTML = "";

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`
    );
    const data = await response.json();

    if (data.error) {
      weatherBox.innerHTML = `<p>${data.error.message}</p>`;
      forecastBox.innerHTML = "";
      return;
    }

    displayWeather(data);
  } catch (error) {
    weatherBox.innerHTML = `<p>Failed to fetch weather data. Please try again.</p>`;
    console.error(error);
  }
}

function displayWeather(data) {
  const weatherBox = document.getElementById("weather");
  const forecastBox = document.getElementById("forecast");

  // Current weather
  const iconUrl = `https:${data.current.condition.icon}`;
  const condition = data.current.condition.text;

  weatherBox.innerHTML = `
    <div class="weather-info active">
      <h2>${data.location.name}, ${data.location.country}</h2>
      <img class="weather-icon" src="${iconUrl}" alt="${condition}" />
      <p><strong>${condition}</strong></p>
      <div class="weather-details">
        <p>🌡️ Temperature: ${data.current.temp_c}°C</p>
        <p>💧 Humidity: ${data.current.humidity}%</p>
        <p>🌬️ Wind: ${data.current.wind_kph} km/h</p>
      </div>
    </div>
  `;

  // 7-day forecast
  const forecastDays = data.forecast.forecastday;
  forecastBox.innerHTML = "";
  forecastDays.forEach(day => {
    const date = new Date(day.date);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const dateStr = date.toLocaleDateString(undefined, options);

    const icon = `https:${day.day.condition.icon}`;
    const conditionText = day.day.condition.text;
    const maxTemp = day.day.maxtemp_c.toFixed(1);
    const minTemp = day.day.mintemp_c.toFixed(1);

    forecastBox.innerHTML += `
      <div class="forecast-day">
        <p><strong>${dateStr}</strong></p>
        <img src="${icon}" alt="${conditionText}" />
        <p>${conditionText}</p>
        <p>🌡️ ${minTemp}°C - ${maxTemp}°C</p>
      </div>
    `;
  });
}