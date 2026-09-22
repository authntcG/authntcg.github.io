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

        let win = id ? document.getElementById(id) : null;
        if (win) {
            win.style.display = 'block';
            win.style.zIndex = ++window.AppZIndex;
            this.updateTaskbar();
            this.saveState();
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
        this.saveState();

        // Listen for movement/resize to save state
        win.addEventListener('mouseup', () => this.saveState());
    },

    saveState() {
        const windows = [];
        document.querySelectorAll('app-window').forEach(win => {
            windows.push({
                id: win.id,
                x: win.style.left,
                y: win.style.top,
                width: win.style.width,
                height: win.style.height,
                display: win.style.display,
                zIndex: win.style.zIndex
            });
        });
        localStorage.setItem('authntcg-desktop-windows', JSON.stringify(windows));
    },

    async restoreState() {
        const saved = localStorage.getItem('authntcg-desktop-windows');
        if (!saved) return;
        try {
            const windows = JSON.parse(saved);
            for (const state of windows) {
                if (state.display === 'none') continue; // Optional: restore minimized as well?
                
                // We use a small registry to spawn the right app
                if (state.id === 'win-inspiro') {
                    this.openWindow({ id: 'win-inspiro', title: 'Inspiro Dashboard', url: 'project/inspiro/index.html', width: state.width, height: state.height, x: state.x, y: state.y });
                } else if (state.id === 'win-obj') {
                    this.openWindow({ id: 'win-obj', title: 'Object Detection', url: 'project/object-detection/index.html', width: state.width, height: state.height, x: state.x, y: state.y });
                } else if (state.id === 'win-about') {
                    this.openAbout(state);
                } else if (state.id === 'win-qr-gen') {
                    this.openQRGenerator(state);
                } else if (state.id === 'win-cv') {
                    this.openPDF(state);
                }
                
                // After spawning, force coordinates just in case the component didn't catch them
                setTimeout(() => {
                    const win = document.getElementById(state.id);
                    if (win) {
                        if(state.x) win.style.left = state.x;
                        if(state.y) win.style.top = state.y;
                        if(state.width) win.style.width = state.width;
                        if(state.height) win.style.height = state.height;
                        if(state.zIndex) win.style.zIndex = state.zIndex;
                        if(state.display) win.style.display = state.display;
                    }
                }, 500);
            }
        } catch (e) {
            console.error("Failed to restore state", e);
        }
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

            openAbout(state = null) {
        this.openWindow({
            id: 'win-about',
            title: 'About Galih Respati',
            url: 'about.html',
            width: state?.width || '750px',
            height: state?.height || '550px',
            x: state?.x, y: state?.y
        });
    },

        openPDF(state = null) {
        this.openWindow({
            id: 'win-cv',
            title: 'CV Galih Respati',
            url: 'https://drive.google.com/file/d/1kvOwc1pDQl5EyGQh9Kmcjpa-XwGpEkeJ/preview',
            width: state?.width || '800px', height: state?.height || '600px',
            x: state?.x, y: state?.y
        });
    },

            openQRGenerator(state = null) {
        this.openWindow({
            id: 'win-qr-gen',
            title: 'QR Code Generator',
            url: 'project/qr-code-generator/index.html',
            width: state?.width || '450px',
            height: state?.height || '750px',
            x: state?.x, y: state?.y
        });
    },

        updateTaskbar() {
        const taskbarDynamic = document.getElementById('taskbar-dynamic-apps');
        if (!taskbarDynamic) return;
        
        const windows = document.querySelectorAll('.app-window-instance');
        taskbarDynamic.innerHTML = '';
        
        // Toggle garis pembatas kedua (antara aplikasi dinamis dan jam)
        const divider = document.getElementById('taskbar-divider-2');
        if (divider) {
            if (windows.length > 0) divider.classList.remove('hidden');
            else divider.classList.add('hidden');
        }

        windows.forEach(win => {
            const btn = document.createElement('button');
            btn.className = 'w-10 h-10 flex flex-col items-center justify-center hover:bg-black/10 rounded-lg mx-1 relative transition-colors border-0';
            btn.innerHTML = `
                <iconify-icon icon="fluent:window-apps-24-regular" class="text-blue-500 text-xl text-inherit"></iconify-icon>
                <div class="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-blue-500 rounded-full w-3 h-[3px]"></div>
            `;
            btn.title = win.getAttribute('title');
            
                        btn.onclick = () => {
                const isVisible = win.style.display !== 'none';
                const isTopMost = parseInt(win.style.zIndex) === window.AppZIndex;

                if (isVisible && isTopMost) {
                    // Minimize
                    win.classList.add('is-minimizing');
                    setTimeout(() => {
                        win.style.display = 'none';
                        win.classList.remove('is-minimizing');
                    }, 200);
                } else {
                    // Restore / Bring to front
                    win.style.display = 'block';
                    win.style.zIndex = ++window.AppZIndex; 
                }
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
                const bgUrl = `${baseUrl}?lock=${++window.AppZIndex}`;

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
        const html = document.querySelector("html");
        const savedTheme = localStorage.getItem('authntcg-theme');
        if (savedTheme) {
            html.setAttribute("data-bs-theme", savedTheme);
        }

        const updateTheme = () => {
            if (html.getAttribute("data-bs-theme") === 'auto' || !localStorage.getItem('authntcg-theme')) {
                const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                html.setAttribute("data-bs-theme", theme);
            }
        };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if(!localStorage.getItem('authntcg-theme')) updateTheme();
        });
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

        // KODE BARU: Vanilla JS Modal Handler
        document.body.addEventListener('click', (e) => {
            // Open Modal
            const toggle = e.target.closest('[data-bs-toggle="modal"]');
            if (toggle) {
                const targetId = toggle.getAttribute('data-bs-target');
                if (targetId) {
                    const modal = document.querySelector(targetId);
                    if (modal) {
                        modal.classList.remove('hidden');
                        const event = new CustomEvent('shown.bs.modal');
                        modal.dispatchEvent(event);
                    }
                }
            }
            // Close Modal
            const dismiss = e.target.closest('[data-bs-dismiss="modal"]');
            if (dismiss) {
                const modal = dismiss.closest('.fixed.inset-0.z-50') || dismiss.closest('[id$="Modal"]');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        });
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
        window.AppZIndex = 100;
        window.WindowManager = WindowManager;
        WindowManager.init();
        const zombieTaskbar = document.getElementById('app-taskbar');
        if (zombieTaskbar) zombieTaskbar.remove();
        DesktopUI.init();
                await UIManager.init();
        await WindowManager.restoreState();
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
                this.clockPanel.style.right = 'auto';
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
            gridEl.innerHTML += `<div class="calendar-day text-gray-400">${day}</div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = (i === today.getDate() && month === today.getMonth() && year === today.getFullYear());
            const activeClass = isToday ? 'active' : '';
            gridEl.innerHTML += `<div class="calendar-day ${activeClass}">${i}</div>`;
        }

        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            gridEl.innerHTML += `<div class="calendar-day text-gray-400">${i}</div>`;
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
        let lastX = 0;
        let lastY = 0;
        
                        const updateCoords = (e) => {
            if (e.pageX !== undefined && e.pageX !== 0) {
                lastX = e.pageX;
                lastY = e.pageY;
            } else if (e.clientX !== undefined && e.clientX !== 0) {
                lastX = e.clientX;
                lastY = e.clientY;
            } else if (e.touches && e.touches.length > 0) {
                lastX = e.touches[0].pageX || e.touches[0].clientX;
                lastY = e.touches[0].pageY || e.touches[0].clientY;
            }
        };

        document.addEventListener('pointerdown', updateCoords, { capture: true, passive: true });
        document.addEventListener('mousedown', updateCoords, { capture: true, passive: true });
        document.addEventListener('touchstart', updateCoords, { capture: true, passive: true });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.hideContextMenus();
            
            const isIcon = e.target.closest('.desktop-icon');
            const menu = isIcon ? this.ctxIcon : this.ctxDesktop;
            
            if (menu) {
                                                let x = (!e.clientX && !e.clientY) ? lastX : (e.pageX || e.clientX);
                let y = (!e.clientX && !e.clientY) ? lastY : (e.pageY || e.clientY);
                
                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                
                menu.classList.remove('ctx-hide');
                
                requestAnimationFrame(() => {
                    const rect = menu.getBoundingClientRect();
                    
                    if (x + rect.width > window.innerWidth) {
                        menu.style.left = `${Math.max(0, window.innerWidth - rect.width - 5)}px`;
                    }
                    if (y + rect.height > window.innerHeight) {
                        menu.style.top = `${Math.max(0, window.innerHeight - rect.height - 5)}px`;
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
        const newTheme = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('authntcg-theme', newTheme);
        // Sinkronisasi Iframe
        document.querySelectorAll('iframe').forEach(iframe => { try { if(iframe.contentDocument) iframe.contentDocument.documentElement.setAttribute('data-bs-theme', current === 'dark' ? 'light' : 'dark'); } catch(e){} });
        // Trigger event manual jika ada komponen yang listen
        window.dispatchEvent(new Event('theme-changed')); 
    }
};

// Start Application
document.addEventListener('DOMContentLoaded', () => App.init());
