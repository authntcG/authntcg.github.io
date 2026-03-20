// assets/script/js/config.js

export const AppConfig = {
    WEATHER: {
        API_METEO: "https://api.open-meteo.com/v1/forecast",
        API_GEOCODE: "https://api.bigdatacloud.net/data/reverse-geocode-client",
        MAP_TILE: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        REFRESH_INTERVAL: 15 * 60 * 1000, // 15 Menit
        DEFAULT_COORDS: { lat: 51.505, lon: -0.09 }
    },

    UI: {
        BG_URL: 'https://picsum.photos/1920/1080',
        LUMINANCE_THRESHOLD: 128,
        COLOR_DARK: '#000000',
        COLOR_LIGHT: '#ffffff'
    }
};