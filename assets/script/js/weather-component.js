// assets/script/js/weather-components.js
import {
    Utils
} from './utils.js';

/**
 * Komponen: Kartu Cuaca Utama (Dashboard)
 */
class AppWeatherWidget extends HTMLElement {
    connectedCallback() {
        // Tampilan skeleton/loading awal
        this.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex justify-content-center align-items-center">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
            </div>
        `;
    }

    // Fungsi ini akan dipanggil oleh script.js saat data API sudah siap
    // assets/script/js/weather-components.js (di dalam AppWeatherWidget)
    updateData(current, units, lat, lon) { // Tambahkan parameter lat, lon
        const meta = Utils.getWeatherMeta(current.weather_code);
        const windDir = Utils.getWindDirection(current.wind_direction_10m);

        this.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-12 mb-2">
                        <div class="row">
                            <div class="col-8">
                                <h5 class="display-5">Weather Info</h5>
                            </div>
                            <div class="col-4 d-flex justify-content-end">
                                <app-button extra-class="btn-info-modal" variant="transparent" data-bs-toggle="modal" data-bs-target="#infoModal" data-latitude="${lat}" data-longitude="${lon}">
                                    <i class="bi bi-info-circle-fill"></i>
                                </app-button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8 mb-2">
                        <div class="d-flex justify-content-center align-items-center">
                            <div class="row">
                                <div class="col-12">
                                    <p class="${meta.icon} text-center" style="font-size: 10vh; margin-bottom: -15px; font-weight: lighter !important;"></p>
                                </div>
                                <div class="col">
                                    <h5 class="text-center">${meta.msg}</h5>
                                    <p class="text-center text-capitalize">
                                        <strong>${current.temperature_2m}${units.temperature_2m}</strong>, terasa <strong>${current.apparent_temperature}${units.apparent_temperature}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-4">
                        <div class="row">
                            <div class="col-6 col-sm-6 col-lg-12 px-1 mb-2 d-none d-sm-none d-md-block">
                                <div class="card"><div class="card-body"><p class="m-0"><i class="bi bi-info"></i> ${meta.msg}</p></div></div>
                            </div>
                            <div class="col-6 col-sm-6 col-lg-12 px-1 mb-2 d-none d-sm-none d-md-block">
                                <div class="card"><div class="card-body"><p class="m-0"><i class="bi bi-wind"></i> ${current.wind_speed_10m} ${units.wind_speed_10m} (${windDir})</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

/**
 * Komponen: Rincian Cuaca (Untuk di dalam Modal Info)
 */
class AppWeatherDetails extends HTMLElement {
    updateData(current, hourly, daily, units) {
        const currentHour = new Date().getHours();
        const weatherMeta = Utils.getWeatherMeta(current.weather_code);
        const todayUV = Utils.getUVInfo(daily.uv_index_max[0]);

        const hourlyRows = hourly.time.map((time, i) => {
            const date = new Date(time);
            if (date.getDate() !== new Date().getDate() || date.getHours() < currentHour) return '';
            const meta = Utils.getWeatherMeta(hourly.weather_code[i]);
            const isNow = date.getHours() === currentHour ? 'bg-warning text-dark' : '';
            return `
                <td class="text-center ${isNow}" style="min-width: 80px; border-radius: 10px;">
                    <div class="d-flex flex-column align-items-center">
                        <small style="font-size: 2vh;">${date.getHours()}:00</small>
                        <i class="${meta.icon}" style="font-size: 5vh;"></i>
                        <p class="m-0">${hourly.temperature_2m[i]} ${units.temperature_2m}</p>
                    </div>
                </td>`;
        }).join('');

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

        this.innerHTML = `
            <div class="row">
                <div class="col-12 col-lg-6 mb-2">
                    <div class="card"><div class="card-body">
                        <h6><i class="bi bi-calendar-day"></i> Hari Ini (Per Jam)</h6>
                        <div class="table-responsive mb-2"><table class="table table-borderless"><tbody><tr>${hourlyRows}</tr></tbody></table></div>
                        <h6><i class="bi bi-calendar-week"></i> Mingguan</h6>
                        <div class="table-responsive"><table class="table table-borderless">
                            <thead><tr><th><i class="bi bi-calendar-date"></i></th><th><i class="bi bi-cloud-sun-fill"></i></th><th><i class="bi bi-thermometer-low"></i></th><th><i class="bi bi-thermometer-high"></i></th></tr></thead>
                            <tbody>${dailyRows}</tbody>
                        </table></div>
                    </div></div>
                </div>
                <div class="col-12 col-lg-6 mb-2">
                    <div class="card"><div class="card-body">
                        <h6><i class="bi bi-card-text"></i> Summary</h6>
                        <p>${weatherMeta.msg}. Suhu ${current.temperature_2m}°C. UV: ${todayUV.scale}.</p>
                        <h6>Saran</h6>
                        <p>${weatherMeta.advice}</p>
                    </div></div>
                </div>
            </div>
        `;
    }
}

customElements.define('app-weather-widget', AppWeatherWidget);
customElements.define('app-weather-details', AppWeatherDetails);