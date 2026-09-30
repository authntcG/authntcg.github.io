class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer class="px-2 text-center mt-4 pb-4 text-sm text-gray-500">
                <p>&copy; ${year} authntc<span class="text-blue-600">G!</span></p>
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
        let classes = `inline-flex items-center justify-center font-medium rounded-md transition-colors ${extraClass}`.trim();
        
        // Cek variant background
        if (variant === 'blue' || variant === 'primary') {
            classes += ` bg-blue-500 hover:bg-blue-600 text-white`;
        } else if (variant === 'light' || variant === 'white') {
            classes += ` bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;
        } else if (variant !== 'transparent' && variant !== 'none') {
            classes += ` bg-blue-500 hover:bg-blue-600 text-white`;
        }
        
        // Cek ukuran tombol
        if (size === 'sm') {
            classes += ` px-3 py-1.5 text-sm`;
        } else if (size === 'lg') {
            classes += ` px-5 py-3 text-lg`;
        } else {
            classes += ` px-4 py-2 text-base`;
        }
        return classes.replace('w-100', 'w-full').replace('h-100', 'h-full');
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

        const isW100 = extraClass.includes('w-100') || extraClass.includes('w-full') || extraClass.includes('btn-block');
        const isH100 = extraClass.includes('h-100') || extraClass.includes('h-full');

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
        const isCard = htmlSnippet.trim().startsWith('<div class="card"'); // Cek awal konten
        const bodyClass = (!url && isCard) ? '' : 'glass-body'; // Tentukan class secara dinamis
        
        this.style.position = 'fixed';
        // FIX Z-INDEX: Gunakan ++window.AppZIndex milidetik agar selalu di tumpukan paling atas saat baru dibuat
        this.style.zIndex = ++window.AppZIndex; 
        this.style.display = 'block';
        this.style.boxSizing = 'border-box';
        this.classList.add('app-window-instance');

        const windowContent = url 
            ? `<iframe src="${url}" frameborder="0" style="width:100%; height:100%; border:none; display:block;"></iframe>` 
            : htmlSnippet;

        const bodyOverflow = url ? 'hidden' : 'auto';

        // FITUR BARU: Tombol Refresh hanya dirender jika jendela ini memuat URL (Iframe)
        const refreshBtnHTML = url 
            ? `<button class="p-1 px-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors btn-refresh-win" title="Refresh Halaman"><i class="bi bi-arrow-clockwise"></i></button>` 
            : '';

        this.innerHTML = `
        <div class="app-window shadow-xl ring-1 ring-black/5" style="width: 100%; height: 100%; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
            <div class="app-window-header flex justify-between items-center p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 cursor-move text-gray-800 dark:text-gray-200">
                <div class="app-window-title pl-2 truncate font-medium text-sm">
                    <i class="bi bi-window-stack mr-1"></i> ${title}
                </div>
                <div class="app-window-controls flex space-x-1 pr-1">
                    ${refreshBtnHTML} 
                    <button class="p-1 px-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors btn-minimize-win" title="Minimize"><i class="bi bi-dash-lg"></i></button>
                    <button class="p-1 px-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors btn-maximize-win" title="Maximize"><i class="bi bi-app-indicator"></i></button>
                    <button class="p-1 px-2 text-gray-500 hover:text-white hover:bg-red-500 rounded transition-colors btn-close-win" title="Close"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div class="app-window-body ${bodyClass} bg-white/90 dark:bg-gray-900/90 backdrop-blur-md" style="position: relative; flex-grow: 1; overflow: ${bodyOverflow};">
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
        let reqW = this.getAttribute('width') || '700px';
        let reqH = this.getAttribute('height') || '500px';
        let reqTop = this.getAttribute('y');
        let reqLeft = this.getAttribute('x');

        let w = parseInt(reqW);
        let h = parseInt(reqH);
        if (isNaN(w)) w = 700;
        if (isNaN(h)) h = 500;

        const maxW = window.innerWidth;
        const maxH = window.innerHeight - 60; // Leave space for taskbar

        if (w > maxW) {
            w = maxW;
            reqLeft = '0px';
        }
        if (h > maxH) {
            h = maxH;
            reqTop = '0px';
        }

        this.style.width = w + 'px';
        this.style.height = h + 'px';

        // Auto center if coordinates are not explicitly forced
        if (!reqLeft) {
            let leftPos = (maxW - w) / 2;
            reqLeft = leftPos > 0 ? leftPos + 'px' : '0px';
        }
        if (!reqTop) {
            let topPos = (maxH - h) / 2;
            reqTop = topPos > 0 ? topPos + 'px' : '0px';
        }

        this.style.left = reqLeft;
        this.style.top = reqTop;
    }

            initEvents() {
        // Bring window to front on click anywhere
        this.addEventListener('mousedown', () => {
            if (parseInt(this.style.zIndex) !== window.AppZIndex) {
                this.style.zIndex = ++window.AppZIndex;
            }
        });
        this.addEventListener('touchstart', () => {
            if (parseInt(this.style.zIndex) !== window.AppZIndex) {
                this.style.zIndex = ++window.AppZIndex;
            }
        }, { passive: true });

        // Handle browser resize to keep window inside bounds
        window.addEventListener('resize', () => {
            if (this._isMaximized) return;
            const maxW = window.innerWidth;
            const maxH = window.innerHeight - 60; // 60px taskbar
            
            // Constrain width and height
            let currentW = parseInt(this.style.width);
            let currentH = parseInt(this.style.height);
            if (currentW > maxW) this.style.width = maxW + 'px';
            if (currentH > maxH) this.style.height = maxH + 'px';
            
            // Constrain position
            currentW = parseInt(this.style.width);
            currentH = parseInt(this.style.height);
            let currentLeft = parseInt(this.style.left);
            let currentTop = parseInt(this.style.top);
            
            if (currentLeft + currentW > maxW) {
                let newLeft = maxW - currentW;
                this.style.left = (newLeft > 0 ? newLeft : 0) + 'px';
            }
            if (currentTop + currentH > maxH) {
                let newTop = maxH - currentH;
                this.style.top = (newTop > 0 ? newTop : 0) + 'px';
            }
        });

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
            if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar(); if(WindowManager.saveState) WindowManager.saveState();
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
            this.style.zIndex = ++window.AppZIndex; // FIX Z-INDEX
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
            this.style.zIndex = ++window.AppZIndex; // FIX Z-INDEX
            
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
                if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar(); if(WindowManager.saveState) WindowManager.saveState();
            }, 200); 
        });

        this.querySelector('.btn-maximize-win').addEventListener('click', () => this.toggleMaximize());
        
        this.querySelector('.btn-minimize-win').addEventListener('click', () => {
            this.classList.add('is-minimizing'); // Picu animasi CSS
            
            // Tunggu animasi 200ms selesai, baru sembunyikan
            setTimeout(() => {
                this.style.display = 'none';
                this.classList.remove('is-minimizing'); // Bersihkan state untuk nanti di-restore
                if (typeof WindowManager !== "undefined") WindowManager.updateTaskbar(); if(WindowManager.saveState) WindowManager.saveState();
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
                            window.WindowManager.updateTaskbar(); if(WindowManager.saveState) WindowManager.saveState(); window.WindowManager.saveState();
                        }
                    }

                    // Pasang event listener click di dalam dokumen iframe (Untuk link berantai)
                                        iframeDoc.addEventListener('click', (e) => {
                        const link = e.target.closest('a');
                        if (link) {
                            openLinkInNewWindow(e, link);
                        }
                    });
                    
                    // FITUR BARU: Bawa jendela ke depan saat Iframe diklik
                    iframeDoc.addEventListener('mousedown', () => {
                        if (parseInt(this.style.zIndex) !== window.AppZIndex) {
                            this.style.zIndex = ++window.AppZIndex;
                        }
                    });
                    iframeDoc.addEventListener('touchstart', () => {
                        if (parseInt(this.style.zIndex) !== window.AppZIndex) {
                            this.style.zIndex = ++window.AppZIndex;
                        }
                    }, { passive: true });
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
customElements.define('app-footer', AppFooter);
