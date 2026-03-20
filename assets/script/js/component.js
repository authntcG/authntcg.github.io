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
        const bar = this.querySelector('#loading-bar');
        let progress = 0;
        let interval;

        const hidePreloader = () => {
            if (interval) clearInterval(interval);
            if (bar) bar.value = 100;
            
            setTimeout(() => {
                this.classList.add('preload-hidden');
                setTimeout(() => {
                    this.style.display = 'none';
                }, AppPreloader.CONFIG.FADE_OUT_DURATION_MS); 
            }, AppPreloader.CONFIG.DELAY_BEFORE_CLOSE_MS); 
        };

        if (bar) {
            interval = setInterval(() => {
                if (progress < AppPreloader.CONFIG.MAX_FAKE_PROGRESS) {
                    progress++;
                    bar.value = progress;
                }
            }, AppPreloader.CONFIG.ANIMATION_SPEED_MS);
        }

        if (document.readyState === 'complete') {
            hidePreloader();
        } else {
            window.addEventListener('load', hidePreloader);
        }
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
        
        // 1. Tangkap potongan HTML bawaan jika ada (sebelum ditimpa)
        const htmlSnippet = this.innerHTML; 
        
        this.style.position = 'fixed';
        this.style.zIndex = '1050';
        this.style.display = 'block';
        this.style.boxSizing = 'border-box';
        this.classList.add('app-window-instance');

        // 2. Logika Penentuan Konten (Iframe atau HTML Snippet)
        const windowContent = url 
            ? `<iframe src="${url}" frameborder="0" style="width:100%; height:100%; border:none;"></iframe>` 
            : htmlSnippet;

        this.innerHTML = `
            <div class="app-window shadow-lg" style="width: 100%; height: 100%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
                <div class="app-window-header d-flex justify-content-between align-items-center p-2">
                    <div class="app-window-title ps-2 text-truncate">
                        <i class="bi bi-window-stack me-1"></i> ${title}
                    </div>
                    <div class="app-window-controls d-flex">
                        <button class="btn btn-sm btn-win-ctrl btn-minimize-win"><i class="bi bi-dash-lg"></i></button>
                        <button class="btn btn-sm btn-win-ctrl btn-maximize-win"><i class="bi bi-app-indicator"></i></button>
                        <button class="btn btn-sm btn-win-ctrl btn-close-win"><i class="bi bi-x-lg"></i></button>
                    </div>
                </div>
                <div class="app-window-body" style="position: relative; flex-grow: 1; overflow: auto;">
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

        // --- MOUSE DOWN UNTUK DRAG ---
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.btn-win-ctrl') || this._isMaximized) return;
            this._isDragging = true;
            this._isResizing = false; // Pastikan tidak bertabrakan
            overlay.style.display = 'block';
            this._offset = { x: this.offsetLeft - e.clientX, y: this.offsetTop - e.clientY };
            this.style.zIndex = Math.floor(Date.now() / 1000);
        });

        // --- MOUSE DOWN UNTUK RESIZE ---
        this.querySelectorAll('.resizer').forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                this._isResizing = true;
                this._isDragging = false; // Pastikan tidak menggeser saat meresize
                this._currentResizer = e.target;
                this._initialRect = this.getBoundingClientRect();
                this._initialMouse = { x: e.clientX, y: e.clientY };
                
                overlay.style.display = 'block';
                this.style.zIndex = Math.floor(Date.now() / 1000);
                
                e.stopPropagation(); // Cegah event bocor ke elemen bawahnya
                e.preventDefault();
            });
        });

        // --- MOUSE MOVE GLOBAL ---
        document.addEventListener('mousemove', (e) => {
            if (this._isDragging) {
                this.style.left = (e.clientX + this._offset.x) + 'px';
                this.style.top = (e.clientY + this._offset.y) + 'px';
            } 
            else if (this._isResizing) {
                const dx = e.clientX - this._initialMouse.x;
                const dy = e.clientY - this._initialMouse.y;
                const r = this._currentResizer.classList;

                let newWidth = this._initialRect.width;
                let newHeight = this._initialRect.height;
                let newTop = this._initialRect.top;
                let newLeft = this._initialRect.left;

                // Batas minimum agar tidak error terbalik
                const MIN_WIDTH = 300;
                const MIN_HEIGHT = 200;

                // Hitung Vertikal
                if (r.contains('t') || r.contains('tl') || r.contains('tr')) {
                    newHeight = this._initialRect.height - dy;
                    if (newHeight > MIN_HEIGHT) newTop = this._initialRect.top + dy;
                }
                if (r.contains('b') || r.contains('bl') || r.contains('br')) {
                    newHeight = this._initialRect.height + dy;
                }

                // Hitung Horizontal
                if (r.contains('l') || r.contains('tl') || r.contains('bl')) {
                    newWidth = this._initialRect.width - dx;
                    if (newWidth > MIN_WIDTH) newLeft = this._initialRect.left + dx;
                }
                if (r.contains('r') || r.contains('tr') || r.contains('br')) {
                    newWidth = this._initialRect.width + dx;
                }

                // Terapkan Gaya jika valid
                if (newWidth > MIN_WIDTH) {
                    this.style.width = newWidth + 'px';
                    this.style.left = newLeft + 'px';
                }
                if (newHeight > MIN_HEIGHT) {
                    this.style.height = newHeight + 'px';
                    this.style.top = newTop + 'px';
                }
            }
        });

        // --- MOUSE UP GLOBAL ---
        document.addEventListener('mouseup', () => {
            this._isDragging = false;
            this._isResizing = false;
            overlay.style.display = 'none';
        });

        // --- KONTROL TOMBOL ---
        this.querySelector('.btn-close-win').addEventListener('click', () => {
            this.remove();
            if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar();
        });

        this.querySelector('.btn-maximize-win').addEventListener('click', () => this.toggleMaximize());
        
        this.querySelector('.btn-minimize-win').addEventListener('click', () => {
            this.style.display = 'none';
            if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar();
        });
    }

    toggleMaximize() {
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