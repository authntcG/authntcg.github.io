# Dokumentasi AuthntcG Web OS

Selamat datang di pusat dokumentasi untuk **AuthntcG Portfolio Website**. Proyek ini telah berevolusi dari sekadar portofolio statis menjadi sebuah **Web OS (Operating System di dalam peramban)** dengan dukungan Jendela Mengambang (Floating Windows), Bento Grid Spatial UI, AI Edge Computing, dan State Persistence.

## Daftar Isi
- [Arsitektur Sistem (architecture.md)](./architecture.md) - Penjelasan rinci tentang module pengontrol aplikasi (`App`, `WindowManager`, `UIManager`).
- [Web Components (web-components.md)](./web-components.md) - Dokumentasi kustom elemen HTML (`<app-window>`).
- [Alat / Tools (tools.md)](./tools.md) - Dokumentasi sub-aplikasi yang terisolasi di dalam OS (QR Code, AI Object Detection, dll).
- [Walkthrough (walkthrough.md)](./walkthrough.md) - Rangkuman teknis migrasi sejarah (Bootstrap ke Tailwind, Arsitektur, dll).

## Gambaran Besar Arsitektur (High-Level Architecture)

```mermaid
flowchart TD
    User((User))

    subgraph Desktop["Desktop UI Layer"]
        Taskbar[Taskbar & Start Menu]
        Context[Context Menu]
        Widget[Weather Widget]
    end

    subgraph WindowSystem["WindowManager & Iframe Sandbox"]
        AboutWin[About Window (Bento Grid)]
        QRWin[QR Code Window]
        AIWin[Object Detection Window]
    end

    subgraph CoreServices["Core Logic (Vanilla JS)"]
        UI(UIManager & Theme Sync)
        State(LocalStorage Persistence)
        AppCore(App Controller)
    end

    User -->|Interaksi| Desktop
    Desktop -->|Membuka Aplikasi| WindowSystem
    AppCore -->|Inisialisasi & Restore| State
    AppCore -->|Inisialisasi| UI
```
