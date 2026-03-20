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
            // Cari tag <app-button> yang ada di dalam widget cuaca
            const btnWrapper = document.querySelector('app-weather-widget app-button');
            
            if (btnWrapper) {
                // Ambil koordinat langsung dari atribut 'wrapper' Web Component-nya
                const lat = parseFloat(btnWrapper.getAttribute('data-latitude'));
                const lon = parseFloat(btnWrapper.getAttribute('data-longitude'));
                
                // Pastikan datanya valid (bukan NaN) sebelum memanggil peta
                if (!isNaN(lat) && !isNaN(lon)) {
                     MapManager.show(lat, lon);
                } else {
                     console.warn("Peta tidak dimuat: Koordinat belum tersedia.");
                }
            }
        });
    },
};

/**
 * Module: Map Manager
 */
const MapManager = {
    instance: null,
    marker: null,
    circle: null,

    show(lat, lon) {
        // Hanya inisialisasi jika instance belum ada
        if (this.instance === null) {
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
            // Jika sudah ada, cukup update posisi
            this.instance.setView([lat, lon], 15);
            this.marker.setLatLng([lat, lon]);
            this.circle.setLatLng([lat, lon]);
        }

        // Fix Leaflet sizing inside modal
        setTimeout(() => {
             if (this.instance) this.instance.invalidateSize();
        }, 200);
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

            // Di dalam WeatherService.fetchWeather:
            const widget = document.getElementById('weather-panel');
            const details = document.querySelector('app-weather-details');

            // Tambahkan lat, lon saat memanggil widget.updateData
            if (widget && widget.updateData) widget.updateData(data.current, data.current_units, lat, lon);
            if (details && details.updateData) details.updateData(data.current, data.hourly, data.daily, data.current_units);

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