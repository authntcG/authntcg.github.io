class AppPreloader extends HTMLElement {
    connectedCallback() {
        // Tunda eksekusi sejenak agar browser selesai membaca tag <progress> di dalam HTML
        setTimeout(() => {
            this.initLogic();
        }, 0);
    }

    initLogic() {
        const bar = this.querySelector('#loading-bar');
        let progress = 0;
        let interval;

        // Fungsi utama untuk menghancurkan/menghilangkan overlay
        const hidePreloader = () => {
            // Hentikan animasi
            if (interval) clearInterval(interval);
            
            // Penuhkan bar menjadi 100%
            if (bar) bar.value = 100;
            
            // Jeda sedikit agar user melihat bar penuh, lalu sembunyikan
            setTimeout(() => {
                this.classList.add('preload-hidden');
                
                // Hapus dari layar sepenuhnya setelah transisi CSS selesai (0.5 detik)
                setTimeout(() => {
                    this.style.display = 'none';
                }, 500); 
            }, 200); 
        };

        // Jalankan animasi loading jika elemen bar ditemukan
        if (bar) {
            interval = setInterval(() => {
                if (progress < 90) {
                    progress++;
                    bar.value = progress;
                }
            }, 15);
        }

        // Cek apakah halaman sudah selesai dimuat sepenuhnya
        if (document.readyState === 'complete') {
            // Jika sudah selesai sebelum script ini jalan, langsung sembunyikan
            hidePreloader();
        } else {
            // Jika belum, tunggu sampai semua aset (gambar, css, dll) selesai dimuat
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

customElements.define('app-button', AppButton);
customElements.define('app-preloader', AppPreloader);
customElements.define('app-footer', AppFooter);