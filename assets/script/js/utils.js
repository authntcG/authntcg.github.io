// assets/script/js/utils.js

export const Utils = {
    getDayName: (index) => ['Hari ini', 'Besok', 'Lusa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][index] || `Hari ke-${index + 1}`,

    getWindDirection: (degree) => {
        const directions = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
        return directions[Math.floor(((degree + 22.5) % 360) / 45)];
    },

    getUVInfo: (uvIndex) => {
        if (uvIndex <= 2) return { scale: "Rendah", recommendation: "Aman di luar ruangan." };
        if (uvIndex <= 5) return { scale: "Sedang", recommendation: "Gunakan tabir surya." };
        if (uvIndex <= 7) return { scale: "Tinggi", recommendation: "Lindungi diri, gunakan topi." };
        if (uvIndex <= 10) return { scale: "Sangat Tinggi", recommendation: "Hindari matahari siang." };
        return { scale: "Ekstrem", recommendation: "Bahaya! Hindari keluar rumah." };
    },

    getWeatherMeta: (code) => {
        const map = {
            0: { icon: 'bi-sun', msg: 'Cerah', advice: 'Gunakan tabir surya.' },
            1: { icon: 'bi-cloud-sun', msg: 'Sebagian Berawan', advice: 'Nyaman untuk beraktivitas.' },
            2: { icon: 'bi-cloud', msg: 'Berawan', advice: 'Cuaca sejuk.' },
            3: { icon: 'bi-clouds', msg: 'Mendung', advice: 'Mungkin akan hujan.' },
            45: { icon: 'bi-cloud-fog', msg: 'Kabut', advice: 'Hati-hati berkendara.' },
            51: { icon: 'bi-cloud-drizzle', msg: 'Gerimis', advice: 'Siapkan payung.' },
            61: { icon: 'bi-cloud-rain', msg: 'Hujan Ringan', advice: 'Bawa payung.' },
            63: { icon: 'bi-cloud-rain', msg: 'Hujan Sedang', advice: 'Sebaiknya di dalam ruangan.' },
            80: { icon: 'bi-cloud-rain-heavy', msg: 'Hujan Deras', advice: 'Waspada genangan air.' },
            95: { icon: 'bi-cloud-lightning', msg: 'Badai Petir', advice: 'Cari tempat berlindung.' }
        };
        const defaultMeta = { icon: 'bi-question-circle', msg: 'Tidak Diketahui', advice: '-' };

        if (code >= 51 && code <= 67) return { icon: 'bi-cloud-rain', msg: 'Hujan', advice: 'Sedia payung.' };
        if (code >= 80 && code <= 99) return { icon: 'bi-cloud-lightning-rain', msg: 'Badai', advice: 'Bahaya.' };

        return map[code] || defaultMeta;
    },

    loadImage: (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    },

    calculateBrightness: (imageElement) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(imageElement, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return (0.299 * r) + (0.587 * g) + (0.114 * b);
    }
};