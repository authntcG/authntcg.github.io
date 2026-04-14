class AppPreloader extends HTMLElement {
    static CONFIG = {
        ANIMATION_SPEED_MS: 15,
        MAX_FAKE_PROGRESS: 90,
        FADE_OUT_DURATION_MS: 500,
        DELAY_BEFORE_CLOSE_MS: 200
    };

    connectedCallback() {
        setTimeout(() => {
            this.initLogic();
        }, 0);
    }
    
    initLogic() {
        this.bar = this.querySelector('#loading-bar');
        this.progress = 0;

        if (this.bar) {
            this.interval = setInterval(() => {
                if (this.progress < AppPreloader.CONFIG.MAX_FAKE_PROGRESS) {
                    this.progress++;
                    this.bar.value = this.progress;
                }
            }, AppPreloader.CONFIG.ANIMATION_SPEED_MS);
        }

        window.addEventListener('app:ready', () => this.hide());
    }

    hide() {
        if (this.interval) clearInterval(this.interval);
        if (this.bar) this.bar.value = 100;
        
        setTimeout(() => {
            this.classList.add('preload-hidden');
            setTimeout(() => {
                this.style.display = 'none';
            }, AppPreloader.CONFIG.FADE_OUT_DURATION_MS); 
        }, AppPreloader.CONFIG.DELAY_BEFORE_CLOSE_MS); 
    }
}

