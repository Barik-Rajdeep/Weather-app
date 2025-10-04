const apiKey = "d7f1b86d6530ac88b540ef61805332de"; // <-- Replace with your API key

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const descriptionEl = document.getElementById("description");
const weatherIconEl = document.getElementById("weather-icon");

const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");

const initialMessageEl = document.getElementById("initial-message");
const mainContentEl = document.querySelector("main");

let hourlyChart, dailyChart;

searchBtn.addEventListener("click", () => {
    const city = cityInput.value;
    if(city) fetchWeather(city);
});

locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
    });
});

async function fetchWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    displayWeather(data);
}

async function fetchWeatherByCoords(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    displayWeather(data);
}

function displayWeather(data) {
    const current = data.list[0];
    const weatherCondition = current.weather[0].main;
    const weatherDescription = current.weather[0].description;

    updateBackground(weatherCondition);
    updateWeatherEffects(weatherCondition, weatherDescription);
    
    // Hide initial message and show main content
    initialMessageEl.style.display = 'none';
    mainContentEl.style.display = 'flex';

    locationEl.textContent = `${data.city.name}, ${data.city.country}`;
    tempEl.textContent = `Temp: ${current.main.temp}°C (Feels like: ${current.main.feels_like}°C)`;
    descriptionEl.textContent = current.weather[0].description;
    weatherIconEl.textContent = "☁️"; // Simplified, can add icon logic

    humidityEl.textContent = current.main.humidity + "%";
    windEl.textContent = current.wind.speed + " m/s";
    sunriseEl.textContent = new Date(data.city.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    sunsetEl.textContent = new Date(data.city.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    pressureEl.textContent = current.main.pressure + " hPa";
    visibilityEl.textContent = current.visibility/1000 + " km";

    const next12Hours = data.list.slice(0, 12);
    const hourlyLabels = next12Hours.map(item => new Date(item.dt * 1000).getHours() + ":00");
    const hourlyTemps = next12Hours.map(item => item.main.temp);

    if(hourlyChart) hourlyChart.destroy();
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyLabels,
            datasets: [{
                label: 'Next 12 Hours',
                data: hourlyTemps,
                borderColor: 'orange',
                backgroundColor: 'rgba(255,165,0,0.2)',
            }]
        }
    });

    const next5Days = [];
    const dailyLabels = [];
    for(let i=0; i<5; i++){
        const day = data.list[i*8];
        next5Days.push(day.main.temp);
        dailyLabels.push(new Date(day.dt * 1000).toISOString().slice(0,10));
    }

    if(dailyChart) dailyChart.destroy();
    const ctx2 = document.getElementById('dailyChart').getContext('2d');
    dailyChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: dailyLabels,
            datasets: [{
                label: '5-Day Forecast',
                data: next5Days,
                borderColor: 'orange',
                backgroundColor: 'rgba(255,165,0,0.2)',
            }]
        }
    });
}

function updateBackground(weatherCondition) {
    let gradient;
    const body = document.body;

    switch (weatherCondition) {
        case 'Clear':
            gradient = 'linear-gradient(to bottom, #47b5ff, #87ceeb)'; // Bright blue sky
            break;
        case 'Clouds':
            gradient = 'linear-gradient(to bottom, #646f7a, #8a97a7)'; // Overcast grey
            break;
        case 'Rain':
        case 'Drizzle':
            gradient = 'linear-gradient(to bottom, #4c5a69, #6d7b8d)'; // Rainy grey-blue
            break;
        case 'Thunderstorm':
            gradient = 'linear-gradient(to bottom, #2c3e50, #465a70)'; // Stormy dark blue
            break;
        case 'Snow':
            gradient = 'linear-gradient(to bottom, #e6e9f0, #eef1f5)'; // Snowy light grey
            break;
        default: // For Mist, Smoke, Haze, Dust, Fog, Sand, Ash, Squall, Tornado
            gradient = 'linear-gradient(to bottom, #bdc3c7, #d7dbdf)'; // Muted grey
    }
    body.style.background = gradient;
}

function updateWeatherEffects(weatherCondition, weatherDescription) {
    const container = document.getElementById('weather-effects-container');
    container.innerHTML = ''; // Clear previous effects

    switch (weatherCondition) {
        case 'Clear':
            const sun = document.createElement('div');
            sun.className = 'sun';
            container.appendChild(sun);
            break;
        case 'Clouds':
            for (let i = 0; i < 5; i++) { // Create 5 clouds
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                // Base size
                cloud.style.width = '200px';
                cloud.style.height = '60px';
                // Randomize position, size, and speed
                cloud.style.top = `${10 + Math.random() * 50}%`;
                cloud.style.transform = `scale(${0.5 + Math.random()})`;
                cloud.style.animationDuration = `${20 + Math.random() * 30}s`;
                container.appendChild(cloud);
            }
            break;
        case 'Rain':
        case 'Drizzle':
            let rainCount = 100; // Default for moderate rain
            if (weatherDescription.includes('heavy') || weatherDescription.includes('extreme')) {
                rainCount = 200;
            } else if (weatherDescription.includes('light')) {
                rainCount = 50;
            }

            for (let i = 0; i < rainCount; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + 'vw';
                drop.style.animationDelay = Math.random() * 2 + 's';
                drop.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
                container.appendChild(drop);
            }

            // Add occasional lightning based on rain intensity
            if (weatherDescription.includes('heavy') || weatherDescription.includes('extreme')) {
                const lightning = document.createElement('div');
                lightning.className = 'lightning';
                lightning.style.animationDuration = '6s'; // More frequent lightning for heavy rain
                container.appendChild(lightning);
            }if (!weatherDescription.includes('light')) { // For moderate rain
                const lightning = document.createElement('div');
                lightning.className = 'lightning';
                lightning.style.animationDuration = '12s'; // Less frequent lightning
                container.appendChild(lightning);
            }
            break;
        case 'Thunderstorm':
            let stormRainCount = 150; // Default for thunderstorm
            if (weatherDescription.includes('heavy')) {
                stormRainCount = 250;
            }

            for (let i = 0; i < stormRainCount; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + 'vw';
                drop.style.animationDelay = Math.random() * 1.5 + 's';
                drop.style.animationDuration = (0.4 + Math.random() * 0.4) + 's';
                container.appendChild(drop);
            }

            const lightning = document.createElement('div');
            lightning.className = 'lightning';
            // Make lightning more frequent for heavy thunderstorms, less for light ones
            if (weatherDescription.includes('light') || weatherDescription.includes('drizzle')) {
                lightning.style.animationDuration = '10s';
            }
            container.appendChild(lightning);
            break;
    }
}
