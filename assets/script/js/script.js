import {
    AppConfig
} from './config.js';

/**
 * Module: Window Manager (Custom Implementation)
 */
const WindowManager = {
    init() {
        if (!document.getElementById('app-taskbar')) {
            const tb = document.createElement('div');
            tb.id = 'app-taskbar';
            document.body.appendChild(tb);
        }
    },

    /**
     * Fungsi Utama: Membuka jendela baru dengan berbagai kemungkinan (Possibility Handling)
     * @param {Object} options - Konfigurasi jendela
     * @param {string} options.id - ID unik jendela (mencegah duplikasi buka tutup)
     * @param {string} options.title - Judul di header jendela
     * @param {string} options.url - (Opsional) URL untuk mode Iframe (PDF, Web, Blob)
     * @param {string} options.htmlContent - (Opsional) Teks HTML untuk mode Snippet (Gambar, Video, UI)
     */
    openWindow(options) {
        const { id, title, url, htmlContent, width, height, x, y } = options;

        // Cek jika jendela sudah pernah dibuka (hindari duplikat)
        let win = id ? document.getElementById(id) : null;
        if (win) {
            win.style.display = 'block';
            win.style.zIndex = Date.now();
            this.updateTaskbar();
            return;
        }

        // Buat jendela baru
        win = document.createElement('app-window');
        if (id) win.id = id;
        win.setAttribute('title', title || 'New Window');
        if (width) win.setAttribute('width', width);
        if (height) win.setAttribute('height', height);
        if (x) win.setAttribute('x', x);
        if (y) win.setAttribute('y', y);
        
        // Setel konten
        if (url) {
            win.setAttribute('url', url);
        } else if (htmlContent) {
            win.innerHTML = htmlContent;
        }

        document.body.appendChild(win);
        this.updateTaskbar();
    },

    // Contoh 1: Membuka File HTML Eksternal (Iframe)
    // openAbout() {
    //     this.openWindow({
    //         id: 'win-about',
    //         title: 'About Galih Respati',
    //         url: 'about.html',
    //         width: '750px',
    //         height: '550px'
    //     });
    // },

    // Contoh 2: Membuka Jendela dari Potongan HTML (Tanpa Iframe)
    // openSettings() {
    //     this.openWindow({
    //         id: 'win-settings',
    //         title: 'System Settings',
    //         width: '400px',
    //         height: '500px',
    //         htmlContent: `
    //             <div class="p-4" style="color: var(--text-color);">
    //                 <h4><i class="bi bi-sliders"></i> Display Preferences</h4>
    //                 <hr>
    //                 <p>Karena ini adalah potongan HTML, latar belakang jendela ini benar-benar menyatu dengan background utama (Glass Effect sempurna).</p>
                    
    //                 <div class="form-check form-switch mt-3">
    //                     <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked>
    //                     <label class="form-check-label" for="flexSwitchCheckChecked">Enable Glassmorphism</label>
    //                 </div>
    //                 <div class="form-check form-switch mt-2">
    //                     <input class="form-check-input" type="checkbox" id="switch2">
    //                     <label class="form-check-label" for="switch2">Auto Refresh Weather</label>
    //                 </div>

    //                 <button class="btn btn-mica-blue w-100 mt-4" onclick="document.getElementById('win-settings').remove(); WindowManager.updateTaskbar();">
    //                     Save & Close
    //                 </button>
    //             </div>
    //         `
    //     });
    // },

    async openAbout() {
        // Cek dulu apakah jendela sudah ada untuk mencegah fetch berulang
        let win = document.getElementById('win-about');
        if (win) {
            win.style.display = 'block';
            win.style.zIndex = Date.now();
            this.updateTaskbar();
            return;
        }

        try {
            // 1. Ambil isi file about.html
            // Sesuaikan path ini dengan letak file about.html yang kamu buat
            const response = await fetch('about.html'); 
            
            if (!response.ok) throw new Error('Gagal memuat file HTML');
            
            // 2. Ubah respon menjadi teks HTML
            const htmlText = await response.text(); 

            // 3. Buka jendela dengan teks HTML yang baru saja diambil
            this.openWindow({
                id: 'win-about',
                title: 'About Galih Respati',
                width: '750px',
                height: '550px',
                htmlContent: htmlText 
            });

        } catch (error) {
            console.error("Window Load Error:", error);
            // Fallback sederhana jika file gagal dimuat
            this.openWindow({
                id: 'win-about-error',
                title: 'Error',
                width: '300px', height: '200px',
                htmlContent: `<div class="p-4 text-danger">Gagal memuat jendela About.</div>`
            });
        }
    },

    openPDF() {
        this.openWindow({
            id: 'win-cv',
            title: 'CV Galih Respati',
            url: 'https://drive.google.com/file/d/1kvOwc1pDQl5EyGQh9Kmcjpa-XwGpEkeJ/preview',
            width: '800px', height: '600px'
        });
    },

    async openQRGenerator() {
        let win = document.getElementById('win-qr-gen');
        if (win) {
            win.style.display = 'block';
            win.style.zIndex = Date.now();
            this.updateTaskbar();
            return;
        }

        try {
            const response = await fetch('/project/qr-code-generator/index.html'); 
            if (!response.ok) throw new Error('Gagal memuat UI QR Generator');
            const htmlText = await response.text(); 

            this.openWindow({
                id: 'win-qr-gen',
                title: 'QR Code Generator',
                width: '450px', // Lebar dibuat memanjang ke bawah (mirip HP)
                height: '750px',
                htmlContent: htmlText 
            });

            // Panggil file JS khusus untuk menginisialisasi logika QR-nya (Kita akan buat ini selanjutnya)
            setTimeout(() => {
                if (typeof QRGeneratorLogic !== 'undefined') {
                    QRGeneratorLogic.init();
                }
            }, 100);

        } catch (error) {
            console.error("Window Load Error:", error);
        }
    },

    updateTaskbar() {
        const taskbar = document.getElementById('app-taskbar');
        const windows = document.querySelectorAll('.app-window-instance');
        taskbar.innerHTML = '';

        windows.forEach(win => {
            const item = document.createElement('div');
            item.className = 'taskbar-item shadow-sm';
            item.innerHTML = `<i class="bi bi-window me-1"></i> ${win.getAttribute('title')}`;
            
            // --- LOGIKA RESTORE DARI MINIMIZE ---
            item.onclick = () => {
                win.style.display = 'block';
                win.style.zIndex = Date.now(); 
                
                win.style.animation = 'none';
                win.getBoundingClientRect(); 
                
                win.style.animation = null; 
            };
            
            taskbar.appendChild(item);
        });
        
        taskbar.style.display = windows.length > 0 ? 'flex' : 'none';
    }
};

