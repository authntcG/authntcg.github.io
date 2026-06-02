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
            // Perbaikan URL: Menggunakan relative path agar aman jika dihosting di Github Pages
            const response = await fetch('project/qr-code-generator/index.html'); 
            if (!response.ok) throw new Error('Gagal memuat UI QR Generator');
            
            const htmlText = await response.text(); 

            // THE MAGIC: Bedah HTML yang diterima
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // Ekstrak HANYA bagian inti aplikasinya (Abaikan <body>, tombol Back, dan <script> luar)
            const contentDiv = doc.getElementById('qr-app-content');
            const finalHtml = contentDiv ? contentDiv.innerHTML : htmlText;

            this.openWindow({
                id: 'win-qr-gen',
                title: 'QR Code Generator',
                width: '450px',
                height: '750px',
                htmlContent: finalHtml 
            });

            // Trigger Logikanya
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
        // Targetkan ke dalam div #taskbar-dynamic-apps yang baru
        const taskbarDynamic = document.getElementById('taskbar-dynamic-apps');
        if (!taskbarDynamic) return;
        
        const windows = document.querySelectorAll('.app-window-instance');
        taskbarDynamic.innerHTML = '';

        windows.forEach(win => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-taskbar border-0 rounded-3 shadow-sm mx-1 position-relative';
            // Tambahkan dot indikator bahwa app sedang terbuka
            btn.innerHTML = `
                <i class="bi bi-window text-primary fs-5"></i>
                <div class="position-absolute bottom-0 start-50 translate-middle-x bg-primary rounded-pill" style="width: 15px; height: 3px; margin-bottom: 2px;"></div>
            `;
            btn.title = win.getAttribute('title');
            
            btn.onclick = () => {
                win.style.display = 'block';
                win.style.zIndex = Date.now(); 
                win.style.animation = 'none';
                win.getBoundingClientRect(); 
                win.style.animation = null; 
            };
            
            taskbarDynamic.appendChild(btn);
        });
    },
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
        const zombieTaskbar = document.getElementById('app-taskbar');
        if (zombieTaskbar) zombieTaskbar.remove();
        DesktopUI.init();
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

/**
 * Module: Desktop UI Controller (Start Menu, Clock, Context Menu)
 */
