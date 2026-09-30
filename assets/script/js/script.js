import {
    AppConfig
} from './config.js';
import { Utils } from './utils.js';

const AppRegistry = {
    'win-settings': { id: 'win-settings', title: 'System Settings', icon: 'fluent:settings-24-regular', url: 'tools/settings/index.html', defaultWidth: '700px', defaultHeight: '550px' },
    'win-inspiro': { id: 'win-inspiro', title: 'Inspiro Dashboard', icon: 'bi:speedometer2', url: 'project/inspiro/index.html', defaultWidth: '1000px', defaultHeight: '600px' },
    'win-obj': { id: 'win-obj', title: 'Object Detection', icon: 'fluent:camera-24-regular', url: 'project/object-detection/index.html', defaultWidth: '900px', defaultHeight: '650px' },
    'win-about': { id: 'win-about', title: 'About Galih Respati', icon: 'fluent:person-24-regular', url: 'about.html', defaultWidth: '750px', defaultHeight: '550px' },
    'win-qr-gen': { id: 'win-qr-gen', title: 'QR Code Generator', icon: 'bi:qr-code', url: 'project/qr-code-generator/index.html', defaultWidth: '450px', defaultHeight: '750px' },
    'win-cv': { id: 'win-cv', title: 'CV Galih Respati', icon: 'fluent:document-pdf-24-regular', url: 'https://drive.google.com/file/d/1kvOwc1pDQl5EyGQh9Kmcjpa-XwGpEkeJ/preview', defaultWidth: '800px', defaultHeight: '600px' },
    'win-dev-playground': { id: 'win-dev-playground', title: 'Dev Playground', icon: 'fluent:beaker-24-regular', url: 'tools/dev-playground/index.html', defaultWidth: '600px', defaultHeight: '500px' },
    'win-vyloserve': { id: 'win-vyloserve', title: 'VyloServe', icon: 'fluent:box-24-regular', url: 'project/vyloserve/index.html', defaultWidth: '900px', defaultHeight: '650px' }
};

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
    
    openApp(appId, state = null) {
        const appDef = AppRegistry[appId];
        if (!appDef) return;
        this.openWindow({
            id: appDef.id,
            title: appDef.title,
            icon: appDef.icon,
            url: appDef.url,
            width: state?.width || appDef.defaultWidth,
            height: state?.height || appDef.defaultHeight,
            x: state?.x, y: state?.y
        });
    },

    openWindow(options) {
        const { id, title, icon, url, htmlContent, width, height, x, y } = options;


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
        if (icon) win.setAttribute('icon', icon);
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
                
                this.openApp(state.id, state);
                
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
            const appIcon = win.getAttribute('icon') || 'fluent:window-apps-24-regular';
            btn.innerHTML = `
                <iconify-icon icon="${appIcon}" class="text-blue-500 text-xl text-inherit"></iconify-icon>
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

    setupEventListeners() {
        const infoModal = document.getElementById('infoModal');
        const btnAbout = document.getElementById('btnAboutWindow');
        const btnCV = document.getElementById('btnCVWindow');

        if (btnCV) {
            btnCV.addEventListener('click', () => WindowManager.openApp('win-cv'));
        }
        
        if (btnAbout) {
            btnAbout.addEventListener('click', () => WindowManager.openApp('win-about'));
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
/**
 * Main App Controller
 */

/**
 * Module: BootManager
 * Menangani siklus hidup OS: Boot, Lockscreen, Shutdown, Restart.
 */
const BootManager = {
    init() {
        window.BootManager = this;
        this.bootScreen = document.getElementById('os-boot-screen');
        this.lockScreen = document.getElementById('os-lock-screen');
        this.shutdownScreen = document.getElementById('os-shutdown-screen');
        this.powerMenu = document.getElementById('power-menu');
        this.termText = document.getElementById('boot-terminal-text');
        
        // Update jam lockscreen
        this.updateLockClock();
        setInterval(() => this.updateLockClock(), 1000);

        // Disembunyikan oleh inline script index.html atau akan diputuskan saat app:ready
        window.addEventListener('app:ready', () => {
            const isBooted = localStorage.getItem('authntcg-booted') === 'true';
            if (isBooted) {
                // Hapus background hitam lockscreen secara halus saat UI belakang sudah siap
                this.bootScreen.classList.add('hidden');
                this.lockScreen.style.background = 'rgba(0,0,0,0.1)'; 
            } else {
                this.playBootSequence();
            }
        });
        
        // Tutup power menu jika klik di luar
        document.addEventListener('click', (e) => {
            if (this.powerMenu && !this.powerMenu.classList.contains('hidden')) {
                if (!e.target.closest('#power-menu') && !e.target.closest('[title="Power"]')) {
                    this.hidePowerMenu();
                }
            }
        });
    },

    updateLockClock() {
        const lockClock = document.getElementById('lock-clock');
        const lockDate = document.getElementById('lock-date');
        if (!lockClock || !lockDate) return;
        
        const now = new Date();
        const is24h = localStorage.getItem('authntcg-clock-24h') !== 'false';
        const locale = is24h ? 'id-ID' : 'en-US';
        lockClock.innerText = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: !is24h }).replace('.', ':');
        lockDate.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    },

    async playBootSequence() {
        this.bootScreen.classList.remove('hidden');
        
        const asciiArt = String.raw`
       =========           !!!  
     =============         !!!  
   =====                   !!!  
  ====                     !!!  
 ====       ========       !!!  
====            ====            
======        ======       !!!  
  ================         !!!  
    ============           !!!  
        `;

        const bootLogs = [
            "BIOS Date 01/01/26 10:00:00 Ver 1.00",
            "CPU: AuthntcG Quantum Processor @ 4.20GHz",
            "Memory Test: 640K OK",
            "Initializing AuthntcG OS kernel...",
            "Loading ACPI tables... OK",
            "Mounting root filesystem... OK",
            "Starting system message bus... OK",
            "Loading kernel modules... OK",
            "Starting network manager... OK",
            "Starting display manager... OK",
            "Boot sequence complete. Welcome to AuthntcG Web OS!"
        ];

        this.termText.innerHTML = '<span class="term-cursor"></span>';
        this.termText.style.opacity = '1';
        this.termText.classList.remove('hidden');
        
        const modernScreen = document.getElementById('boot-modern-screen');
        modernScreen.classList.add('hidden');
        modernScreen.classList.add('opacity-0');

        const cursor = this.termText.querySelector('.term-cursor');

        const typeWriter = async (text, minSpeed = 5, maxSpeed = 20) => {
            const span = document.createElement('span');
            this.termText.insertBefore(span, cursor);
            for (let char of text) {
                span.textContent += char;
                if (char !== ' ' && char !== '\n') {
                    await new Promise(r => setTimeout(r, Math.random() * (maxSpeed - minSpeed) + minSpeed));
                }
            }
            const br = document.createElement('br');
            this.termText.insertBefore(br, cursor);
            this.termText.scrollTop = this.termText.scrollHeight;
        };

        // Delay awal blinking cursor
        await new Promise(r => setTimeout(r, 800));

        // 1. Animasi pengetikan instruksi manual pengguna
        await typeWriter("root@authntcg:~# ./start_os.sh", 30, 80);
        await new Promise(r => setTimeout(r, 400));
        
        // 2. Munculkan ASCII Art setelah command dieksekusi
        const asciiSpan = document.createElement('span');
        asciiSpan.textContent = asciiArt;
        this.termText.insertBefore(asciiSpan, cursor);
        this.termText.scrollTop = this.termText.scrollHeight;
        
        await new Promise(r => setTimeout(r, 600));

        // 3. Animasi teks terminal sistem cepat
        for (let i = 0; i < bootLogs.length; i++) {
            await typeWriter(bootLogs[i], 2, 8);
            const delay = i === bootLogs.length - 1 ? 800 : Math.random() * 150 + 50;
            await new Promise(r => setTimeout(r, delay));
        }

        this.termText.style.opacity = '0';
        await new Promise(r => setTimeout(r, 500));
        this.termText.classList.add('hidden');

        modernScreen.classList.remove('hidden');
        void modernScreen.offsetWidth;
        modernScreen.classList.remove('opacity-0');

        await new Promise(r => setTimeout(r, 2500));

        this.lockScreen.classList.remove('hidden');
        this.lockScreen.style.background = 'rgba(0,0,0,0.4)';

        this.bootScreen.style.transition = 'opacity 0.8s ease-in-out';
        this.bootScreen.style.opacity = '0';
        
        setTimeout(() => {
            this.bootScreen.classList.add('hidden');
            this.bootScreen.style.opacity = '1';
            localStorage.setItem('authntcg-booted', 'true');
        }, 800);
    },
    unlock() {
        this.lockScreen.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            this.lockScreen.classList.add('hidden');
            this.lockScreen.style.transform = 'translateY(0)';
        }, 700);
    },

    togglePowerMenu(e) {
        if (e) e.stopPropagation();
        if (this.powerMenu.classList.contains('hidden')) {
            this.powerMenu.classList.remove('hidden');
            setTimeout(() => {
                this.powerMenu.classList.remove('scale-95', 'opacity-0');
                this.powerMenu.classList.add('scale-100', 'opacity-100');
            }, 10);
        } else {
            this.hidePowerMenu();
        }
    },

    hidePowerMenu() {
        this.powerMenu.classList.remove('scale-100', 'opacity-100');
        this.powerMenu.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            this.powerMenu.classList.add('hidden');
        }, 200);
    },

    shutdown() {
        this.hidePowerMenu();
        this.shutdownScreen.classList.remove('hidden');
        document.getElementById('shutdown-text').innerText = "Shutting down...";
        document.getElementById('shutdown-spinner').innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop" class="text-6xl text-gray-300"></iconify-icon>';
        
        // Animasi fade in hitam
        setTimeout(() => {
            this.shutdownScreen.classList.remove('opacity-0');
            this.shutdownScreen.classList.add('opacity-100');
        }, 10);

        localStorage.removeItem('authntcg-booted');

        // Tunggu 3 detik lalu close
        setTimeout(() => {
            try {
                window.close();
            } catch (e) {}
            
            // Jika diblokir browser, tampilkan pesan aman dimatikan
            document.getElementById('shutdown-spinner').innerHTML = "";
            document.getElementById('shutdown-text').innerHTML = "It is now safe to close your browser.";
        }, 3000);
    },

    restart() {
        this.hidePowerMenu();
        this.shutdownScreen.classList.remove('hidden');
        document.getElementById('shutdown-text').innerText = "Restarting...";
        document.getElementById('shutdown-spinner').innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop" class="text-6xl text-gray-300"></iconify-icon>';
        
        setTimeout(() => {
            this.shutdownScreen.classList.remove('opacity-0');
            this.shutdownScreen.classList.add('opacity-100');
        }, 10);

        localStorage.removeItem('authntcg-booted');

        // Tunggu 2 detik lalu reload
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
};

const App = {
    async init() {
        BootManager.init();
        window.AppZIndex = 100;
        window.WindowManager = WindowManager;
        WindowManager.init();
        const zombieTaskbar = document.getElementById('app-taskbar');
        if (zombieTaskbar) zombieTaskbar.remove();
        DesktopUI.init();
                await UIManager.init();
        await WindowManager.restoreState();
        DesktopUI.startGeoTracking();
        window.dispatchEvent(new Event('app:ready')); // Event khusus jika ingin hook custom behavior setelah app siap
    },

};

/**
 * Module: Desktop UI Controller (Start Menu, Clock, Context Menu)
 */
const DesktopUI = {
    activeCalDate: new Date(),




    async fetchAndRenderWeather(lat, lon) {
        try {
            const data = await Utils.fetchWeatherData(lat, lon);
            const weatherMeta = Utils.getWeatherMeta(data.current.weather_code);
            
            const tempEls = document.querySelectorAll('.weather-temp');
            const descEls = document.querySelectorAll('.weather-desc');
            const iconEls = document.querySelectorAll('.weather-icon');
            
            tempEls.forEach(el => el.innerHTML = `${Math.round(data.current.temperature_2m)}&deg;C`);
            descEls.forEach(el => el.textContent = weatherMeta.msg);
            iconEls.forEach(el => el.setAttribute('icon', weatherMeta.icon));
            
            // Apply dynamic weather background & hardware-accelerated animations
            const weatherWidget = document.getElementById('weather-widget-card');
            if (weatherWidget) {
                if (weatherMeta.bg) weatherWidget.style.background = weatherMeta.bg;
                
                // Remove existing animation classes
                weatherWidget.classList.remove('weather-anim-sun', 'weather-anim-clouds', 'weather-anim-rain', 'weather-anim-storm');
                
                // Add new animation class if exists
                if (weatherMeta.anim) {
                    weatherWidget.classList.add(weatherMeta.anim);
                }
            }

            // Fetch and set location name
            try {
                const locData = await Utils.fetchLocationData(lat, lon);
                const locName = locData.city || locData.locality || "Unknown Location";
                const locEl = document.getElementById('weather-location-name');
                if (locEl) locEl.textContent = locName;
            } catch (e) {
                console.warn('Geocode API Error', e);
            }
        } catch(err) {
            console.error('Desktop Weather Fetch Error:', err);
            const descEls = document.querySelectorAll('.weather-desc');
            descEls.forEach(el => el.textContent = 'Offline');
        }
    },

    startGeoTracking() {
        if (!navigator.geolocation) return console.error("Geolocation not supported");

        const updatePosition = (position) => {
            const { latitude, longitude } = position.coords;
            this.fetchAndRenderWeather(latitude, longitude);
        };

        navigator.geolocation.getCurrentPosition(updatePosition, err => console.error(err));
        
        setInterval(() => {
            navigator.geolocation.getCurrentPosition(updatePosition, () => {});
        }, AppConfig.WEATHER.REFRESH_INTERVAL);
    },

    init() {
        this.startMenu = document.getElementById('start-menu');
        
        // Start Menu Search Functionality
        const searchInput = document.getElementById('start-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.start-app-item');
                items.forEach(item => {
                    const nameEl = item.querySelector('.start-app-name');
                    if (nameEl && nameEl.innerText.toLowerCase().includes(query)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
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
            
            const is24h = localStorage.getItem('authntcg-clock-24h') !== 'false';
            const locale = is24h ? 'id-ID' : 'en-US';
            
            const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: !is24h }).replace(/\./g, ':');
            const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
            
            const tbTime = document.getElementById('taskbar-time');
            const tbDate = tbTime?.nextElementSibling;
            
            if (tbTime) tbTime.innerText = timeStr;
            if (tbDate) tbDate.innerText = dateStr;

            const panelTime = document.getElementById('panel-time-large');
            if (panelTime && !this.clockPanel.classList.contains('scale-hide')) {
                panelTime.innerText = now.toLocaleTimeString(locale, { hour12: !is24h }).replace(/\./g, ':');
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
