// Initiator variable
var maps;
var marker;
var radius;
var latitude;
var longitude;

// Fungsi untuk memperbarui jam setiap detik
function updateClock() {
    const currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes().toString().padStart(2, '0'); // Tambahkan 0 di depan jika kurang dari 10
    let seconds = currentTime.getSeconds().toString().padStart(2, '0'); // Tambahkan 0 di depan jika kurang dari 10
    const period = hours >= 12 ? 'PM' : 'AM'; // Tentukan AM/PM
    hours = hours % 12 || 12; // Ubah ke format 12 jam, dan ganti 0 menjadi 12

    // Perbarui elemen clock
    $(".clock").html(`${hours}:${minutes}:${seconds} <span class='clock-period'>${period}</span>`);
}

// Panggil fungsi updateClock setiap detik
$(document).ready(function () {
    updateClock(); // Jalankan sekali saat halaman dimuat
    setInterval(updateClock, 1000); // Jalankan setiap detik
});

// Bootstrap Auto Theme
(function () {
    const htmlElement = document.querySelector("html")
    if (htmlElement.getAttribute("data-bs-theme") === 'auto') {
        function updateTheme() {
            document.querySelector("html").setAttribute("data-bs-theme",
                window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
        updateTheme()
    }
})();

// Save State
function saveState() {
    sessionStorage.setItem('isWeatherPanelHidden', switchWeatherPanel.checked);
    sessionStorage.setItem('isSuggestionPanelHidden', switchSuggestionPanel.checked);
}

// Load State
const weatherPanel = document.getElementById('weather-panel');
const suggestionPanel = document.getElementById('suggestion-panel');

function loadState() {
    const isHiddenWeather = sessionStorage.getItem('isWeatherPanelHidden') === 'true';
    const isHiddenSuggestion = sessionStorage.getItem('isSuggestionPanelHidden') === 'true';

    switchWeatherPanel.checked = isHiddenWeather;
    switchSuggestionPanel.checked = isHiddenSuggestion;

    weatherPanel.toggleAttribute('hidden', isHiddenWeather);
    suggestionPanel.toggleAttribute('hidden', isHiddenSuggestion);
}

// Switch Weather Panel
const switchWeatherPanel = document.getElementById('switchWeatherPanel');
const switchSuggestionPanel = document.getElementById('switchSuggestionPanel');

function togglePanel(switchElement, panelElement) {
    panelElement.toggleAttribute('hidden', switchElement.checked);
    saveState();
}

switchWeatherPanel.addEventListener('change', function () {
    togglePanel(switchWeatherPanel, weatherPanel);
});

switchSuggestionPanel.addEventListener('change', function () {
    togglePanel(switchSuggestionPanel, suggestionPanel);
});

// Load Data From Sessions
window.addEventListener('load', loadState);

// Function to hide preload page
function hidePreload() {
    document.getElementById('preload').classList.add('preload-hidden');
}

function animateProgressBar() {
    const loadingBar = document.getElementById('loading-bar');
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 90) {
            progress += 1;
            loadingBar.value = progress;
        } else {
            clearInterval(interval);
        }
    }, 15); // Adjust the interval to control the speed
}

// Loading animation sections
window.addEventListener('load', hidePreload);
document.onreadystatechange = function () {
    const loadingBar = document.getElementById('loading-bar');
    if (document.readyState === 'interactive') {
        animateProgressBar();
    } else if (document.readyState === 'complete') {
        loadingBar.value = 100;
        hidePreload();
    }
};

// Visibility Sections
function convertVisibilityValue(visibility) {
    return visibility / 100;
}