const DesktopUI = {
    activeCalDate: new Date(),

    init() {
        this.startMenu = document.getElementById('start-menu');
        this.clockPanel = document.getElementById('clock-panel');
        this.ctxDesktop = document.getElementById('desktop-context-menu');
        this.ctxIcon = document.getElementById('icon-context-menu');
        
        this.setupClock();
        this.setupClickOutside();
        this.setupContextMenu();

        // Render Kalender saat pertama kali dimuat
        this.renderCalendar();

        window.DesktopUI = this; // Expose to HTML inline scripts
    },

    toggleStartMenu(e) {
        if(e) e.stopPropagation(); // FIX: Cegah klik tembus ke layar utama (Desktop)
        
        // Simpan status saat ini sebelum menutup panel lain
        const isHidden = this.startMenu.classList.contains('scale-hide');
        
        this.closeAllPanels(); // Tutup panel jam jika sedang terbuka
        
        if (isHidden) {
            this.startMenu.classList.remove('scale-hide');
        } else {
            this.startMenu.classList.add('scale-hide');
        }
    },

    closeAllPanels() {
        if(this.clockPanel) this.clockPanel.classList.add('scale-hide');
        if(this.startMenu) this.startMenu.classList.add('scale-hide'); // Pastikan Start Menu juga ikut tertutup
        this.hideContextMenus();
    },

    toggleClockPanel(e) {
        if(e) e.stopPropagation();
        this.startMenu.classList.add('scale-hide');
        this.hideContextMenus();
        
        if (this.clockPanel.classList.contains('scale-hide')) {
            // FIX BUG POSISI: Hitung posisi tombol yang diklik
            if (e && e.currentTarget) {
                const btnRect = e.currentTarget.getBoundingClientRect();
                const panelWidth = 340; // Sesuai dengan style width di HTML
                
                // Rumus memposisikan panel tepat di tengah-atas tombol
                let leftPos = btnRect.left + (btnRect.width / 2) - (panelWidth / 2);
                
                // Mencegah panel keluar/terpotong di ujung kanan layar
                if (leftPos + panelWidth > window.innerWidth - 10) {
                    leftPos = window.innerWidth - panelWidth - 10;
                }
                
                // Terapkan posisi baru
                this.clockPanel.style.left = `${leftPos}px`;
            }
            
            this.clockPanel.classList.remove('scale-hide');
        } else {
            this.clockPanel.classList.add('scale-hide');
        }
    },

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            // Karena tombol start & jam sudah memblokir event klik (stopPropagation), 
            // klik sembarang di area desktop/jendela pasti akan menjalankan perintah ini:
            this.closeAllPanels();
        });
        
        // Mencegah panel tertutup saat diklik di dalamnya
        this.startMenu?.addEventListener('click', e => e.stopPropagation());
        this.clockPanel?.addEventListener('click', e => e.stopPropagation());
        this.ctxDesktop?.addEventListener('click', e => e.stopPropagation());
        this.ctxIcon?.addEventListener('click', e => e.stopPropagation());
    },

    // --- KODE BARU: LOGIKA KALENDER ---
    renderCalendar() {
        const monthYearEl = document.getElementById('calendar-month-year');
        const gridEl = document.getElementById('calendar-days-grid');
        if(!gridEl || !monthYearEl) return;

        const year = this.activeCalDate.getFullYear();
        const month = this.activeCalDate.getMonth();
        const today = new Date();

        // ENHANCEMENT: Nama Bulan dalam Bahasa Indonesia
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        monthYearEl.innerText = `${monthNames[month]} ${year}`;

        gridEl.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay; i > 0; i--) {
            const day = daysInPrevMonth - i + 1;
            gridEl.innerHTML += `<div class="calendar-day text-muted">${day}</div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = (i === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const activeClass = isToday ? 'active' : '';
            gridEl.innerHTML += `<div class="calendar-day ${activeClass}">${i}</div>`;
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            gridEl.innerHTML += `<div class="calendar-day text-muted">${i}</div>`;
        }
    },

    changeMonth(offset) {
        // Geser bulan (1 untuk next, -1 untuk prev)
        this.activeCalDate.setMonth(this.activeCalDate.getMonth() + offset);
        this.renderCalendar();
    },

    setupClock() {
        setInterval(() => {
            const now = new Date();
            
            // Format waktu Indonesia (id-ID)
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
            const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
            
            const tbTime = document.getElementById('taskbar-time');
            const tbDate = tbTime?.nextElementSibling;
            
            if (tbTime) tbTime.innerText = timeStr;
            if (tbDate) tbDate.innerText = dateStr;

            const panelTime = document.getElementById('panel-time-large');
            if (panelTime && !this.clockPanel.classList.contains('scale-hide')) {
                // Teks Kalender besar (Misal: Senin, 1 Januari)
                panelTime.innerText = now.toLocaleTimeString('id-ID', { hour12: false }).replace(/\./g, ':');
                document.getElementById('panel-date-large').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' });
            }
        }, 1000);
    },

    hideContextMenus() {
        // Gunakan ctx-hide, bukan scale-hide
        if(this.ctxDesktop) this.ctxDesktop.classList.add('ctx-hide');
        if(this.ctxIcon) this.ctxIcon.classList.add('ctx-hide');
    },

    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.hideContextMenus();
            
            const isIcon = e.target.closest('.desktop-icon');
            const menu = isIcon ? this.ctxIcon : this.ctxDesktop;
            
            if (menu) {
                // 1. Terapkan posisi persis di ujung kursor (SEBELUM menu dimunculkan)
                let x = e.clientX;
                let y = e.clientY;
                
                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                
                // 2. Munculkan menu
                menu.classList.remove('ctx-hide');
                
                // 3. Beri waktu sejenak (1 frame) agar browser merender ukuran menu, 
                //    lalu geser jika menu menabrak batas kanan atau bawah layar.
                requestAnimationFrame(() => {
                    const rect = menu.getBoundingClientRect();
                    
                    if (x + rect.width > window.innerWidth) {
                        menu.style.left = `${window.innerWidth - rect.width - 5}px`;
                    }
                    if (y + rect.height > window.innerHeight) {
                        menu.style.top = `${window.innerHeight - rect.height - 5}px`;
                    }
                });
            }
        });

        window.handleMenuAction = (action) => {
            this.hideContextMenus();
            if (action === 'toggle-theme') this.toggleTheme();
            if (action === 'refresh-desktop') location.reload();
        };
    },

    toggleTheme() {
        const html = document.querySelector("html");
        const current = html.getAttribute("data-bs-theme");
        html.setAttribute("data-bs-theme", current === "dark" ? "light" : "dark");
        // Trigger event manual jika ada komponen yang listen
        window.dispatchEvent(new Event('theme-changed')); 
    }
};

// Start Application
$(document).ready(() => App.init());