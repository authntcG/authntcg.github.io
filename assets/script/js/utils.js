// assets/script/js/utils.js

export const Utils = {

    async fetchWeatherData(lat, lon) {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m',
            hourly: 'temperature_2m,weather_code,uv_index',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
            timezone: 'auto'
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!response.ok) throw new Error('Weather API Error');
        return await response.json();
    },

    async fetchLocationData(lat, lon) {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Geocode API Error: ${response.status}`);
        return await response.json();
    },
    getDayName: (index) => ['Hari ini', 'Besok', 'Lusa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][index] || `Hari ke-${index + 1}`,

    getWindDirection: (degree) => {
        const directions = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
        return directions[Math.floor(((degree + 22.5) % 360) / 45)];
    },

    getUVInfo: (uvIndex) => {
        if (uvIndex <= 2) return { scale: "Rendah", recommendation: "Aman di luar ruangan." };
        if (uvIndex <= 5) return { scale: "Sedang", recommendation: "Gunakan tabir surya." };
        if (uvIndex <= 7) return { scale: "Tinggi", recommendation: "Lindungi diri, gunakan topi." };
        if (uvIndex <= 10) return { scale: "Sangat Tinggi", recommendation: "Hindari matahari siang." };
        return { scale: "Ekstrem", recommendation: "Bahaya! Hindari keluar rumah." };
    },

    getWeatherMeta: (code) => {
        const map = {
            0: { icon: 'fluent:weather-sunny-24-filled', msg: 'Cerah', advice: 'Gunakan tabir surya.', bg: 'linear-gradient(to bottom right, #3b82f6, #06b6d4)', anim: 'weather-anim-sun' },
            1: { icon: 'fluent:weather-partly-cloudy-day-24-filled', msg: 'Sebagian Berawan', advice: 'Nyaman untuk beraktivitas.', bg: 'linear-gradient(to bottom right, #60a5fa, #93c5fd)', anim: 'weather-anim-clouds' },
            2: { icon: 'fluent:weather-cloudy-24-filled', msg: 'Berawan', advice: 'Cuaca sejuk.', bg: 'linear-gradient(to bottom right, #9ca3af, #d1d5db)', anim: 'weather-anim-clouds' },
            3: { icon: 'fluent:weather-cloudy-24-filled', msg: 'Mendung', advice: 'Mungkin akan hujan.', bg: 'linear-gradient(to bottom right, #6b7280, #9ca3af)', anim: 'weather-anim-clouds' },
            45: { icon: 'fluent:weather-fog-24-filled', msg: 'Kabut', advice: 'Hati-hati berkendara.', bg: 'linear-gradient(to bottom right, #cbd5e1, #f1f5f9)', anim: 'weather-anim-clouds' },
            51: { icon: 'fluent:weather-drizzle-24-filled', msg: 'Gerimis', advice: 'Siapkan payung.', bg: 'linear-gradient(to bottom right, #64748b, #94a3b8)', anim: 'weather-anim-rain' },
            61: { icon: 'fluent:weather-rain-24-filled', msg: 'Hujan Ringan', advice: 'Bawa payung.', bg: 'linear-gradient(to bottom right, #475569, #64748b)', anim: 'weather-anim-rain' },
            63: { icon: 'fluent:weather-rain-24-filled', msg: 'Hujan Sedang', advice: 'Sebaiknya di dalam ruangan.', bg: 'linear-gradient(to bottom right, #334155, #475569)', anim: 'weather-anim-rain' },
            80: { icon: 'fluent:weather-rain-showers-day-24-filled', msg: 'Hujan Deras', advice: 'Waspada genangan air.', bg: 'linear-gradient(to bottom right, #1e293b, #334155)', anim: 'weather-anim-storm' },
            95: { icon: 'fluent:weather-thunderstorm-24-filled', msg: 'Badai Petir', advice: 'Cari tempat berlindung.', bg: 'linear-gradient(to bottom right, #0f172a, #1e293b)', anim: 'weather-anim-storm' }
        };
        const defaultMeta = { icon: 'fluent:question-24-filled', msg: 'Tidak Diketahui', advice: '-', bg: 'linear-gradient(to bottom right, #6b7280, #9ca3af)', anim: '' };

        if (code >= 51 && code <= 67) return { icon: 'fluent:weather-rain-24-filled', msg: 'Hujan', advice: 'Sedia payung.', bg: 'linear-gradient(to bottom right, #475569, #64748b)', anim: 'weather-anim-rain' };
        if (code >= 80 && code <= 99) return { icon: 'fluent:weather-thunderstorm-24-filled', msg: 'Badai', advice: 'Bahaya.', bg: 'linear-gradient(to bottom right, #0f172a, #1e293b)', anim: 'weather-anim-storm' };

        return map[code] || defaultMeta;
    },
};