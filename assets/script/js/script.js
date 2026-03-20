import { AppConfig } from './config.js';

/**
 * Configuration & Constants
 */
const CONFIG = {
    API: {
        METEO: "https://api.open-meteo.com/v1/forecast",
        GEOCODE: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        MAP_TILE: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    REFRESH_INTERVAL: 15 * 60 * 1000, // 15 Menit
    DEFAULT_COORDS: {
        lat: 51.505,
        lon: -0.09
    }
};

/**
 * Module: UI & Theme Manager
 */
const UIManager = {
    init() {
        this.initTheme();
        this.initDynamicBackground();
        this.initClock();
        this.loadPanelState();
        this.setupEventListeners();
    },

    async initDynamicBackground() {
        try {
            document.body.style.backgroundImage = `url('${AppConfig.UI.BG_URL}')`;
        } catch (error) {
            console.warn("Dynamic Background Error:", error);
            document.documentElement.style.removeProperty('--text-color');
        }
    },

    applyTextColor(brightness) {
        const root = document.documentElement;
        const {
            LUMINANCE_THRESHOLD,
            COLOR_DARK,
            COLOR_LIGHT
        } = AppConfig.UI;

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
            const clockEl = document.querySelector('.clock');
            if (clockEl) clockEl.innerHTML = `${timeString} <span class='clock-period'>${period}</span>`;
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
        const infoModal = document.getElementById('infoModal');
        if (infoModal) {
            infoModal.addEventListener('shown.bs.modal', function () {
                // 1. Ambil data koordinat dari widget
                const btnWrapper = document.querySelector('app-weather-widget app-button');
                // 2. Cari komponen peta kita
                const mapComponent = document.getElementById('infoMaps'); 
                
                if (btnWrapper && mapComponent) {
                    const lat = btnWrapper.getAttribute('data-latitude');
                    const lon = btnWrapper.getAttribute('data-longitude');
                    
                    if (lat && lon) {
                        // KEAJAIBAN WEB COMPONENT: 
                        // Cukup set atributnya, maka peta akan otomatis merender dirinya sendiri!
                        mapComponent.setAttribute('latitude', lat);
                        mapComponent.setAttribute('longitude', lon);
                        
                        // Panggil perbaikan ukuran karena peta muncul dari dalam Modal tersembunyi
                        if (typeof mapComponent.invalidateMapSize === 'function') {
                            mapComponent.invalidateMapSize();
                        }
                    }
                }
            });
        }
    },
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
            const response = await fetch(`${AppConfig.WEATHER.API_METEO}?${params}`);
            if (!response.ok) throw new Error('Weather API Error');
            const data = await response.json();

            // Di dalam WeatherService.fetchWeather:
            const widget = document.getElementById('weather-panel');
            const details = document.querySelector('app-weather-details');

            // Tambahkan lat, lon saat memanggil widget.updateData
            if (widget && widget.updateData) widget.updateData(data.current, data.current_units, lat, lon);
            if (details && details.updateData) details.updateData(data.current, data.hourly, data.daily, data.current_units);

        } catch (err) {
            console.error('Weather Fetch Error:', err);
            // Tangkap komponen widget dan tampilkan error ke layar pengguna
            const widget = document.getElementById('weather-panel');
            if (widget && widget.showError) {
                widget.showError("Periksa koneksi internetmu atau coba lagi nanti.");
            }
        }
    },

    async fetchLocationName(lat, lon) {
        try {
            const url = `${AppConfig.WEATHER.API_GEOCODE}?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Geocode API Error: ${response.status}`);
            
            const data = await response.json();
            const cityName = data.city || data.locality || data.principalSubdivision || 'Lokasi';
            const fullLocation = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`;

            // KODE BARU (Vanilla JS)
            const locInfo = document.getElementById('location-info');
            const infoLoc = document.getElementById('infoLocation');
            const infoLat = document.getElementById('infoLatitude');
            const infoLon = document.getElementById('infoLongitude');

            if (locInfo) locInfo.innerHTML = `<i class="bi bi-geo"></i> ${cityName}`;
            if (infoLoc) infoLoc.textContent = fullLocation;
            if (infoLat) infoLat.textContent = lat;
            if (infoLon) infoLon.textContent = lon;

            // Catatan: Baris $('#btnInfo').attr(...) kita HAPUS total!
            // Karena kita sudah menangani datanya di app-weather-widget

        } catch (err) {
            console.error('Location Fetch Error:', err);
            const locInfo = document.getElementById('location-info');
            if (locInfo) locInfo.innerHTML = `<i class="bi bi-geo-alt-fill"></i> Gagal Memuat Lokasi`;
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
        }, AppConfig.WEATHER.REFRESH_INTERVAL);
    }
};

// Start Application
$(document).ready(() => App.init());