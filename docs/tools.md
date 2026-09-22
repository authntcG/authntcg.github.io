# Dokumentasi Alat (Tools & Sub-Projects)

Semua *tools* ini tersimpan pada direktori `/project/` dan dirender sebagai *micro-frontend* mutlak di dalam **Iframe Sandboxing** untuk menjamin tidak adanya kebocoran *event* maupun gaya (CSS) ke OS induk.

---

## 1. Pustaka AI Object Detection (`project/object-detection`)

Aplikasi Computer Vision mutakhir yang berjalan 100% di peramban (Edge Computing) menggunakan **TensorFlow.js (COCO-SSD)**.

### A. UI/UX: Spatial Bento Grid
Aplikasi ini tidak berbentuk datar, melainkan menggunakan desain **Spatial UI**. Terdapat lapisan *Frosted Glass* (`backdrop-blur-xl`), tombol kapsul yang mengambang bebas, dan layout yang responsif menggunakan *Container Queries*. 
Transisi tab antara Video, Gambar, dan *Live Camera* berjalan seketika (Vanilla JS) dengan transisi sinkronisasi konsol *Detection Stream*.

### B. Algoritma Letterboxing Offset Math (Crucial Feature)
Karena antarmuka menggunakan `object-fit: contain` untuk menjaga rasio video/gambar, ukuran layar DOM yang dibaca oleh *TensorFlow* akan mengalami distorsi.
**Solusi Atomik:** 
1. Mesin menggunakan `offscreenImg` (Image Object tanpa CSS) saat memanggil `ModelService.detect()` agar TF.js membaca piksel paling murni.
2. `Renderer.drawPredictions()` melakukan kalkulasi matriks otomatis. Ia menghitung lebar *letterbox* (bingkai kosong hitam) yang diciptakan oleh layar, dan menambahkan koordinat absolut (Offset) pada *Bounding Box* hijau. Hasilnya, kotak hijau menempel dengan presisi level-piksel pada objek, terlepas dari seaneh apapun *aspect ratio* gambar yang diunggah.

### C. State Cache & Preloader Sync
- Pemuatan awal sistem terikat mutlak pada `ModelService.load()`. Animasi *Preloader* akan terus berjalan sampai *neural network* selesai diunduh.
- Ketika layar OS di-resize, sistem menggunakan *Cache Memory* (`this.state.currentImagePredictions`) agar tidak mengulangi deteksi gambar yang memberatkan CPU/GPU.

---

## 2. QR Code Generator (`project/qr-code-generator`)

Sebuah generator QR yang dienkapsulasi di dalam objek _Singleton_ bernama `QRGeneratorLogic`.

### Mekanisme Rendering Iframe
Aplikasi ini kini berdiri di dalam halaman HTML-nya sendiri, membebaskan ketergantungan *timeout* dan injeksi raw teks dari `WindowManager`. OS hanya memanggil `url: 'project/qr-code-generator/index.html'`.

### html2canvas Mocking
Ketika QR code memakai bingkai kustom, *library* bawaan gagal mengunduhnya. Modul secara cerdik menggunakan `html2canvas` untuk memotret DOM UI (dengan skala kepadatan 3x / HD) lalu menstimulasi klik-unduh (*Mocked Download Link*) pada _browser_.

---

## 3. Inspiro Dashboard (`project/inspiro`)
Dasbor statis multifungsi yang berjalan penuh menggunakan sistem *grid* dan *charting*. Menjadi bukti kuat kapabilitas OS dalam memuat _heavy frontend_ tanpa mengganggu *thread* UI utama (Main OS), berkat fondasi *Iframe*.
