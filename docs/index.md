# Dokumentasi AuthntcG Web OS

Selamat datang di pusat dokumentasi untuk **AuthntcG Portfolio Website**. Proyek ini mendobrak batas konsep *resume* statis dengan menghadirkan pengalaman sejati **Web OS (Operating System di dalam peramban)**. Sistem operasi peramban ini dibangun mutlak menggunakan tumpukan teknologi asli tanpa kerangka kerja raksasa!

---

## 1. Topologi Dokumen Induk

Di bawah ini adalah peta hierarki navigasi (*Sitemap*) yang memandu Anda menjelajahi lautan kode dan konseptual arsitektur proyek ini:

```mermaid
flowchart TD
    Index(("Dokumentasi Pusat")) --> Arch[("Arsitektur Sistem (architecture.md)")]
    Index --> UI[("Web Components (web-components.md)")]
    Index --> Tools[("Alat & Aplikasi OS (tools.md)")]
    Index --> Walk[("Sejarah Migrasi (walkthrough.md)")]
    
    Arch -.-> |"Menjelaskan"| Core["App Controller, WindowManager, UIManager"]
    UI -.-> |"Menjelaskan"| Element["Elemen HTML Kustom (<app-window>)"]
    Tools -.-> |"Menjelaskan"| Apps["QR Generator, AI Object Detection, dll"]
    Walk -.-> |"Menjelaskan"| Evolusi["Bento Grid, Spatial UI, Tailwind"]
```

Gunakan tautan cepat berikut untuk terjun ke dalam spesifikasi teknis:
- [Arsitektur Sistem (architecture.md)](./architecture.md) - Penjelasan rinci tentang module pengontrol OS.
- [Web Components (web-components.md)](./web-components.md) - Bedah anatomi kustom elemen HTML, proteksi Iframe Shield, dan Z-Index management.
- [Alat / Tools (tools.md)](./tools.md) - Dokumentasi sub-aplikasi yang terisolasi di dalam Iframe OS (Termasuk kalkulasi spasial TensorFlow).
- [Walkthrough (walkthrough.md)](./walkthrough.md) - Rangkuman teknis migrasi sejarah (Dari Bootstrap ke Spatial Tailwind OS).

---

## 2. Gambaran Besar Arsitektur (High-Level Topology)

Berikut adalah bagan topologi interaksi tingkat tertinggi, menunjukkan batasan absolut (*Sandboxing*) antara Logika Inti, Lapisan Kosmetik Desktop, dan Alam Semesta Aplikasi:

```mermaid
flowchart TD
    User(("Aktor Pengguna"))

    subgraph CoreServices["Mesin Core Logic (Vanilla JS)"]
        State["LocalStorage Persistence"]
        AppCore["App Controller"]
        UI["UIManager & Theme Sync"]
    end

    subgraph Desktop["Lapisan Kosmetik Desktop (UI Layer)"]
        Context["Context Menu (Klik Kanan)"]
        Taskbar["Taskbar & Start Menu"]
        Widget["Weather Widget (API Cuaca)"]
    end

    subgraph WindowSystem["WindowManager & Iframe Sandbox Universe"]
        AboutWin["About Window (Bento Grid)"]
        QRWin["QR Code Window"]
        AIWin["Object Detection AI Window"]
    end

    User -->|"Interaksi Visual"| Desktop
    Desktop -->|"Perintah Buka/Tutup"| WindowSystem
    AppCore -->|"Inisialisasi & Pulihkan Memori"| State
    AppCore -->|"Inisialisasi Detak Jam & Tema"| UI
    
    UI -.->|"Mutasi Tema Instan"| WindowSystem
```

Melalui desain infrastruktur **Iframe Sandboxing Universe**, *Web OS* ini tidak akan pernah hancur meskipun aplikasi internal yang dimuat di dalamnya (`QR Code` atau `AI Object Detection`) mengalami gagal skrip parsial!