/**
 * Module: UI & Theme Manager
 */
const UIManager = {
    async init() {
        this.initTheme();
        this.initClock();
        this.loadPanelState();
        this.setupEventListeners();

        await this.initDynamicBackground();
    },

    initDynamicBackground() {
        // Menggunakan Promise agar fungsi init() mau menunggunya
        return new Promise((resolve) => {
            try {
                const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
                // Anggap AppConfig.UI.BG_URL_DARK/LIGHT sudah diset sesuai modifikasi kita sebelumnya
                const baseUrl = isDark ? AppConfig.UI.BG_URL_DARK : AppConfig.UI.BG_URL_LIGHT;
                const bgUrl = `${baseUrl}?lock=${Date.now()}`;

                // TAHAP 2: Buat objek gambar di dalam memori untuk "memancing" unduhan
                const img = new Image();
                
                // Jika unduhan sukses
                img.onload = () => {
                    document.body.style.backgroundImage = `url('${bgUrl}')`;
                    resolve(); // Izinkan aplikasi melanjutkan proses
                };
                
                // Jika unduhan gagal (misal tidak ada internet), tetap jalankan agar tidak freeze
                img.onerror = () => {
                    console.warn("Dynamic Background Error: Gambar gagal dimuat.");
                    resolve(); 
                };
                
                // Mulai mengunduh...
                img.src = bgUrl;
            } catch (error) {
                console.warn("Dynamic Background Error:", error);
                resolve();
            }
        });
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
        const btnAbout = document.getElementById('btnAboutWindow');
        const btnCV = document.getElementById('btnCVWindow');

        if (btnCV) {
            btnCV.addEventListener('click', () => WindowManager.openPDF());
        }
        
        if (btnAbout) {
            btnAbout.addEventListener('click', () => WindowManager.openAbout());
        }

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
    async init() {
        window.WindowManager = WindowManager;
        WindowManager.init();
        await UIManager.init();
        this.startGeoTracking();
        window.dispatchEvent(new Event('app:ready')); // Event khusus jika ingin hook custom behavior setelah app siap
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