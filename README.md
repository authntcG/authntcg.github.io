# AuthntcG Web OS

Sebuah ekosistem web interaktif yang menyimulasikan pengalaman Sistem Operasi Desktop, dibangun sepenuhnya menggunakan **Vanilla JavaScript, HTML5, dan Tailwind CSS** tanpa dependensi kerangka kerja (*framework-less*). OS ini berfungsi sebagai portofolio interaktif dan ruang pamer (*sandbox*) untuk bereksperimen dengan komputasi *Edge AI* dan aplikasi mikro.

## ?? Fitur Utama (Core Features)

- **Window Management System**: Arsitektur *Draggable, Resizable, & Maximizable* layaknya OS Desktop nyata, mengandalkan *Custom Web Components* (<app-window>).
- **Z-Index Bubbling & State Persistence**: Menyimpan tata letak dan posisi jendela secara *real-time* ke *Local Storage*, memastikan alur kerja tidak hilang saat halaman dimuat ulang.
- **Hardware-Accelerated Micro-Interactions**: Widget cuaca menggunakan algoritma partikel berbasis *Pure CSS/SVG* yang diproses langsung oleh GPU, menjaga konsumsi CPU di angka 0%.
- **Cross-Frame Communication**: Aplikasi sub-sistem dimuat dalam *Iframe* terisolasi, berkomunikasi asinkronus ke OS utama tanpa membocorkan batasan CSS (*CSS Leakage*).
- **Zero FOUC (Flash of Unstyled Content)**: Diperkuat dengan algoritma injeksi IIFE sinkronus, mencegah kilatan layar putih sebelum Tailwind CDN sempat merender tema (*Dark/Light Mode*).

## ?? Ekosistem Aplikasi Terintegrasi (Sub-Apps)

1. **Object Detection**: Komputasi *Edge AI* berbasis TensorFlow.js (COCO-SSD) yang menganalisa kamera *real-time* dengan pelacakan kontainer dan skala matriks presisi tinggi.
2. **QR Code Generator**: Alat utilitas harian dengan arsitektur responsif (*Golden Standard UI*), memungkinkan kustomisasi latar belakang dan logo.
3. **Inspiro Dashboard**: Panel analitik simulasi dan manajemen tugas.
4. **System Settings**: Pusat kontrol untuk manipulasi tema, perilaku *taskbar*, dan manajemen preferensi sistem.
5. **QA Playground (Simulator)**: Modul khusus bagi pengembang untuk melakukan *Smoke Test* dan memanipulasi *Environment OS* secara *cross-frame*.

## ?? Dokumentasi Arsitektur

OS ini sangat bergantung pada hierarki skrip yang terstruktur. Harap merujuk ke panduan komprehensif di dalam folder /docs/ sebelum berkontribusi:
- [/docs/architecture.md](docs/architecture.md): Membahas siklus OS (Booting), mekanisme penyimpanan *State*, algoritma animasi cuaca (GPU Compositing), dan strategi QA lintas-frame.
- [/docs/walkthrough.md](docs/walkthrough.md): *Changelog* super-detail dan rekam jejak penyelesaian masalah arsitektural di tiap fase pengembangan.
- [/docs/web-components.md](docs/web-components.md): Cara kerja abstraksi <app-window> dan <app-preloader>.

## ??? Tech Stack & Requirements
- **Core**: Vanilla JS (ES6 Modules), HTML5 API (Web Components, LocalStorage, Geolocation)
- **Styling**: Tailwind CSS (CDN) dengan utilitas Container Queries.
- **Iconography**: Fluent UI Icons (Iconify).
- **Syarat Menjalankan**: Tidak membutuhkan proses *build* (Node.js). Cukup jalankan dengan *Live Server* atau unggah ke GitHub Pages.

---
*Dibangun berdasarkan filosofi pengembangan tanpa kompromi performa.*
