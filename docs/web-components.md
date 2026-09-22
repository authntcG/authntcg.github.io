# Web Components (Custom Elements)

Proyek ini menggunakan **Vanilla Web Components** (HTMLElement, customElements.define) untuk menciptakan blok UI yang modular layaknya sistem komponen modern (React/Vue), namun tanpa kompilasi build-tools.

---

## 1. <app-window> (Window System Inti)

Ini adalah komponen paling kompleks di OS, diregistrasi secara dinamis oleh WindowManager.

**Fitur Atomik & Logic Internal:**
- **Iframe Embedding Native**: Menyuntikkan tag <iframe> dan lapisan iframe-overlay. Overlay ini aktif (display:block) HANYA saat _header_ sedang diseret (drag) atau di-resize, untuk mencegah _browser_ "menelan" kursor ketika berada di atas iframe.
- **Drag & Resize Math**: Membaca delta perubahan X dan Y dari 8 titik pilar (*resizer*) untuk memanipulasi *width*, *height*, *top*, *left* secara *real-time*. Diakhiri dengan memanggil eksekusi window.WindowManager.saveState() agar posisi baru tersimpan ke *Local Storage*.
- **Z-Index Bubbling**: Meng-intercept klik mouse (mousedown, 	ouchstart) yang masuk *menembus* lapisan iframe (iframe.contentDocument), dan memerintahkan jendela untuk memanjat ke *Z-Index* paling tinggi (++window.AppZIndex).
- **Auto Title & Refresh**: Membaca nama dokumen HTML yang aktif di iframe (misal: "QR Code Generator") lalu mencetaknya di Header jendela dan Sinkronisasi ke nama Taskbar. Terdapat tombol "Refresh" kustom yang mengeksekusi *location.reload()* pada *contentWindow* iframe.

---

## 2. <app-button> & <app-taskbar-btn>

- **AppButton**: *Syntactic Sugar* untuk class="..." Tailwind yang sangat panjang. Secara dinamis dapat berubah wujud menjadi tag <a> jika diberikan properti *href*.
- **Taskbar Button**: Digenerasi on-the-fly ketika OS membuat jendela baru. Memiliki logika toggle display:none dan display:block untuk fungsi Minimize/Restore.
