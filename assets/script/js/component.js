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

customElements.define('app-map', AppMap);
customElements.define('app-button', AppButton);
customElements.define('app-preloader', AppPreloader);
customElements.define('app-footer', AppFooter);