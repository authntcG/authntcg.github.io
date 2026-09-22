# Rekam Jejak Arsitektur & Migrasi (Walkthrough)

Dokumen ini mencatat langkah-langkah drastis, penyelesaian *tech-debt*, dan evolusi kode sejak awal portofolio statis hingga menjadi Web OS modern.

## 1. Migrasi Tailwind CSS & Vanilla JS (Tahap 1)
- Memusnahkan jQuery dan dependensi ootstrap.bundle.js dari seluruh *codebase*.
- Mengganti puluhan baris class modal, dropdown, dan *grid* menjadi kelas utilitas Tailwind murni (via CDN).
- Semua logika beralih menggunakan standar document.querySelector dan ddEventListener.

## 2. Revolusi Desain: Bento Grid & Spatial UI (Tahap 2)
Mengadopsi antarmuka modern Apple/Windows 11.
- Aplikasi *"About Me"* dan *"Object Detection"* dirakit ulang (from scratch) menggunakan arsitektur **Bento Grid** (kotak-kotak melengkung terpisah).
- **Spatial UI (Glassmorphism)**: Background putih tebal diganti dengan g-white/70 backdrop-blur-xl di sekujur proyek, menghasilkan efek tembus pandang kaca buram yang bereaksi terhadap wallpaper desktop di belakangnya.
- **Container Queries (@container)**: Membuang standard *Media Queries* (md:, lg:). Elemen Bento di dalam jendela kini menyusut dengan cerdas berdasarkan lebar **Jendelanya Sendiri**, bukan lebar layar monitor pengguna.

## 3. Web OS Enhancements (Tahap 3)
### A. Iframe Rendering Architecture
- Semua aplikasi (bout.html, QR, AI) dipaksa pindah ke dalam kontainer <iframe src="...">. Injeksi *Raw HTML* dimusnahkan. Ini memastikan 0% potensi kebocoran skrip/CSS.
### B. Desktop State Persistence (Memori Abadi)
- Diinisiasi pembuatan fungsi saveState() dan 
estoreState() pada WindowManager. Posisi (X,Y) jendela, panjang-lebar jendela, serta daftar jendela aktif secara kontinyu disimpan ke localStorage. Me-refresh peramban (F5) akan mengembalikan OS persis seperti terakhir ditinggalkan.
### C. Global Theme Synchronizer
- Mode *Dark/Light* kini menembus batas Iframe! *Event Listener* khusus memantau perubahan tema dari Menu Klik Kanan, lalu secara otomatis menyuntikkan (mutasi DOM silang dimensi) atribut tema baru ke seluruh aplikasi Iframe yang sedang aktif.

## Validasi Keseluruhan
Sistem kini tidak hanya fungsional secara mandiri (offline/static-ready untuk GitHub Pages), tetapi juga sangat kebal (*robust*) terhadap perubahan layar, interaksi tak wajar (drag and drop agresif), serta pergantian perangkat, karena seluruh arsitektur mengandalkan logika peramban asli (*Native Web APIs*).