// UV Sections
function getUVIndexInfo(uvIndex) {
    const uvInfo = [
        { range: [0, 2], scale: "Rendah", recommendation: "Paparan sinar UV minimal, Anda dapat berada di luar ruangan tanpa perlindungan tambahan, tetapi tetap gunakan kacamata hitam jika perlu." },
        { range: [3, 5], scale: "Sedang", recommendation: "Paparan sinar UV sedang. Gunakan tabir surya, kacamata hitam, dan perlindungan tambahan jika beraktivitas lama di luar ruangan." },
        { range: [6, 7], scale: "Tinggi", recommendation: "Paparan sinar UV tinggi. Gunakan perlindungan penuh seperti tabir surya, pakaian pelindung, dan topi. Hindari berada di luar ruangan pada tengah hari." },
        { range: [8, 10], scale: "Sangat Tinggi", recommendation: "Paparan sinar UV sangat tinggi. Gunakan perlindungan maksimum, hindari paparan langsung. Sebaiknya tetap berada di tempat teduh." },
        { range: [11, Infinity], scale: "Ekstrem", recommendation: "Paparan sinar UV ekstrem. Sangat penting untuk menghindari paparan sinar matahari langsung. Gunakan perlindungan maksimal (tabir surya, pakaian pelindung, topi, dan kacamata hitam)." }
    ];

    const { scale, recommendation } = uvInfo.find(info => uvIndex >= info.range[0] && uvIndex <= info.range[1]) || { scale: "Tidak valid", recommendation: "Nilai UV tidak valid. Pastikan nilai UV yang dimasukkan benar." };

    return { uvScale: scale, recommendation };
}

