/**
 * ==========================================
 * CONFIGURATION & UTILS
 * ==========================================
 */
const CONFIG = {
    DETECTION: {
        COLORS: [
            '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0000', '#0000FF',
            '#FFA500', '#00CED1', '#ADFF2F', '#FF69B4', '#FFD700', '#7B68EE'
        ],
        FONT: '16px "Segoe UI", Arial, sans-serif',
        CONFIDENCE: 0.5
    },
    BG: {
        URL: 'https://picsum.photos/1920/1080',
    }
};

const Utils = {
    // Helper untuk load gambar
    loadImage: (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            // decode() memastikan gambar siap render
            img.decode().then(() => resolve(img)).catch((err) => reject(err));
        });
    },

    calculateBrightness: (imgElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return (0.299 * r) + (0.587 * g) + (0.114 * b);
    }
};

/**
 * ==========================================
 * MODULE: PRELOADER (User Implementation)
 * ==========================================
 */
const Preloader = {
    init() {
        const bar = document.getElementById('loading-bar');
        const preload = document.getElementById('preload');
        
        // Pastikan elemen ada sebelum dijalankan
        if (!bar || !preload) return;

        let progress = 0;

        // 1. Interval Fake Progress (Maju sampai 90%)
        const interval = setInterval(() => {
            if (progress < 90) {
                bar.value = ++progress;
            } else {
                clearInterval(interval);
            }
        }, 15);

        // 2. Window Load Event (Tunggu SEMUA selesai baru 100%)
        window.addEventListener('load', () => {
            clearInterval(interval);
            bar.value = 100;
            
            // Delay sedikit untuk efek smooth
            setTimeout(() => {
                preload.classList.add('preload-hidden');
                
                // Hapus dari display flow setelah transisi selesai
                setTimeout(() => {
                    preload.style.display = 'none';
                }, 500); // Sesuai durasi CSS transition 0.5s
            }, 300);
        });
    }
};

/**
 * ==========================================
 * MODULE: THEME SERVICE
 * ==========================================
 */
const ThemeService = {
    init() {
        this.initSystemTheme();
        this.initDynamicBackground();
    },

    initSystemTheme() {
        const updateTheme = () => {
            const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const theme = isDarkMode ? "dark" : "light";
            document.documentElement.setAttribute("data-bs-theme", theme);
        };
        updateTheme();
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
    },

    async initDynamicBackground() {
        try {
            const img = await Utils.loadImage(CONFIG.BG.URL);
            
            document.body.style.backgroundImage = `url('${CONFIG.BG.URL}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';

            const brightness = Utils.calculateBrightness(img);
            document.body.style.color = brightness > 128 ? '#000000' : '#ffffff';
        } catch (error) {
            console.warn("Background load failed.", error);
        }
    }
};

/**
 * ==========================================
 * MODULE: AI MODEL SERVICE
 * ==========================================
 */
const ModelService = {
    model: null,
    
    async load() {
        if (!this.model) {
            // Load model di background tanpa menahan UI
            this.model = await cocoSsd.load();
        }
        return this.model;
    },

    async detect(source) {
        if (!this.model) await this.load();
        return await this.model.detect(source);
    }
};

/**
 * ==========================================
 * MODULE: RENDERER
 * ==========================================
 */
const Renderer = {
    getColor(index) { return CONFIG.DETECTION.COLORS[index % CONFIG.DETECTION.COLORS.length]; },

    clear(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    resizeCanvasToMedia(canvas, media) {
        if (media.clientWidth && media.clientHeight) {
            canvas.width = media.clientWidth;
            canvas.height = media.clientHeight;
        }
    },

    drawPredictions(canvas, predictions, logElement, media) {
        const ctx = canvas.getContext('2d');
        this.clear(canvas);

        if (logElement) {
            logElement.value = predictions.length > 0
                ? predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`).join('\n')
                : 'No objects detected.';
        }

        let scaleX = 1, scaleY = 1;
        if (media instanceof HTMLVideoElement) {
            scaleX = canvas.width / media.videoWidth;
            scaleY = canvas.height / media.videoHeight;
        } else if (media instanceof HTMLImageElement) {
            scaleX = canvas.width / media.naturalWidth;
            scaleY = canvas.height / media.naturalHeight;
        }

        predictions.forEach((pred, idx) => {
            const [x, y, w, h] = pred.bbox;
            const color = this.getColor(idx);
            const sx = x * scaleX, sy = y * scaleY, sw = w * scaleX, sh = h * scaleY;

            ctx.beginPath();
            ctx.rect(sx, sy, sw, sh);
            ctx.lineWidth = 3;
            ctx.strokeStyle = color;
            ctx.stroke();

            const text = `${pred.class} ${Math.round(pred.score * 100)}%`;
            ctx.font = CONFIG.DETECTION.FONT;
            ctx.fillStyle = color;
            const textWidth = ctx.measureText(text).width;
            ctx.fillRect(sx, sy > 20 ? sy - 20 : 0, textWidth + 10, 20);
            
            ctx.fillStyle = '#000000';
            ctx.fillText(text, sx + 5, sy > 20 ? sy - 5 : 15);
        });
    }
};

