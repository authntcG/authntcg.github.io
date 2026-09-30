/**
 * Inspiro Dashboard App Script
 */

import { Utils } from '../../assets/script/js/utils.js';

const WeatherService = {
    async fetchWeather(lat, lon) {
        try {
            const data = await Utils.fetchWeatherData(lat, lon);
            const widget = document.querySelector('app-weather-widget');
            const details = document.querySelector('app-weather-details');

            if (widget && widget.updateData) widget.updateData(data.current, data.current_units, lat, lon);
            if (details && details.updateData) details.updateData(data.current, data.hourly, data.daily, data.current_units);
        } catch (err) {
            console.error('Weather Fetch Error:', err);
            const widget = document.querySelector('app-weather-widget');
            if (widget && widget.showError) widget.showError("Periksa koneksi internetmu atau coba lagi nanti.");
        }
    },

    async fetchLocationName(lat, lon) {
        try {
            const data = await Utils.fetchLocationData(lat, lon);
            const cityName = data.city || data.locality || data.principalSubdivision || 'Lokasi';
            const fullLocation = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`;

            const locInfo = document.getElementById('location-info');
            const infoLoc = document.getElementById('infoLocation');
            const infoLat = document.getElementById('infoLatitude');
            const infoLon = document.getElementById('infoLongitude');
            
            if (locInfo) locInfo.innerHTML = `<iconify-icon icon="fluent:location-24-regular" class="mr-1"></iconify-icon> ${cityName}`;
            if (infoLoc) infoLoc.textContent = fullLocation;
            if (infoLat) infoLat.textContent = lat;
            if (infoLon) infoLon.textContent = lon;
        } catch (err) {
            console.error('Location Fetch Error:', err);
            const locInfo = document.getElementById('location-info');
            if (locInfo) locInfo.innerHTML = `<iconify-icon icon="fluent:location-off-24-filled" class="mr-1 text-red-500"></iconify-icon> Gagal Memuat Lokasi`;
        }
    }
};

const InspiroApp = {

    init() {
        if (window.self === window.top) {
            document.body.style.backgroundImage = "url('https://picsum.photos/1920/1080')";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            document.body.style.backgroundAttachment = "fixed";
            // Overlay is kept by not removing the background color classes
        }

        this.initClock();
        this.startGeoTracking();
        this.initThemeSync();
        this.initModals();
        this.loadPanelState();
    },

    initClock() {
        const clockEl = document.querySelector('.clock');
        const update = () => {
            if (!clockEl) return;
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            const period = now.getHours() >= 12 ? 'PM' : 'AM';
            clockEl.innerHTML = `${timeString} <span class='clock-period text-blue-500 font-mono text-4xl'>${period}</span>`;
        };
        update();
        setInterval(update, 1000);
    },

    startGeoTracking() {
        if (!navigator.geolocation) {
            const locInfo = document.getElementById('location-info');
            if (locInfo) locInfo.innerHTML = "Geolocation not supported";
            return;
        }

        const updatePosition = (position) => {
            const { latitude, longitude } = position.coords;
            WeatherService.fetchWeather(latitude, longitude);
            WeatherService.fetchLocationName(latitude, longitude);
            
            // Set map coordinates directly
            const mapComponent = document.getElementById('infoMaps');
            if (mapComponent) {
                mapComponent.setAttribute('latitude', latitude);
                mapComponent.setAttribute('longitude', longitude);
            }
        };

        navigator.geolocation.getCurrentPosition(updatePosition, err => console.error(err));
        setInterval(() => navigator.geolocation.getCurrentPosition(updatePosition, err => console.error(err)), 10 * 60 * 1000);
    },
    initThemeSync() {
        // Fallback init
        const savedTheme = localStorage.getItem('authntcg-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-bs-theme', savedTheme);
        } else {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
        }

        // Parent observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-bs-theme') {
                    // Automatically handled by Tailwind darkMode config
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
    },

    initModals() {
        // Vanilla JS Modal Handle
        document.body.addEventListener('click', (e) => {
            const toggle = e.target.closest('[data-bs-toggle="modal"]');
            if (toggle) {
                const targetId = toggle.getAttribute('data-bs-target');
                if (targetId) {
                    const modal = document.querySelector(targetId);
                    if (modal) {
                        modal.classList.remove('hidden');
                        if (targetId === '#infoModal') {
                            const mapComponent = document.getElementById('infoMaps');
                            if (mapComponent && typeof mapComponent.invalidateMapSize === 'function') {
                                setTimeout(() => mapComponent.invalidateMapSize(), 100);
                            }
                        }
                    }
                }
            }
            
            const dismiss = e.target.closest('[data-bs-dismiss="modal"]');
            if (dismiss) {
                const modal = dismiss.closest('[id$="Modal"]');
                if (modal) modal.classList.add('hidden');
            }
        });
    },

    loadPanelState() {
        const panels = [
            { switch: 'switchWeatherPanel', panel: 'weather-panel', key: 'isWeatherHidden' },
            { switch: 'switchSuggestionPanel', panel: 'suggestion-panel', key: 'isSuggestionHidden' }
        ];

        panels.forEach((item) => {
            const toggle = document.getElementById(item.switch);
            const panel = document.getElementById(item.panel);
            if (toggle && panel) {
                const isHidden = localStorage.getItem(item.key) === 'true';
                toggle.checked = isHidden;
                panel.style.display = isHidden ? 'none' : 'block';

                toggle.addEventListener('change', (e) => {
                    const hidden = e.target.checked;
                    panel.style.display = hidden ? 'none' : 'block';
                    localStorage.setItem(item.key, hidden);
                });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => InspiroApp.init());