// Days Sections 
function getDayName(dayIndex) {
    const days = ['Hari ini', 'Besok', 'Lusa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || "Hari ke-" + (dayIndex + 1);
}

// Weather sections 
function getWindDirection(degree) {
    const directions = [
        "Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"
    ];

    degree = (degree + 22.5) % 360; // Tambahkan offset dan pastikan derajat dalam rentang 0-360
    const index = Math.floor(degree / 45); // Dapatkan indeks berdasarkan pembagian 45 derajat
    return directions[index];
}

function setWeatherData(weatherCode) {
    // Definisi ikon dan pesan cuaca berdasarkan kode cuaca
    const weatherData = {
        0: { icon: 'bi-sun', message: 'Cerah sepanjang hari.', advice: 'Nikmati hari cerah, pakai tabir surya jika beraktivitas di luar ruangan.' },
        1: { icon: 'bi-cloud-sun', message: 'Sebagian berawan.', advice: 'Bawa kacamata hitam dan topi, berawan sebagian.' },
        2: { icon: 'bi-cloud', message: 'Berawan.', advice: 'Bawa kacamata hitam dan topi, berawan sebagian.' },
        3: { icon: 'bi-clouds', message: 'Sangat berawan.', advice: 'Hari akan sangat berawan, bawa jaket jika Anda sensitif dengan angin.' },
        45: { icon: 'bi-cloud-fog', message: 'Kabut.' },
        48: { icon: 'bi-cloud-fog', message: 'Kabut tebal.' },
        51: { icon: 'bi-cloud-drizzle', message: 'Gerimis ringan.', advice: 'Persiapkan payung atau jas hujan karena hujan ringan diperkirakan.' },
        53: { icon: 'bi-cloud-drizzle', message: 'Gerimis sedang.' },
        55: { icon: 'bi-cloud-drizzle', message: 'Gerimis berat.' },
        61: { icon: 'bi-cloud-rain', message: 'Hujan ringan.', advice: 'Persiapkan payung atau jas hujan karena hujan ringan diperkirakan.' },
        63: { icon: 'bi-cloud-rain', message: 'Hujan sedang.', advice: 'Hujan sedang, kurangi aktivitas luar ruangan jika memungkinkan.' },
        65: { icon: 'bi-cloud-rain-heavy', message: 'Hujan berat.' },
        80: { icon: 'bi-cloud-rain', message: 'Hujan ringan deras.', advice: 'Hujan sedang, kurangi aktivitas luar ruangan jika memungkinkan.' },
        81: { icon: 'bi-cloud-rain-heavy', message: 'Hujan sedang deras.' },
        82: { icon: 'bi-cloud-rain-heavy', message: 'Hujan berat deras.' },
        95: { icon: 'bi-cloud-lightning', message: 'Badai petir ringan.', advice: 'Badai petir ringan, hindari area terbuka jika memungkinkan.' },
        96: { icon: 'bi-cloud-lightning-rain', message: 'Badai petir dengan hujan ringan.', advice: 'Badai petir ringan, hindari area terbuka jika memungkinkan.' },
        99: { icon: 'bi-cloud-lightning-rain', message: 'Badai petir dengan hujan berat.' }
    };

    // Gunakan data berdasarkan weatherCode, atau data default jika tidak ada
    const { icon = 'bi-question-circle', message = 'Data cuaca tidak tersedia.', advice = 'Tidak ada saran khusus.' } = weatherData[weatherCode] || {};

    return {
        iconClass: icon,
        message,
        adviceMessage: `<ul><li>${advice}</li></ul>`
    };
}

function fetchWeatherData(lat, lon) {
    $.ajax({
        url: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum`,
        type: "GET",
        success: function ({ current: values, current_units: units, hourly, daily }) {
            const today = new Date().toISOString().split('T')[0];
            const currentHour = new Date().getHours();

            let rainStartHour = null, rainEndHour = null, isClearAllDay = true, weatherMessage = "Cuaca tidak diketahui.";
            hourly.precipitation.forEach((precipitation, i) => {
                if (precipitation > 0) {
                    rainStartHour = rainStartHour ?? new Date(hourly.time[i]).getHours();
                    rainEndHour = new Date(hourly.time[i]).getHours();
                    isClearAllDay = false;
                }
            });

            if (isClearAllDay) weatherMessage = "Cerah sepanjang hari.";
            else if (rainStartHour !== null) {
                weatherMessage = (rainStartHour === rainEndHour) 
                    ? `Hujan akan turun pukul ${rainStartHour}:00.` 
                    : `Hujan mulai pukul ${rainStartHour}:00 hingga ${rainEndHour}:00, selama ${rainEndHour - rainStartHour + 1} jam.`;
            }

            const winddir = getWindDirection(values.wind_direction_10m);
            const weatherdata = setWeatherData(values.weather_code);
            const todaySummary = `
                Hari ini cuaca diperkirakan ${weatherdata.message}.
                Suhu saat ini ${values.temperature_2m}°C, terasa seperti ${values.apparent_temperature}°C.
                Kecepatan angin ${values.wind_speed_10m} km/jam ke arah ${winddir}.
                Indeks UV maksimum hari ini ${daily.uv_index_max[0]} (${getUVIndexInfo(daily.uv_index_max[0]).uvScale}).
            `;

            const weeklySummary = `<ul>` +
                daily.weather_code.map((code, index) => `
                    <li>${getDayName(index)}: ${setWeatherData(code).message}, suhu ${daily.temperature_2m_min[index]}°C - ${daily.temperature_2m_max[index]}°C. 
                    Indeks UV maksimal: ${daily.uv_index_max[index]}. ${getUVIndexInfo(daily.uv_index_max[index]).recommendation}</li>
                `).join('') + `</ul>`;

            const updateHTML = (selector, content) => $(selector).html(content);

            updateHTML('#current-temp-data', `<strong>${values.temperature_2m}${units.temperature_2m}</strong>, terasa seperti <strong>${values.apparent_temperature}${units.apparent_temperature}</strong>`);
            updateHTML('#weather-precipitation', `<i class="bi bi-info"></i>${weatherMessage}`);
            updateHTML('#wind-info', `<i class="bi bi-wind"></i> Kecepatan angin ${values.wind_speed_10m} ${units.wind_speed_10m} ke arah ${winddir}`);
            updateHTML('#weather-icons', `<p class="${weatherdata.iconClass} text-center" style="font-size: 10vh; margin-bottom: -15px; font-weight: lighter !important;"></p>`);
            updateHTML('#weather-name', `${weatherdata.message}`);
            updateHTML('#carousel-content', `
                <div class="carousel-item active">
                    <div class="d-flex flex-column">
                        <small><i class="bi bi-info"></i> Wind Speed & Directions</small>
                        <div><i class="bi bi-wind"></i> Kecepatan angin ${values.wind_speed_10m} ${units.wind_speed_10m} ke arah ${winddir}</div>
                    </div>
                </div>
                <div class="carousel-item">
                    <div class="d-flex flex-column">
                        <small><i class="bi bi-info"></i> Precautions</small>
                        <div>${weatherMessage}</div>
                    </div>
                </div>
            `);

            const tableHourly = $("#hourly-forecast-table tbody").empty();
            hourly.time.forEach((time, index) => {
                const date = new Date(time);
                if (date.toISOString().split('T')[0] === today) {
                    const hour = date.getHours();
                    const formattedHour = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    const weatherHourly = setWeatherData(hourly.weather_code[index]);
                    const tempHourly = hourly.temperature_2m[index];
                    const highlightClass = (hour === currentHour) ? 'bg-warning' : '';
                    tableHourly.append(`
                        <td class="text-center ${highlightClass}">
                            <div class="row">
                                <small style="font-size: 2vh; font-weight: lighter;">${formattedHour}</small>
                                <i class="${weatherHourly.iconClass}" style="font-size: 5vh;"></i>
                                <p class="m-0 p-0">${tempHourly}</p>
                                <p>${units.temperature_2m}</p>
                            </div>
                        </td>
                    `);
                }
            });

            const tableDaily = $("#daily-forecast-table tbody").empty();
            daily.time.forEach((day, index) => {
                const day_ = new Date(day).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
                const weatherDaily = setWeatherData(daily.weather_code[index]);
                const highlightClass = (today === day) ? 'bg-primary' : '';
                tableDaily.append(`
                    <tr>
                        <td class="${highlightClass}">${day_}</td>
                        <td class="${highlightClass}"><i class="${weatherDaily.iconClass}"></i> ${weatherDaily.message}</td>
                        <td class="${highlightClass}">${daily.temperature_2m_min[index]} ${units.temperature_2m}</td>
                        <td class="${highlightClass}">${daily.temperature_2m_max[index]} ${units.temperature_2m}</td>
                    </tr>
                `);
            });

            updateHTML('#weather-summary', `
                <h6>Cuaca Hari Ini</h6><p>${todaySummary}</p>
                <h6>Saran Untuk Hari Ini</h6><p>${weatherdata.adviceMessage}</p>
                <h6>Cuaca 7 Hari Mendatang</h6><p>${weeklySummary}</p>
            `);
        },
        error: error => console.error("Error fetching weather data:", error)
    });
}

// Get location coordinate
function getGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

                if (latitude, longitude) {
                    fetchWeatherData(latitude, longitude);
                    getLocationInfo(latitude, longitude);

                    $('#btnInfo').attr('data-latitude', latitude).attr('data-longitude', longitude);
                }
            },
            function (error) {
                console.error(error.message);
            }
        );
    } else {
        console.error('Cannot get geolocation data!');
    }
}

// Get location data usin nominatim api
function getLocationInfo(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    
    $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
            const { display_name, address: addr } = data;
            
            // Menampilkan informasi lokasi
            $('#location-info').html(`<i class="bi bi-geo"></i> ${addr.village}, ${addr.city}`);
            $('#infoLocation').html(display_name);
            $('#infoLatitude').html(lat);
            $('#infoLongitude').html(lon);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(`Error fetching data: ${textStatus}, ${errorThrown}`);
        }
    });
}

// Maps information
function showMaps(lat, lon) {
    if (!maps) {
        maps = L.map('infoMaps').setView([51.505, -0.09], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(maps);

        maps.setView([lat, lon], 20);
        marker = L.marker([lat, lon]).addTo(maps);
        radius = L.circle([lat, lon], {
            color: '#1b00ff',
            fillColor: '#1b00ff',
            fillOpacity: 0.3,
            radius: 50
        }).addTo(maps);
    } else {
        if ((latitude === lat) && (longitude === lon)) {
            maps.setView([lat, lon], 20);
            radius = L.circle([lat, lon], {
                color: '#1b00ff',
                fillColor: '#1b00ff',
                fillOpacity: 0.3,
                radius: 50
            }).addTo(maps);
            marker.setLatLng([lat, lon]);
        } else {
            maps.setView([lat, lon], 20);
        }
    }
}

// Event info modal clicked
$('#infoModal').on('shown.bs.modal', function () {
    const data_btn = document.getElementById('btnInfo');
    const lat = data_btn.dataset.latitude;
    const lon = data_btn.dataset.longitude;

    showMaps(lat, lon); // Panggil fungsi showMaps untuk menampilkan peta

    // Memastikan peta diperbarui sesuai ukuran kontainer
    setTimeout(function () {
        maps.invalidateSize();
    }, 200);
});

$(document).ready(function () {
    getGeoLocation();

    // Set interval untuk merefresh data setiap 15 menit (900000 ms)
    setInterval(getGeoLocation, 900000); // 15 menit dalam milidetik
});