class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer class="footer px-2">
                <p>
                    <p>&copy; ${year} authntc<span style="color: blue;">G!</span></p>
                </p>
            </footer>
        `;
    }
}

class AppButton extends HTMLElement {
    connectedCallback() {
        setTimeout(() => {
            this.render();
        }, 0);
    }

    // --- HELPER 1: Mengurus susunan Class CSS ---
    _buildClasses(variant, size, extraClass) {
        let classes = `btn ${extraClass}`.trim();
        
        // Cek variant background
        if (variant !== 'transparent' && variant !== 'none') {
            classes += ` btn-mica-${variant}`;
        }
        
        // Cek ukuran tombol
        if (size) {
            classes += ` btn-${size}`;
        }
        return classes;
    }

    // --- HELPER 2: Mengurus atribut Bootstrap & ID ---
    _buildAttributes() {
        const attrs = [];
        if (this.hasAttribute('id')) attrs.push(`id="${this.getAttribute('id')}"`);
        if (this.hasAttribute('data-bs-toggle')) attrs.push(`data-bs-toggle="${this.getAttribute('data-bs-toggle')}"`);
        if (this.hasAttribute('data-bs-target')) attrs.push(`data-bs-target="${this.getAttribute('data-bs-target')}"`);
        
        return attrs.join(' ');
    }

    // --- HELPER 3: Mengurus logika dimensi & Flexbox ---
    _applyLayoutStyles(extraClass) {
        // Style default
        this.style.display = 'inline-block';
        this.style.width = 'auto';
        this.style.height = 'auto';

        const isW100 = extraClass.includes('w-100') || extraClass.includes('btn-block');
        const isH100 = extraClass.includes('h-100');

        // Jika tidak butuh melar, kembalikan string kosong
        if (!isW100 && !isH100) {
            return ""; 
        }

        // Jika butuh melar, terapkan flex ke pembungkus (<app-button>)
        this.style.display = 'flex';
        if (isW100) this.style.width = '100%';
        if (isH100) this.style.height = '100%';

        // Kembalikan style untuk elemen di dalamnya (<a> atau <button>)
        return "flex: 1; display: flex; align-items: center; justify-content: center;";
    }

    // --- FUNGSI UTAMA (Sekarang jauh lebih bersih!) ---
    render() {
        // 1. Ambil atribut dasar
        const href = this.getAttribute('href');
        const target = this.getAttribute('target');
        const variant = this.getAttribute('variant') || 'blue';
        const size = this.getAttribute('size');
        const type = this.getAttribute('type') || 'button';
        const extraClass = this.getAttribute('extra-class') || '';
        const content = this.innerHTML; 

        // 2. Panggil fungsi-fungsi pembantu
        const innerStyle = this._applyLayoutStyles(extraClass);
        const btnClasses = this._buildClasses(variant, size, extraClass);
        const allAttrs = this._buildAttributes();

        // 3. Render HTML akhir
        if (href) {
            const linkTarget = target ? `target="${target}"` : '';
            this.innerHTML = `<a href="${href}" class="${btnClasses}" style="${innerStyle}" ${linkTarget} ${allAttrs}>${content}</a>`;
        } else {
            this.innerHTML = `<button type="${type}" class="${btnClasses}" style="${innerStyle}" ${allAttrs}>${content}</button>`;
        }

        // 4. Hapus ID dari <app-button> (removeAttribute aman dipanggil meski ID tidak ada)
        this.removeAttribute('id'); 
    }
}

/**
 * Komponen: Peta Reusable (Leaflet Wrapper)
 * Penggunaan: <app-map latitude="-6.2" longitude="106.8"></app-map>
 */
class AppMap extends HTMLElement {
    // 1. Beri tahu browser untuk "memantau" perubahan pada atribut ini
    static get observedAttributes() {
        return ['latitude', 'longitude'];
    }

    connectedCallback() {
        // Hanya set display block. 
        // Tinggi dan lebar biarkan diatur oleh file style.css (#infoMaps)
        this.style.display = 'block';

        // Buat container HTML untuk Leaflet
        this.innerHTML = `<div style="width: 100%; height: 100%; border-radius: 10px; z-index: 1;"></div>`;
        this.mapContainer = this.firstElementChild;
        
        this.mapInstance = null;
        this.marker = null;
        this.circle = null;

        // Render jika atribut sudah ada saat pertama kali dimuat
        this.renderMap();
    }

    // 2. Fungsi ini OTOMATIS terpanggil jika atribut latitude/longitude diubah
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.mapContainer) {
            this.renderMap();
        }
    }

    // 3. Logika internal Peta
    renderMap() {
        const lat = parseFloat(this.getAttribute('latitude'));
        const lon = parseFloat(this.getAttribute('longitude'));

        if (isNaN(lat) || isNaN(lon)) return;

        // Cek apakah script Leaflet sudah dimuat oleh HTML
        if (typeof L === 'undefined') {
            console.warn("Leaflet.js belum dimuat.");
            return;
        }

        if (!this.mapInstance) {
            // Jika belum ada, buat peta baru
            this.mapInstance = L.map(this.mapContainer).setView([lat, lon], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(this.mapInstance);

            this.marker = L.marker([lat, lon]).addTo(this.mapInstance);
            this.circle = L.circle([lat, lon], {
                color: '#1b00ff', fillOpacity: 0.3, radius: 100
            }).addTo(this.mapInstance);
        } else {
            // Jika sudah ada, cukup geser posisinya (Mencegah error ganda!)
            this.mapInstance.setView([lat, lon], 15);
            this.marker.setLatLng([lat, lon]);
            this.circle.setLatLng([lat, lon]);
        }
    }

    // 4. Fungsi publik untuk fix bug ukuran Modal Bootstrap
    invalidateMapSize() {
        if (this.mapInstance) {
            setTimeout(() => this.mapInstance.invalidateSize(), 200);
        }
    }
}

/**
 * Komponen: AppWindow (Custom Web Component)
 * Deskripsi: Sistem jendela mengambang bergaya OS (Windows-like) dengan dukungan efek Glassmorphism.
 * * Capability (Kemampuan Handling):
 * 1. Rendering Konten: Mendukung Iframe (URL Eksternal, PDF, Blob) dan HTML Snippet (Gambar, Video, UI Custom).
 * 2. Window Controls: Close, Maximize (Full Screen), Minimize (Hide ke Taskbar).
 * 3. Dragging: Dapat digeser melalui area Header.
 * 4. Resizing: Dapat diubah ukurannya dari 8 arah (Atas, Bawah, Kiri, Kanan, dan 4 Sudut).
 * 5. Z-Index Management: Otomatis maju ke depan saat diklik/digeser.
 */
class AppWindow extends HTMLElement {
    constructor() {
        super();
        this._isDragging = false;
        this._isResizing = false;
        this._isMaximized = false;
        this._currentResizer = null;
        this._preMaxState = {};
        this._offset = { x: 0, y: 0 };
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Window';
        const url = this.getAttribute('url');
        const htmlSnippet = this.innerHTML; 
        
        this.style.position = 'fixed';
        // FIX Z-INDEX: Gunakan Date.now() milidetik agar selalu di tumpukan paling atas saat baru dibuat
        this.style.zIndex = Date.now(); 
        this.style.display = 'block';
        this.style.boxSizing = 'border-box';
        this.classList.add('app-window-instance');

        const windowContent = url 
            ? `<iframe src="${url}" frameborder="0" style="width:100%; height:100%; border:none; display:block;"></iframe>` 
            : htmlSnippet;

        const bodyOverflow = url ? 'hidden' : 'auto';

        // FITUR BARU: Tombol Refresh hanya dirender jika jendela ini memuat URL (Iframe)
        const refreshBtnHTML = url 
            ? `<button class="btn btn-sm btn-win-ctrl btn-refresh-win" title="Refresh Halaman"><i class="bi bi-arrow-clockwise"></i></button>` 
            : '';

        this.innerHTML = `
            <div class="app-window shadow-lg" style="width: 100%; height: 100%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <div class="app-window-header d-flex justify-content-between align-items-center p-2">
                    <div class="app-window-title ps-2 text-truncate">
                        <i class="bi bi-window-stack me-1"></i> ${title}
                    </div>
                    <div class="app-window-controls d-flex">
                        ${refreshBtnHTML} <button class="btn btn-sm btn-win-ctrl btn-minimize-win" title="Minimize"><i class="bi bi-dash-lg"></i></button>
                        <button class="btn btn-sm btn-win-ctrl btn-maximize-win" title="Maximize"><i class="bi bi-app-indicator"></i></button>
                        <button class="btn btn-sm btn-win-ctrl btn-close-win" title="Close"><i class="bi bi-x-lg"></i></button>
                    </div>
                </div>
                <div class="app-window-body" style="position: relative; flex-grow: 1; overflow: ${bodyOverflow};">
                    ${windowContent}
                    <div class="iframe-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; display:none; z-index:10;"></div>
                </div>
            </div>
            <div class="resizer t"></div><div class="resizer r"></div>
            <div class="resizer b"></div><div class="resizer l"></div>
            <div class="resizer tl"></div><div class="resizer tr"></div>
            <div class="resizer bl"></div><div class="resizer br"></div>
        `;

        this.initEvents();
        this._applyInitialSize();

        const windowContainer = this.querySelector('.app-window');
        this._resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect.width < 768) {
                    windowContainer.classList.add('compact-mode');
                } else {
                    windowContainer.classList.remove('compact-mode');
                }
            }
        });
        this._resizeObserver.observe(windowContainer);

        if (window.innerWidth <= 768) {
            // Simpan ukuran awal (seandainya user HP memutar layar menjadi landscape dan ingin me-restore)
            this._preMaxState = {
                top: this.style.top, 
                left: this.style.left,
                width: this.style.width, 
                height: this.style.height
            };
            
            // Ubah ukuran menjadi 100% SECARA INSTAN (Tanpa memicu class .window-animating)
            Object.assign(this.style, {
                top: '0', 
                left: '0', 
                width: '100%', 
                height: '100%'
            });
            windowContainer.style.borderRadius = '0';
            this._isMaximized = true;
        }
    }

    disconnectedCallback() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }
    }

    _applyInitialSize() {
        this.style.top = this.getAttribute('y') || '15%';
        this.style.left = this.getAttribute('x') || '20%';
        this.style.width = this.getAttribute('width') || '700px';
        this.style.height = this.getAttribute('height') || '500px';
    }

    initEvents() {
        const header = this.querySelector('.app-window-header');
        const overlay = this.querySelector('.iframe-overlay');

        // --- HELPER: Mengambil Koordinat (Mouse vs Touch) ---
        const getPos = (e) => ({
            x: e.touches ? e.touches[0].clientX : e.clientX,
            y: e.touches ? e.touches[0].clientY : e.clientY
        });

        // FUNGSI BARU: Refresh Jendela
        const btnRefresh = this.querySelector('.btn-refresh-win');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', () => {
                const iframe = this.querySelector('iframe');
                if (iframe) {
                    try {
                        // Coba reload lokasi iframe (Bekerja untuk file internal)
                        iframe.contentWindow.location.reload();
                    } catch (err) {
                        // Fallback jika terkena blokir CORS (Bekerja untuk website eksternal)
                        const currentSrc = iframe.getAttribute('src');
                        iframe.setAttribute('src', currentSrc);
                    }
                }
            });
        }

        this.querySelector('.btn-close-win').addEventListener('click', () => {
            this.remove();
            if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar();
        });

        // --- FUNGSI DRAG START ---
        const startDrag = (e) => {
            if (e.target.closest('.btn-win-ctrl') || this._isMaximized) return;
            this._isDragging = true;
            this._isResizing = false; 
            overlay.style.display = 'block';

            // --- MATIKAN TRANSISI SAAT DRAG ---
            this.classList.remove('window-animating');
            
            const pos = getPos(e);
            this._offset = { x: this.offsetLeft - pos.x, y: this.offsetTop - pos.y };
            this.style.zIndex = Date.now(); // FIX Z-INDEX
        };

        // --- FUNGSI RESIZE START ---
        const startResize = (e, target) => {
            this._isResizing = true;
            this._isDragging = false; 
            this._currentResizer = target;
            this._initialRect = this.getBoundingClientRect();

            // --- MATIKAN TRANSISI SAAT DRAG ---
            this.classList.remove('window-animating');
            
            const pos = getPos(e);
            this._initialMouse = { x: pos.x, y: pos.y };
            
            overlay.style.display = 'block';
            this.style.zIndex = Date.now(); // FIX Z-INDEX
            
            e.stopPropagation(); 
            if (e.type === 'mousedown') e.preventDefault(); 
        };

        const calculateResize = (pos) => {
            const dx = pos.x - this._initialMouse.x;
            const dy = pos.y - this._initialMouse.y;
            const r = this._currentResizer.classList;
            const MIN = { W: 250, H: 150 };

            let state = { 
                w: this._initialRect.width, h: this._initialRect.height,
                t: this._initialRect.top, l: this._initialRect.left 
            };

            if (r.contains('t') || r.contains('tl') || r.contains('tr')) {
                state.h = this._initialRect.height - dy;
                if (state.h > MIN.H) state.t = this._initialRect.top + dy;
            }
            if (r.contains('b') || r.contains('bl') || r.contains('br')) {
                state.h = this._initialRect.height + dy;
            }
            if (r.contains('l') || r.contains('tl') || r.contains('bl')) {
                state.w = this._initialRect.width - dx;
                if (state.w > MIN.W) state.l = this._initialRect.left + dx;
            }
            if (r.contains('r') || r.contains('tr') || r.contains('br')) {
                state.w = this._initialRect.width + dx;
            }

            if (state.w > MIN.W) {
                this.style.width = state.w + 'px';
                this.style.left = state.l + 'px';
            }
            if (state.h > MIN.H) {
                this.style.height = state.h + 'px';
                this.style.top = state.t + 'px';
            }
        };

        // BINDING EVENT START (Desktop & Mobile)
        header.addEventListener('mousedown', startDrag);
        header.addEventListener('touchstart', startDrag, { passive: true });

        this.querySelectorAll('.resizer').forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => startResize(e, e.target));
            resizer.addEventListener('touchstart', (e) => startResize(e, e.target), { passive: false });
        });

        // --- FUNGSI MOVE (GLOBAL) ---
        const onMove = (e) => {
            if (!this._isDragging && !this._isResizing) return;
            
            // Cegah halaman belakang ikut terscroll saat menggeser jendela di HP
            if (e.type === 'touchmove') e.preventDefault(); 

            const pos = getPos(e);

            // Logika Dragging
            if (this._isDragging) {
                this.style.left = (pos.x + this._offset.x) + 'px';
                this.style.top = (pos.y + this._offset.y) + 'px';
            } else if (this._isResizing) {
                calculateResize(pos);
            }
        };

        // BINDING EVENT MOVE (Desktop & Mobile)
        // passive: false penting agar e.preventDefault() berfungsi di mobile
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });

        // --- FUNGSI END (GLOBAL) ---
        const onEnd = () => {
            this._isDragging = false;
            this._isResizing = false;
            overlay.style.display = 'none';
        };

        // BINDING EVENT END (Desktop & Mobile)
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);

        // --- KONTROL TOMBOL ---
        this.querySelector('.btn-close-win').addEventListener('click', () => {
            this.classList.add('is-closing'); // Picu animasi CSS
            
            // Tunggu animasi 200ms selesai, baru hapus dari DOM
            setTimeout(() => {
                this.remove();
                if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar();
            }, 200); 
        });

        this.querySelector('.btn-maximize-win').addEventListener('click', () => this.toggleMaximize());
        
        this.querySelector('.btn-minimize-win').addEventListener('click', () => {
            this.classList.add('is-minimizing'); // Picu animasi CSS
            
            // Tunggu animasi 200ms selesai, baru sembunyikan
            setTimeout(() => {
                this.style.display = 'none';
                this.classList.remove('is-minimizing'); // Bersihkan state untuk nanti di-restore
                if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar();
            }, 200);
        });

        // ==========================================
        // FITUR BARU: LINK INTERCEPTOR (Buka Link di Window Baru)
        // ==========================================
        const iframe = this.querySelector('iframe');
        
        // FUNGSI HELPER: Untuk mengeksekusi pembukaan window baru
        const openLinkInNewWindow = (e, targetLink) => {
            // Abaikan jika href kosong, berupa anchor (#), atau javascript:void
            const href = targetLink.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

            e.preventDefault(); // Cegah browser berpindah halaman

            // Buat ID unik untuk jendela baru
            const uniqueId = 'win-' + Math.random().toString(36).substr(2, 9);
            
            // Panggil WindowManager global untuk membuka jendela baru
            if (window.WindowManager) {
                window.WindowManager.openWindow({
                    id: uniqueId,
                    title: targetLink.innerText || 'Linked Window',
                    url: targetLink.href, // Gunakan URL absolut dari tautan
                    width: '800px',
                    height: '600px',
                    // Efek cascade (jendela baru sedikit bergeser dari jendela lama)
                    x: (parseInt(this.style.left || 0) + 30) + 'px',
                    y: (parseInt(this.style.top || 0) + 30) + 'px'
                });
            }
        };

        // KASUS 1: Jika konten adalah Potongan HTML (Tanpa Iframe)
        const body = this.querySelector('.app-window-body');
        body.addEventListener('click', (e) => {
            // Cari apakah elemen yang diklik (atau parent-nya) adalah tag <a>
            const link = e.target.closest('a');
            if (link) {
                openLinkInNewWindow(e, link);
            }
        });

        // KASUS 2: Jika konten adalah Iframe (File lokal / Same-Origin)
        if (iframe) {
            iframe.addEventListener('load', () => {
                try {
                    // Coba akses dokumen di dalam iframe
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    
                    // ==========================================
                    // FITUR BARU: UPDATE TITLE DARI HALAMAN TUJUAN
                    // ==========================================
                    if (iframeDoc && iframeDoc.title) {
                        const actualTitle = iframeDoc.title;
                        
                        // 1. Update atribut title pada komponen
                        this.setAttribute('title', actualTitle); 
                        
                        // 2. Update teks di Header Jendela
                        const titleEl = this.querySelector('.app-window-title');
                        if (titleEl) {
                            titleEl.innerHTML = `<i class="bi bi-window-stack me-1"></i> ${actualTitle}`;
                        }
                        
                        // 3. Perbarui Taskbar agar nama baru muncul di bawah layar
                        if (window.WindowManager) {
                            window.WindowManager.updateTaskbar();
                        }
                    }

                    // Pasang event listener click di dalam dokumen iframe (Untuk link berantai)
                    iframeDoc.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link) {
                            openLinkInNewWindow(e, link);
                        }
                    });
                } catch (error) {
                    // Akan masuk ke sini jika Iframe adalah web luar (Cross-Origin).
                    // Secara diam-diam diabaikan karena dicegah oleh keamanan Browser.
                    console.log("Info: Auto-Title & Link interception tidak didukung untuk web eksternal (CORS).");
                }
            });
        }
    }

    toggleMaximize() {
        this.classList.add('window-animating'); 

        if (!this._isMaximized) {
            this._preMaxState = {
                top: this.style.top, left: this.style.left,
                width: this.style.width, height: this.style.height
            };
            Object.assign(this.style, {
                top: '0', left: '0', width: '100%', height: '100%'
            });
            this.querySelector('.app-window').style.borderRadius = '0';
            this._isMaximized = true;
        } else {
            Object.assign(this.style, this._preMaxState);
            this.querySelector('.app-window').style.borderRadius = '12px';
            this._isMaximized = false;
        }
    }
}

customElements.define('app-window', AppWindow);
customElements.define('app-map', AppMap);
customElements.define('app-button', AppButton);
customElements.define('app-preloader', AppPreloader);
customElements.define('app-footer', AppFooter);