/**
 * ==========================================
 * MODULE: CAMERA SERVICE
 * ==========================================
 */
const CameraService = {
    stream: null,
    videoElement: null,
    facingMode: 'user', 

    init(videoElement) {
        this.videoElement = videoElement;
    },

    async start() {
        if (this.stream) this.stop();
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: this.facingMode }
            });
            this.videoElement.srcObject = this.stream;
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve(true);
                };
            });
        } catch (error) {
            console.error("Camera Error:", error);
            return false;
        }
    },

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
    },

    async switchCamera() {
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        await this.start();
    }
};

/**
 * ==========================================
 * MAIN APP CONTROLLER
 * ==========================================
 */
const App = {
    state: { mode: 'live', isLooping: false, animationId: null },
    
    elements: {
        live: {
            video: document.getElementById('webcam'),
            canvas: document.getElementById('canvas-live'),
            log: document.getElementById('log-live'),
            btnSwitch: document.getElementById('btn-switch-cam')
        },
        video: {
            input: document.getElementById('input-video'),
            container: document.getElementById('video-container-file'),
            media: document.getElementById('video-file'),
            canvas: document.getElementById('canvas-video'),
            log: document.getElementById('log-video')
        },
        image: {
            input: document.getElementById('input-image'),
            container: document.getElementById('image-container-file'),
            media: document.getElementById('image-file'),
            canvas: document.getElementById('canvas-image'),
            log: document.getElementById('log-image')
        }
    },

    init() {
        // 1. Jalankan Preloader (Segera)
        Preloader.init();

        // 2. Init Module Lain (Async, tidak memblokir UI loader)
        ThemeService.init(); 
        CameraService.init(this.elements.live.video);
        
        // 3. Setup Events
        this.setupTabs();
        this.setupLiveEvents();
        this.setupFileEvents();
        window.addEventListener('resize', () => this.handleResize());

        // 4. Start Camera (Di background)
        this.startLiveMode();

        // Note: Preloader.hide() akan dipanggil otomatis oleh 
        // window.addEventListener('load') di dalam Preloader module
    },

    stopAll() {
        this.state.isLooping = false;
        if (this.state.animationId) cancelAnimationFrame(this.state.animationId);
        CameraService.stop();
        this.elements.video.media.pause();
        Renderer.clear(this.elements.live.canvas);
        Renderer.clear(this.elements.video.canvas);
        Renderer.clear(this.elements.image.canvas);
    },

    async startLiveMode() {
        this.state.mode = 'live';
        const started = await CameraService.start();
        if(started) {
            this.loopDetection(this.elements.live.video, this.elements.live.canvas, this.elements.live.log);
        }
    },

    async loopDetection(media, canvas, log) {
        this.state.isLooping = true;
        const loop = async () => {
            if (!this.state.isLooping) return;
            
            if (media.readyState === 4 || media.complete) {
                Renderer.resizeCanvasToMedia(canvas, media);
                const predictions = await ModelService.detect(media);
                Renderer.drawPredictions(canvas, predictions, log, media);
            }
            this.state.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    setupTabs() {
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(btn => {
            btn.addEventListener('shown.bs.tab', (e) => {
                this.stopAll();
                const mode = e.target.getAttribute('data-mode');
                if (mode === 'live') this.startLiveMode();
                else this.state.mode = mode;
            });
        });
    },

    setupLiveEvents() {
        if(this.elements.live.btnSwitch) {
            this.elements.live.btnSwitch.addEventListener('click', () => CameraService.switchCamera());
        }
    },

    setupFileEvents() {
        // Video
        this.elements.video.input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.elements.video.container.style.display = 'flex';
                this.elements.video.media.src = URL.createObjectURL(file);
                this.elements.video.media.onplay = () => {
                    this.loopDetection(this.elements.video.media, this.elements.video.canvas, this.elements.video.log);
                };
                this.elements.video.media.onpause = () => { this.state.isLooping = false; };
            }
        });

        // Image
        this.elements.image.input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.elements.image.container.style.display = 'flex';
                const img = this.elements.image.media;
                img.onload = async () => {
                    Renderer.resizeCanvasToMedia(this.elements.image.canvas, img);
                    const preds = await ModelService.detect(img);
                    Renderer.drawPredictions(this.elements.image.canvas, preds, this.elements.image.log, img);
                };
                img.src = URL.createObjectURL(file);
            }
        });
    },

    handleResize() {
        if (this.state.mode === 'image' && this.elements.image.media.src) {
            const img = this.elements.image.media;
            Renderer.resizeCanvasToMedia(this.elements.image.canvas, img);
            ModelService.detect(img).then(p => 
                Renderer.drawPredictions(this.elements.image.canvas, p, this.elements.image.log, img)
            );
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});