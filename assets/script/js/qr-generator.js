/**
 * Modul Logika untuk QR Code Generator
 */
const QRGeneratorLogic = {
    qrCode: null,
    currentLogo: "",

    init() {
        // 1. Inisialisasi Pustaka QR Code (Nilai Default)
        this.qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "canvas",
            data: "https://authntcg.github.io",
            image: "",
            margin: 10,
            qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
            imageOptions: { 
                hideBackgroundDots: true, // Buang titik di belakang logo
                imageSize: 0.4, 
                margin: 5, 
                crossOrigin: "anonymous" 
            },
            dotsOptions: { type: "rounded", color: "#000000" },
            backgroundOptions: { color: "#ffffff" },
            cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
            cornersDotOptions: { type: "dot", color: "#000000" }
        });

        // Pasang QR Code ke dalam container HTML
        const container = document.getElementById("qr-canvas-container");
        if (container) {
            container.innerHTML = ""; // Bersihkan isi sebelumnya
            this.qrCode.append(container);
        }

        this.setupDynamicInputs();
        this.setupEventListeners();
        this.updateRawData(); // Jalankan sekali saat pertama kali dibuka
    },

    // --- MENGATUR TAMPILAN INPUT DINAMIS ---
    setupDynamicInputs() {
        const typeSelect = document.getElementById('qr-type');
        const container = document.getElementById('qr-dynamic-inputs');

        typeSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            let html = '';

            if (type === 'url') {
                html = `<label class="form-label small">Masukkan Tautan URL</label>
                        <input type="url" id="qr-input-url" class="form-control form-control-sm input-mica" value="https://authntcg.github.io" placeholder="https://contoh.com">`;
            } else if (type === 'text') {
                html = `<label class="form-label small">Masukkan Teks</label>
                        <textarea id="qr-input-text" class="form-control form-control-sm input-mica" rows="3" placeholder="Ketik pesan Anda di sini..."></textarea>`;
            } else if (type === 'email') {
                html = `<div class="mb-2"><label class="form-label small">Alamat Email</label><input type="email" id="qr-input-email" class="form-control form-control-sm input-mica" placeholder="contoh@email.com"></div>
                        <div class="mb-2"><label class="form-label small">Subjek</label><input type="text" id="qr-input-subject" class="form-control form-control-sm input-mica" placeholder="Judul Pesan"></div>
                        <div><label class="form-label small">Pesan</label><textarea id="qr-input-body" class="form-control form-control-sm input-mica" rows="2" placeholder="Isi pesan..."></textarea></div>`;
            } else if (type === 'wifi') {
                html = `<div class="mb-2"><label class="form-label small">Nama Wi-Fi (SSID)</label><input type="text" id="qr-input-ssid" class="form-control form-control-sm input-mica" placeholder="Nama Jaringan"></div>
                        <div class="mb-2"><label class="form-label small">Kata Sandi</label><input type="text" id="qr-input-pass" class="form-control form-control-sm input-mica" placeholder="Password Wi-Fi"></div>
                        <div class="row g-2"><div class="col-6"><label class="form-label small">Keamanan</label><select id="qr-input-enc" class="form-select form-select-sm input-mica"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Tanpa Password</option></select></div>
                        <div class="col-6"><label class="form-label small">Jaringan Tersembunyi</label><select id="qr-input-hidden" class="form-select form-select-sm input-mica"><option value="false">Tidak</option><option value="true">Ya (Hidden)</option></select></div></div>`;
            }

            container.innerHTML = html;
            
            // Pasang event listener baru pada input yang baru saja dibuat
            const newInputs = container.querySelectorAll('input, textarea, select');
            newInputs.forEach(input => input.addEventListener('input', () => this.updateRawData()));
            
            this.updateRawData(); // Update data setiap ganti tipe
        });
    },

    // --- MENGUBAH INPUT MENJADI FORMAT DATA STANDAR (RAW DATA) ---
    updateRawData() {
        const type = document.getElementById('qr-type').value;
        const rawDataBox = document.getElementById('qr-raw-data');
        let finalData = '';

        if (type === 'url') {
            finalData = document.getElementById('qr-input-url')?.value || '';
        } else if (type === 'text') {
            finalData = document.getElementById('qr-input-text')?.value || '';
        } else if (type === 'email') {
            const email = document.getElementById('qr-input-email')?.value || '';
            const sub = document.getElementById('qr-input-subject')?.value || '';
            const body = document.getElementById('qr-input-body')?.value || '';
            finalData = `mailto:${email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
        } else if (type === 'wifi') {
            const ssid = document.getElementById('qr-input-ssid')?.value || '';
            const pass = document.getElementById('qr-input-pass')?.value || '';
            const enc = document.getElementById('qr-input-enc')?.value || 'WPA';
            const hidden = document.getElementById('qr-input-hidden')?.value || 'false';
            finalData = `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
        }

        rawDataBox.value = finalData;
        
        // Perbarui QR Code jika data tidak kosong
        if (finalData.trim() !== '') {
            this.qrCode.update({ data: finalData });
        }
    },

    // --- EVENT LISTENER UNTUK SLIDER & WARNA ---
    // --- EVENT LISTENER UNTUK SLIDER & WARNA ---
    setupEventListeners() {
        const updateUI = () => {
            // 1. Update Teks Label Angka (Hanya jika elemennya ada)
            const sizeVal = document.getElementById('qr-size-val');
            if (sizeVal) sizeVal.innerText = document.getElementById('qr-size')?.value || 300;
            
            const marginVal = document.getElementById('qr-margin-val');
            if (marginVal) marginVal.innerText = document.getElementById('qr-margin')?.value || 10;
            
            const logoVal = document.getElementById('qr-logo-size-val');
            if (logoVal) logoVal.innerText = document.getElementById('qr-logo-size')?.value || 0.4;

            // 2. Kumpulkan semua value dengan "Optional Chaining" (?.)
            // Jika elemen tidak ditemukan di HTML, gunakan nilai default yang aman
            const options = {
                width: parseInt(document.getElementById('qr-size')?.value || 300),
                height: parseInt(document.getElementById('qr-size')?.value || 300),
                margin: parseInt(document.getElementById('qr-margin')?.value || 10),
                image: this.currentLogo, 
                imageOptions: {
                    hideBackgroundDots: true, // WAJIB ADA DI SINI JUGA
                    imageSize: parseFloat(document.getElementById('qr-logo-size')?.value || 0.4),
                    margin: 2 // Beri sedikit jarak agar logo tidak 'bertabrakan' dengan titik QR
                },
                qrOptions: {
                    errorCorrectionLevel: 'H' // Pastikan selalu High
                },
                dotsOptions: {
                    type: document.getElementById('qr-dots-type')?.value || 'rounded',
                    color: document.getElementById('qr-dots-color')?.value || '#000000'
                },
                cornersSquareOptions: {
                    type: document.getElementById('qr-corner-type')?.value || 'extra-rounded',
                    color: document.getElementById('qr-corner-color')?.value || '#000000'
                },
                cornersDotOptions: {
                    type: document.getElementById('qr-dot-type')?.value || 'dot',
                    color: document.getElementById('qr-dot-color')?.value || '#000000'
                }
            };

            // 3. Update Visual QR Code
            this.qrCode.update(options);
        };

        // 4. Pasang event "input" dengan pengecekan aman (Safety Check)
        const controls = ['qr-size', 'qr-margin', 'qr-dots-type', 'qr-dots-color', 'qr-corner-type', 'qr-corner-color', 'qr-dot-type', 'qr-dot-color', 'qr-logo-size'];
        controls.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', updateUI);
            }
        });

        // 5. Event Tombol Download (Aman)
        const btnDownload = document.getElementById('btn-download-qr');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                const ext = document.getElementById('qr-download-ext')?.value || 'png';
                this.qrCode.download({ name: "my-custom-qr", extension: ext });
            });
        }

        // 6. Event Input Pertama (Aman)
        const defaultUrlInput = document.getElementById('qr-input-url');
        if (defaultUrlInput) {
            defaultUrlInput.addEventListener('input', () => this.updateRawData());
        }

        // 7. Event Unggah Logo Lokal (Aman)
        const logoInput = document.getElementById('qr-logo-file');
        if (logoInput) {
            logoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.currentLogo = event.target.result; // Simpan ke state
                        this.qrCode.update({ 
                            image: this.currentLogo,
                            imageOptions: { hideBackgroundDots: true } 
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
};