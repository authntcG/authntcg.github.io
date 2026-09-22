# Arsitektur Sistem dan Modul JS (Core Services)

Sistem Web OS ini dibangun di atas fondasi Vanilla JavaScript dengan paradigma modular dan isolasi tingkat lanjut (Iframe Sandboxing).

## 1. App (Main Controller)

Modul App adalah entry point dari siklus hidup aplikasi.

`mermaid
sequenceDiagram
    participant B as Browser
    participant A as App.init()
    participant W as WindowManager
    participant U as UIManager
    
    B->>A: DOMContentLoaded
    A->>W: WindowManager.init()
    A->>U: UIManager.init()
    A->>W: await WindowManager.restoreState()
    A->>A: startGeoTracking()
`

**Tugas Utama:**
- Mengorkestrasi pemuatan (loading) dan memulihkan state Desktop (State Persistence).

## 2. WindowManager & AppRegistry

Mesin utama yang mereplikasi *Windowing System*.

**Mekanisme Persistence & Iframe Isolation:**
- Setiap kali jendela digeser atau ditutup, saveState() merekam array objek (X, Y, Width, Height) ke dalam localStorage.
- 
estoreState() dieksekusi saat *boot*. Menggunakan **AppRegistry** statis untuk memanggil ulang URL iframe yang sesuai.
- Seluruh jendela aplikasi (About, QR, Inspiro, AI) kini dimuat secara mutlak menggunakan **Iframe (url)**, bukan *Raw HTML Injection*, demi keamanan dan pencegahan kebocoran CSS.

## 3. UIManager & Global Theme Sync

Mengatur estetika, kalkulasi kontras wallpaper, dan sinkronisasi Tema.
- **Theme Persistence**: Membaca dan menulis preferensi Dark Mode ke localStorage.
- **Cross-Dimensional Sync**: Ketika tema diubah, UIManager tidak hanya memperbarui Desktop, tetapi secara agresif bermutasi (menyuntikkan atribut) ke dalam DOM contentDocument milik seluruh iframe yang sedang terbuka agar seketika mengikuti tema induk.

## 4. DesktopUI & WeatherService

- **DesktopUI**: Mengatur interaksi kalender, klik kanan (Context Menu), dan fungsionalitas Start Menu.
- **WeatherService**: Modul asynchronous yang memanggil API Open-Meteo dan Geocoding berdasarkan letak GPS browser.
