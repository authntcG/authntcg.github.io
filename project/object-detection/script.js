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
            }
        }, 30);
        this._interval = interval;
    },
    
    complete() {
        const bar = document.getElementById('loading-bar');
        const preload = document.getElementById('preload');
        if (!preload) return;
        
        if(this._interval) clearInterval(this._interval);
        if (bar) bar.value = 100;
        
        setTimeout(() => {
            preload.classList.add('preload-hidden');
            setTimeout(() => {
                preload.style.display = 'none';
            }, 500);
        }, 300);
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
            const savedTheme = localStorage.getItem('authntcg-theme');
            if (savedTheme) {
                document.documentElement.setAttribute("data-bs-theme", savedTheme);
            } else {
                const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light");
            }
        };
        updateTheme();
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            if(!localStorage.getItem('authntcg-theme')) updateTheme();
        });
        
        // Listen to custom event from parent window if toggled
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'THEME_CHANGED') {
                document.documentElement.setAttribute("data-bs-theme", event.data.theme);
            }
        });
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

                let contentW = 0, contentH = 0;
        let objectFit = 'contain';

        if (media instanceof HTMLVideoElement) {
            contentW = media.videoWidth;
            contentH = media.videoHeight;
            objectFit = media.id === 'webcam' ? 'cover' : 'contain';
        } else if (media instanceof HTMLImageElement) {
            contentW = media.naturalWidth;
            contentH = media.naturalHeight;
            objectFit = 'contain';
        }

        const containerW = canvas.width;
        const containerH = canvas.height;
        const containerRatio = containerW / containerH;
        const contentRatio = contentW / contentH;
        
        let renderedW = containerW;
        let renderedH = containerH;

        if (contentW && contentH) {
            if (objectFit === 'contain') {
                if (containerRatio > contentRatio) {
                    renderedH = containerH;
                    renderedW = containerH * contentRatio;
                } else {
                    renderedW = containerW;
                    renderedH = containerW / contentRatio;
                }
            } else if (objectFit === 'cover') {
                if (containerRatio > contentRatio) {
                    renderedW = containerW;
                    renderedH = containerW / contentRatio;
                } else {
                    renderedH = containerH;
                    renderedW = containerH * contentRatio;
                }
            }
        }

        const offsetX = (containerW - renderedW) / 2;
        const offsetY = (containerH - renderedH) / 2;
        
        const scaleX = contentW ? renderedW / contentW : 1;
        const scaleY = contentH ? renderedH / contentH : 1;

        predictions.forEach((pred, idx) => {
            const [x, y, w, h] = pred.bbox;
            const color = this.getColor(idx);
            
            const sx = (x * scaleX) + offsetX;
            const sy = (y * scaleY) + offsetY;
            const sw = w * scaleX;
            const sh = h * scaleY;

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
    state: { mode: 'live', isLooping: false, animationId: null, currentImagePredictions: null },
    
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

        async init() {
        // 1. Jalankan Preloader (Segera)
        Preloader.init();

        // 2. Init Module Lain
        ThemeService.init(); 
        CameraService.init(this.elements.live.video);
        
        // 3. Setup Events
        this.setupTabs();
        this.setupLiveEvents();
        this.setupFileEvents();
        window.addEventListener('resize', () => this.handleResize());

        // 4. PRE-LOAD MODEL (Tunggu selesai)
        await ModelService.load();

        // 5. Model siap! Sembunyikan preloader
        Preloader.complete();

        // 6. Start Camera
        this.startLiveMode();
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
        const tabBtns = document.querySelectorAll('.custom-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                tabBtns.forEach(b => {
                    b.classList.remove('active', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400', 'border-blue-200', 'dark:border-blue-800/50');
                    b.classList.add('hover:bg-gray-50', 'dark:hover:bg-gray-800/50', 'text-gray-600', 'dark:text-gray-400', 'border-transparent', 'hover:border-gray-200', 'dark:hover:border-gray-700');
                    const iconBg = b.querySelector('.icon-bg');
                    if (iconBg) {
                        iconBg.classList.remove('bg-blue-100', 'dark:bg-blue-800/50');
                        iconBg.classList.add('bg-gray-100', 'dark:bg-gray-800');
                    }
                });
                
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('block');
                    pane.classList.add('hidden');
                });

                targetBtn.classList.remove('hover:bg-gray-50', 'dark:hover:bg-gray-800/50', 'text-gray-600', 'dark:text-gray-400', 'border-transparent', 'hover:border-gray-200', 'dark:hover:border-gray-700');
                targetBtn.classList.add('active', 'bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400', 'border-blue-200', 'dark:border-blue-800/50');
                const iconBgTarget = targetBtn.querySelector('.icon-bg');
                if (iconBgTarget) {
                    iconBgTarget.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                    iconBgTarget.classList.add('bg-blue-100', 'dark:bg-blue-800/50');
                }
                
                const targetId = targetBtn.getAttribute('data-target');
                const titleSpan = document.getElementById('current-mode-title');
                const liveDot = document.getElementById('live-indicator');
                const btnSwitch = document.getElementById('btn-switch-cam');
                
                if (titleSpan) {
                    if (targetId === '#live') {
                        titleSpan.textContent = 'Live Camera';
                        if(liveDot) liveDot.classList.remove('hidden');
                        if(btnSwitch) { btnSwitch.classList.remove('hidden'); btnSwitch.classList.add('flex'); }
                    } else if (targetId === '#video') {
                        titleSpan.textContent = 'Video Analysis';
                        if(liveDot) liveDot.classList.add('hidden');
                        if(btnSwitch) { btnSwitch.classList.add('hidden'); btnSwitch.classList.remove('flex'); }
                    } else if (targetId === '#image') {
                        titleSpan.textContent = 'Image Analysis';
                        if(liveDot) liveDot.classList.add('hidden');
                        if(btnSwitch) { btnSwitch.classList.add('hidden'); btnSwitch.classList.remove('flex'); }
                    }
                }
                
                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.remove('hidden');
                    targetPane.classList.add('block');
                }
                
                document.querySelectorAll('textarea[id^="log-"]').forEach(log => {
                    log.classList.remove('block');
                    log.classList.add('hidden');
                });
                const targetLog = document.getElementById('log-' + targetId.replace('#', ''));
                if (targetLog) {
                    targetLog.classList.remove('hidden');
                    targetLog.classList.add('block');
                }

                this.stopAll();
                const mode = targetBtn.getAttribute('data-mode');
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
                const objectUrl = URL.createObjectURL(file);
                const domImg = this.elements.image.media;
                const offscreenImg = new Image();
                offscreenImg.onload = async () => {
                    domImg.onload = async () => {
                        Renderer.resizeCanvasToMedia(this.elements.image.canvas, domImg);
                        const preds = await ModelService.detect(offscreenImg);
                        this.state.currentImagePredictions = preds;
                        Renderer.drawPredictions(this.elements.image.canvas, preds, this.elements.image.log, domImg);
                    };
                    domImg.src = objectUrl;
                };
                offscreenImg.src = objectUrl;
            }
        });
    },

        handleResize() {
        if (this.state.mode === 'image' && this.elements.image.media.src && this.state.currentImagePredictions) {
            const img = this.elements.image.media;
            Renderer.resizeCanvasToMedia(this.elements.image.canvas, img);
            Renderer.drawPredictions(this.elements.image.canvas, this.state.currentImagePredictions, this.elements.image.log, img);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});