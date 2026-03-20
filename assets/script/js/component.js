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

customElements.define('app-preloader', AppPreloader);
customElements.define('app-footer', AppFooter);