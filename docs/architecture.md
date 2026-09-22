# Arsitektur Sistem dan Modul JS (Core Services)

Dokumen ini membedah arsitektur inti dari *Web OS* yang beroperasi pada `script.js`. Pendekatan yang digunakan adalah *Vanilla JavaScript Module Pattern* yang ringan dan cepat.

---

## 1. App (Main Controller)

Modul `App` adalah "otak pertama" yang terbangun saat halaman dimuat. Tugasnya adalah mengorkestrasi urutan *booting* berbagai subsistem agar tidak terjadi *race condition*.

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as App.init()
    participant W as WindowManager
    participant U as UIManager
    participant Geo as Geolocation
    
    B->>A: DOMContentLoaded Trigger
    A->>W: WindowManager.init()
    Note over W: Menyiapkan Taskbar & Registry
    A->>U: UIManager.init()
    Note over U: Membaca Tema & Memuat Wallpaper
    A->>W: await WindowManager.restoreState()
    Note over W: Me-render ulang jendela dari Local Storage
    A->>Geo: startGeoTracking()
    Note over Geo: Memulai interval cuaca & koordinat
```

**Detail Alur Kerja:**
1. **Inisialisasi Dasar**: `window.AppZIndex` di-set di angka 100 sebagai titik awal penumpukan jendela (Z-Index).
2. **Sinkronisasi Subsistem**: Menunggu subsistem UI (`UIManager.init()`) selesai memuat *background* berat sebelum memaksa OS me-render jendela (`restoreState`).
3. **Layanan Latar Belakang**: Menjalankan *GeoTracking* yang akan berjalan di *background* setiap beberapa menit.

---

## 2. WindowManager & AppRegistry

`WindowManager` adalah jantung OS yang mengatur *lifecycle* seluruh aplikasi jendela (membuat, menghancurkan, meminimalkan).

```mermaid
flowchart TD
    Start(("User Action / Reload")) --> Action{Tindakan?}
    
    Action -- Buka Aplikasi --> Registry["AppRegistry (Cek ID)"]
    Registry --> CheckWin{Sudah Terbuka?}
    CheckWin -- Ya --> Focus["Fokuskan Jendela (Z-Index++)"]
    CheckWin -- Tidak --> Spawn["Buat Elemen <app-window>"]
    Spawn --> Iframe["Inject <iframe> src=URL"]
    
    Action -- Geser / Resize --> Save1["Catat Posisi X/Y/W/H"]
    Action -- Tutup --> Save2["Hapus dari Daftar Aktif"]
    
    Save1 --> Memori[("localStorage")]
    Save2 --> Memori
```

**Detail Sub-Komponen:**
- **Iframe Isolation**: OS ini telah bermigrasi dari injeksi teks HTML (`innerHTML`) menjadi pembungkusan *Iframe* absolut. Artinya, ketika `WindowManager` membuka `project/qr-code-generator/index.html`, ia membuat alam semesta baru yang terisolasi untuk aplikasi tersebut, sehingga variabel dan CSS tidak saling merusak.
- **State Persistence (Memori Jendela)**: Setiap kali jendela disentuh (`mouseup`) atau dihancurkan, fungsi `saveState()` dipanggil untuk mencetak *blueprint* jendela saat itu ke dalam memori peramban (`localStorage`). Saat di-*refresh*, fungsi `restoreState()` akan meleret *blueprint* tersebut dan memanggil `AppRegistry` untuk me-render ulang.

---

## 3. UIManager & Global Theme Sync

Bertanggung jawab atas estetika, *Clock*, *Dynamic Wallpaper*, dan Tema.

```mermaid
sequenceDiagram
    participant User
    participant ContextMenu
    participant UI as UIManager
    participant Desktop as OS DOM (HTML)
    participant Iframe as Iframe DOM (App)
    participant Local as localStorage
    
    User->>ContextMenu: Klik Kanan -> "Toggle Theme"
    ContextMenu->>UI: toggleTheme()
    UI->>Desktop: html.setAttribute('data-bs-theme', newTheme)
    UI->>Local: save('authntcg-theme', newTheme)
    
    loop Untuk Setiap Jendela Terbuka
        UI->>Iframe: contentDocument.setAttribute('data-bs-theme', newTheme)
    end
    
    Note over UI, Iframe: Iframe langsung beradaptasi tanpa perlu direload!
```

**Detail Alur Kerja Tema:**
Karena aplikasi berjalan di dalam *Iframe*, mereka secara bawaan terputus dari OS Induk. UIManager memiliki fungsi *Cross-Dimensional Mutator* yang akan menelusuri DOM setiap *iframe* yang sedang terbuka, lalu memaksa *tag html* mereka untuk mengikuti tema *Dark/Light* secara instan.

---

## 4. DesktopUI & WeatherService

Mengontrol antarmuka statis OS seperti Start Menu, Jam, dan Cuaca.

```mermaid
flowchart LR
    Start(("Boot GeoTracking")) --> GeoAPI["Browser Geo API"]
    
    GeoAPI -- (Lat, Lon) --> OpenMeteo["Open-Meteo API (Cuaca)"]
    GeoAPI -- (Lat, Lon) --> Nominatim["Geocode API (Nama Kota)"]
    
    OpenMeteo --> JSON1["Suhu & Kode Cuaca"]
    Nominatim --> JSON2["Kota (ex: Bandung)"]
    
    JSON1 --> Merge{"Gabungkan Data"}
    JSON2 --> Merge
    
    Merge --> UI["Perbarui Teks & Ikon di Taskbar"]
```

**Detail Fungsionalitas:**
- Layanan cuaca (WeatherService) berjalan secara *asynchronous* paralel. Ini mencegah peramban *freeze* saat menunggu balasan dari server cuaca Eropa. Jika gagal, OS menggunakan *graceful degradation* dengan hanya menampilkan tulisan "Offline" tanpa memunculkan error *crash* di konsol.
