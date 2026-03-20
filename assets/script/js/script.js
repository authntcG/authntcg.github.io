/**
 * Configuration & Constants
 */
import { Utils } from './utils.js';

const CONFIG = {
    API: {
        METEO: "https://api.open-meteo.com/v1/forecast",
        GEOCODE: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        MAP_TILE: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    REFRESH_INTERVAL: 15 * 60 * 1000, // 15 Menit
    DEFAULT_COORDS: { lat: 51.505, lon: -0.09 }
};

/**
 * Module: UI & Theme Manager
 */
const UIManager = {
    BG_CONFIG: {
        URL: 'https://picsum.photos/1920/1080',
        LUMINANCE_THRESHOLD: 128,
        COLOR_DARK: '#000000', // Teks hitam untuk background terang
        COLOR_LIGHT: '#ffffff' // Teks putih untuk background gelap
    },
    
    init() {
        this.initTheme();
        this.initDynamicBackground();
        this.initClock();
        this.loadPanelState();
        this.setupEventListeners();
    },

    async initDynamicBackground() {
        try {
            document.body.style.backgroundImage = `url('${this.BG_CONFIG.URL}')`;
        } catch (error) {
            console.warn("Dynamic Background Error:", error);
            document.documentElement.style.removeProperty('--text-color');
        }
    },

    applyTextColor(brightness) {
        const root = document.documentElement;
        const { LUMINANCE_THRESHOLD, COLOR_DARK, COLOR_LIGHT } = this.BG_CONFIG;

        const textColor = brightness > LUMINANCE_THRESHOLD ? COLOR_DARK : COLOR_LIGHT;
        
        root.style.setProperty('--text-color', textColor);
        console.log(`Background Brightness: ${brightness.toFixed(0)}. Text Color: ${textColor}`);
    },

    initTheme() {
        const updateTheme = () => {
            const html = document.querySelector("html");
            if (html.getAttribute("data-bs-theme") === 'auto') {
                const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                html.setAttribute("data-bs-theme", theme);
            }
        };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
        updateTheme();
    },

    initClock() {
        const update = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: false
            });
            const period = now.getHours() >= 12 ? 'PM' : 'AM';
            $(".clock").html(`${timeString} <span class='clock-period'>${period}</span>`);
        };
        update();
        setInterval(update, 1000);
    },

    loadPanelState() {
        const panels = [{
                switch: 'switchWeatherPanel',
                panel: 'weather-panel',
                key: 'isWeatherHidden'
            },
            {
                switch: 'switchSuggestionPanel',
                panel: 'suggestion-panel',
                key: 'isSuggestionHidden'
            }
        ];

        panels.forEach(({
            switch: swId,
            panel: pId,
            key
        }) => {
            const switchEl = document.getElementById(swId);
            const panelEl = document.getElementById(pId);
            const isHidden = sessionStorage.getItem(key) === 'true';

            if (switchEl && panelEl) {
                switchEl.checked = isHidden;
                panelEl.toggleAttribute('hidden', isHidden);

                switchEl.addEventListener('change', () => {
                    const hidden = switchEl.checked;
                    panelEl.toggleAttribute('hidden', hidden);
                    sessionStorage.setItem(key, hidden);
                });
            }
        });
    },

    setupEventListeners() {
        $('#infoModal').on('shown.bs.modal', function () {
            const btn = document.getElementById('btnInfo');
            MapManager.show(parseFloat(btn.dataset.latitude), parseFloat(btn.dataset.longitude));
        });
    },

    updateWeatherUI(current, hourly, daily, units) {
        const weatherMeta = Utils.getWeatherMeta(current.weather_code);
        const windDir = Utils.getWindDirection(current.wind_direction_10m);
        const todayUV = Utils.getUVInfo(daily.uv_index_max[0]);

        // Helper untuk update HTML
        const setHtml = (id, html) => $(id).html(html);

        // Update Header Info
        setHtml('#current-temp-data', `<strong>${current.temperature_2m}${units.temperature_2m}</strong>, terasa <strong>${current.apparent_temperature}${units.apparent_temperature}</strong>`);
        setHtml('#weather-precipitation', `<i class="bi bi-info"></i> ${weatherMeta.msg}`);
        setHtml('#wind-info', `<i class="bi bi-wind"></i> ${current.wind_speed_10m} ${units.wind_speed_10m} (${windDir})`);
        setHtml('#weather-icons', `<p class="${weatherMeta.icon} text-center" style="font-size: 10vh; margin-bottom: -15px; font-weight: lighter !important;"></p>`);
        setHtml('#weather-name', weatherMeta.msg);

        // Update Carousel
        setHtml('#carousel-content', `
            <div class="carousel-item active">
                <div class="d-flex flex-column"><small>Angin</small><div>${current.wind_speed_10m} ${units.wind_speed_10m} ${windDir}</div></div>
            </div>
            <div class="carousel-item">
                <div class="d-flex flex-column"><small>Saran</small><div>${weatherMeta.advice}</div></div>
            </div>
        `);

        // Update Summary
        setHtml('#weather-summary', `
            <h6>Hari Ini</h6><p>${weatherMeta.msg}. Suhu ${current.temperature_2m}°C. UV: ${todayUV.scale}.</p>
            <h6>Saran</h6><p>${weatherMeta.advice}</p>
        `);

        // Render Hourly Table (Only current day, current hour forward)
        const currentHour = new Date().getHours();
        const hourlyRows = hourly.time.map((time, i) => {
            const date = new Date(time);
            if (date.getDate() !== new Date().getDate() || date.getHours() < currentHour) return '';

            const meta = Utils.getWeatherMeta(hourly.weather_code[i]);
            const isNow = date.getHours() === currentHour ? 'bg-warning' : '';

            return `
                <td class="text-center ${isNow}">
                    <div class="row">
                        <small style="font-size: 2vh;">${date.getHours()}:00</small>
                        <i class="${meta.icon}" style="font-size: 5vh;"></i>
                        <p class="m-0">${hourly.temperature_2m[i]} ${units.temperature_2m}</p>
                    </div>
                </td>`;
        }).join('');
        $("#hourly-forecast-table tbody").html(hourlyRows);

        // Render Daily Table
        const dailyRows = daily.time.map((time, i) => {
            const meta = Utils.getWeatherMeta(daily.weather_code[i]);
            const dateStr = new Date(time).toLocaleDateString("id-ID", {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td><i class="${meta.icon}"></i> ${meta.msg}</td>
                    <td>${daily.temperature_2m_min[i]}°</td>
                    <td>${daily.temperature_2m_max[i]}°</td>
                </tr>`;
        }).join('');
        $("#daily-forecast-table tbody").html(dailyRows);
    }
};

/**
 * Module: Map Manager
 */
const MapManager = {
    instance: null,
    marker: null,
    circle: null,

    show(lat, lon) {
        if (!this.instance) {
            this.instance = L.map('infoMaps').setView([lat, lon], 15);
            L.tileLayer(CONFIG.API.MAP_TILE, {
                attribution: '&copy; OpenStreetMap'
            }).addTo(this.instance);

            this.marker = L.marker([lat, lon]).addTo(this.instance);
            this.circle = L.circle([lat, lon], {
                color: '#1b00ff',
                fillOpacity: 0.3,
                radius: 100
            }).addTo(this.instance);
        } else {
            this.instance.setView([lat, lon], 15);
            this.marker.setLatLng([lat, lon]);
            this.circle.setLatLng([lat, lon]);
        }

        // Fix Leaflet sizing inside modal
        setTimeout(() => this.instance.invalidateSize(), 200);
    }
};

/**
 * Module: Data Service (Weather & Location)
 */
const WeatherService = {
    async fetchWeather(lat, lon) {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m',
            hourly: 'temperature_2m,weather_code,uv_index', 
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
            timezone: 'auto'
        });

        try {
            const response = await fetch(`${CONFIG.API.METEO}?${params}`);
            if (!response.ok) throw new Error('Weather API Error');
            const data = await response.json();

            UIManager.updateWeatherUI(data.current, data.hourly, data.daily, data.current_units);
        } catch (err) {
            console.error(err);
        }
    },

    async fetchLocationName(lat, lon) {
        try {
            const url = `${CONFIG.API.GEOCODE}?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
            
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`Geocode API Error: ${response.status}`);
            
            const data = await response.json();
            const cityName = data.city || data.locality || data.principalSubdivision || 'Lokasi';
            const fullLocation = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`;

            $('#location-info').html(`<i class="bi bi-geo"></i> ${cityName}`);
            $('#infoLocation').text(fullLocation);
            
            $('#infoLatitude').text(lat);
            $('#infoLongitude').text(lon);
            $('#btnInfo').attr('data-latitude', lat).attr('data-longitude', lon);

        } catch (err) {
            console.error('Location Fetch Error:', err);
            $('#location-info').html(`<i class="bi bi-geo-alt-fill"></i> Gagal Memuat Lokasi`);
        }
    }
};

/**
 * Main App Controller
 */
const App = {
    init() {
        UIManager.init();
        this.startGeoTracking();
    },

    startGeoTracking() {
        if (!navigator.geolocation) return console.error("Geolocation not supported");

        const updatePosition = (position) => {
            const {
                latitude,
                longitude
            } = position.coords;
            WeatherService.fetchWeather(latitude, longitude);
            WeatherService.fetchLocationName(latitude, longitude);
        };

        // First run
        navigator.geolocation.getCurrentPosition(updatePosition, err => console.error(err));

        // Interval run
        setInterval(() => {
            navigator.geolocation.getCurrentPosition(updatePosition, err => console.error(err));
        }, CONFIG.REFRESH_INTERVAL);
    }
};

// Start Application
$(document).ready(() => App.init());