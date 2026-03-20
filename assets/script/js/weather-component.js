// assets/script/js/weather-components.js
import {
    Utils
} from './utils.js';

/**
 * Komponen: Kartu Cuaca Utama (Dashboard)
 */
class AppWeatherWidget extends HTMLElement {
    connectedCallback() {
        // Tampilan skeleton/loading awal
        this.innerHTML = `
            <div class="card h-100">
                <div class="card-body d-flex justify-content-center align-items-center">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
            </div>
        `;
    }

    // Fungsi ini akan dipanggil oleh script.js saat data API sudah siap
    // assets/script/js/weather-components.js (di dalam AppWeatherWidget)
    updateData(current, units, lat, lon) { // Tambahkan parameter lat, lon
        const meta = Utils.getWeatherMeta(current.weather_code);
        const windDir = Utils.getWindDirection(current.wind_direction_10m);

        this.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-12 mb-2">
                        <div class="row">
                            <div class="col-8">
                                <h5 class="display-5">Weather Info</h5>
                            </div>
                            <div class="col-4 d-flex justify-content-end">
                                <app-button extra-class="btn-info-modal" variant="transparent" data-bs-toggle="modal" data-bs-target="#infoModal" data-latitude="${lat}" data-longitude="${lon}">
                                    <i class="bi bi-info-circle-fill"></i>
                                </app-button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8 mb-2">
                        <div class="d-flex justify-content-center align-items-center">
                            <div class="row">
                                <div class="col-12">
                                    <p class="${meta.icon} text-center" style="font-size: 10vh; margin-bottom: -15px; font-weight: lighter !important;"></p>
                                </div>
                                <div class="col">
                                    <h5 class="text-center">${meta.msg}</h5>
                                    <p class="text-center text-capitalize">
                                        <strong>${current.temperature_2m}${units.temperature_2m}</strong>, terasa <strong>${current.apparent_temperature}${units.apparent_temperature}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-4">
                        <div class="row">
                            <div class="col-6 col-sm-6 col-lg-12 px-1 mb-2 d-none d-sm-none d-md-block">
                                <div class="card"><div class="card-body"><p class="m-0"><i class="bi bi-info"></i> ${meta.msg}</p></div></div>
                            </div>
                            <div class="col-6 col-sm-6 col-lg-12 px-1 mb-2 d-none d-sm-none d-md-block">
                                <div class="card"><div class="card-body"><p class="m-0"><i class="bi bi-wind"></i> ${current.wind_speed_10m} ${units.wind_speed_10m} (${windDir})</p></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}

/**
 * Komponen: Rincian Cuaca (Untuk di dalam Modal Info)
 */
class AppWeatherDetails extends HTMLElement {
    // --- HELPER: Kamus Cuaca Humanis yang Bervariasi (Randomized) ---
    _generateHumanSummary(meta, temp, uvScale) {
        const condition = meta.msg.toLowerCase();

        // Fungsi kecil untuk mengambil kata acak dari dalam array
        const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];

        // 1. KAMUS KALIMAT PEMBUKA (Minimal 10 Variasi Per Kondisi)
        let openingDict = [];
        if (condition.includes('cerah')) {
            openingDict = [
                "Cuaca di luar sedang cerah dan sangat bersahabat.",
                "Matahari bersinar terang hari ini, cuacanya sungguh cerah.",
                "Langit biru dan cerah menyertai hari ini, asyik buat jalan-jalan.",
                "Saat ini cuaca cerah ceria, pas sekali untuk aktivitas di luar.",
                "Wah, cuacanya sedang bagus dan cerah sekali di luar sana.",
                "Hari ini sangat cerah, tidak ada tanda-tanda awan gelap.",
                "Cuaca yang indah dan cerah untuk menjalani aktivitasmu.",
                "Langit tampak bersih dan cerah, pemandangan yang menyegarkan.",
                "Sedang cerah-cerahnya nih, jangan lupa senyum hari ini.",
                "Kondisi di luar terpantau cerah dan sangat mendukung suasana hati."
            ];
        } else if (condition.includes('hujan') || condition.includes('gerimis')) {
            openingDict = [
                "Sepertinya di luar sedang turun hujan.",
                "Hujan sedang mengguyur nih, jangan lupa sedia payung ya.",
                "Di luar terpantau hujan, lebih enak santai di dalam ruangan.",
                "Sedang hujan rupanya, hati-hati jika harus bepergian.",
                "Rintik hujan sedang turun membasahi bumi.",
                "Cuaca sedang hujan, pastikan bawa jas hujan atau payung sebelum keluar.",
                "Air hujan sedang turun, cuaca yang pas untuk minum teh hangat.",
                "Tampaknya sedang hujan di luar sana, jaga kesehatanmu.",
                "Hujan membasahi jalanan saat ini, awas licin kalau berkendara.",
                "Sedang hujan nih, suasana di luar jadi lebih syahdu."
            ];
        } else if (condition.includes('mendung') || condition.includes('berawan')) {
            openingDict = [
                "Langit tampak berawan dan mendung hari ini.",
                "Awan tampak menutupi matahari, cuacanya sedang mendung.",
                "Suasana cukup teduh karena langit sedang berawan.",
                "Saat ini cuaca sedang berawan, matahari lagi sembunyi.",
                "Langit terlihat mendung, sepertinya matahari sedang malas bersinar.",
                "Cuacanya cukup syahdu nih, banyak awan menggantung di langit.",
                "Mendung menyelimuti langit, bersiap saja kalau nanti tiba-tiba hujan.",
                "Terpantau berawan, udara jadi tidak terlalu terik menyengat.",
                "Kondisi langit cukup berawan hari ini, lumayan adem.",
                "Awan tebal sedang menghiasi langit, cuacanya agak mendung."
            ];
        } else if (condition.includes('badai') || condition.includes('petir') || condition.includes('kabut')) {
            openingDict = [
                "Cuaca sedang kurang bersahabat di luar sana.",
                "Hati-hati, kondisi di luar sedang ada badai atau kabut tebal.",
                "Cuaca ekstrem sedang terjadi, lebih baik tetap berada di dalam rumah.",
                "Sedang terjadi cuaca buruk, hindari aktivitas di ruang terbuka.",
                "Kondisi di luar kurang aman karena badai atau jarak pandang yang terbatas.",
                "Peringatan cuaca! Sedang ada badai atau kabut di luar.",
                "Cuacanya lagi galak nih, sebaiknya tunda dulu rencana keluarmu.",
                "Langit sedang tidak kompromi, terpantau cuaca ekstrem di luar.",
                "Sebaiknya cari tempat aman, cuaca di luar sedang sangat buruk.",
                "Alam sedang bergejolak, tetap waspada dengan cuaca saat ini."
            ];
        } else {
            openingDict = [
                `Saat ini cuaca terpantau ${condition}.`,
                `Kondisi langit saat ini menunjukkan status ${condition}.`,
                `Informasi cuaca terkini: ${condition}.`,
                `Secara umum, cuaca di luar sedang ${condition}.`,
                `Laporan cuaca mengindikasikan kondisi ${condition}.`,
                `Pantauan saat ini, cuaca sedang ${condition}.`,
                `Sepertinya cuaca di luar adalah ${condition}.`,
                `Sistem mencatat cuaca saat ini dalam kondisi ${condition}.`,
                `Situasi cuaca sekarang digambarkan sebagai ${condition}.`,
                `Untuk saat ini, cuacanya ${condition} ya.`
            ];
        }

        // 2. KAMUS KALIMAT SUHU (Minimal 10 Variasi Per Kondisi)
        let tempDict = [];
        if (temp >= 30) {
            tempDict = [
                `Udara terasa lumayan panas dengan suhu mencapai ${temp}°C.`,
                `Panasnya cukup menyengat nih, suhunya ada di angka ${temp}°C.`,
                `Suhu menyentuh ${temp}°C, gampang banget bikin berkeringat.`,
                `Cukup gerah hari ini karena suhu berada di ${temp}°C.`,
                `Udara di luar cukup terik dengan temperatur ${temp}°C.`,
                `Suhu udara lumayan tinggi, sekitar ${temp}°C.`,
                `Hawanya sedang panas-panasnya nih, tercatat ${temp}°C.`,
                `Dengan suhu ${temp}°C, pastikan kamu banyak minum air putih ya.`,
                `Temperatur mencapai ${temp}°C, rasanya seperti sedang dipanggang.`,
                `Udara gerah mendominasi dengan suhu sekitar ${temp}°C.`
            ];
        } else if (temp <= 22) {
            tempDict = [
                `Udaranya terasa cukup sejuk dan dingin di angka ${temp}°C.`,
                `Suhu sedang turun ke ${temp}°C, pas banget buat pakai jaket kesayanganmu.`,
                `Lumayan dingin nih, suhunya cuma sekitar ${temp}°C.`,
                `Hawanya menyejukkan dengan temperatur di angka ${temp}°C.`,
                `Udara terasa dingin menyegarkan, suhunya ${temp}°C.`,
                `Bikin menggigil sedikit, suhu saat ini ${temp}°C.`,
                `Suhu cukup rendah di ${temp}°C, jangan lupa pakai pakaian hangat.`,
                `Udaranya lagi adem banget, tercatat di angka ${temp}°C.`,
                `Cukup sejuk hari ini karena suhunya bertahan di ${temp}°C.`,
                `Cuacanya asyik nih buat tarik selimut, suhu udara mencapai ${temp}°C.`
            ];
        } else {
            // Suhu normal (23 - 29)
            tempDict = [
                `Suhu udara terasa cukup nyaman di kisaran ${temp}°C.`,
                `Hawanya sedang-sedang saja, suhunya sekitar ${temp}°C.`,
                `Temperatur terpantau sangat ideal di angka ${temp}°C.`,
                `Suhu berada di ${temp}°C, tidak terlalu panas dan tidak terlalu dingin.`,
                `Udaranya terasa sangat pas untuk beraktivitas, dengan suhu ${temp}°C.`,
                `Dengan suhu ${temp}°C, cuacanya lumayan bersahabat buat jalan-jalan.`,
                `Suhu normal tercatat di ${temp}°C, cukup bikin rileks.`,
                `Kondisi temperatur sangat wajar, ada di kisaran ${temp}°C.`,
                `Suhu udara yang enak banget nih, ada di sekitar ${temp}°C.`,
                `Tercatat suhu ${temp}°C, cuaca yang benar-benar nyaman untuk hari ini.`
            ];
        }

        // 3. KAMUS KALIMAT UV (Minimal 10 Variasi Per Kondisi)
        let uvDict = [];
        if (['Tinggi', 'Sangat Tinggi', 'Ekstrem'].includes(uvScale)) {
            uvDict = [
                `Hati-hati ya, paparan sinar UV matahari sedang menyengat (Level: ${uvScale}).`,
                `Indeks UV cukup mengkhawatirkan di level ${uvScale}, wajib pakai sunscreen!`,
                `Peringatan! Sinar UV masuk level ${uvScale}, jangan berlama-lama di bawah matahari terik.`,
                `Radiasi UV sangat tinggi (Level: ${uvScale}), lindungi kulitmu dengan baik.`,
                `Level UV mencapai status ${uvScale}, sebaiknya berteduh jika memungkinkan.`,
                `Matahari sedang sangat jahat dengan UV level ${uvScale}, selalu gunakan pelindung.`,
                `Waspada UV level ${uvScale}, ini bisa merusak kulit kalau tidak dilindungi.`,
                `Sinar ultraviolet sangat kuat hari ini (Level: ${uvScale}), pakai topi atau payung ya.`,
                `Indeks UV menyentuh level ${uvScale}, batasi aktivitas di luar ruangan sebisa mungkin.`,
                `Paparan radiasi UV sedang berbahaya di level ${uvScale}, jaga dirimu baik-baik.`
            ];
        } else {
            uvDict = [
                `Paparan sinar UV masih tergolong aman (Level: ${uvScale}).`,
                `Tidak perlu khawatir, indeks UV terpantau bersahabat di level ${uvScale}.`,
                `Sinar matahari cukup ramah di kulit, UV hanya berada di level ${uvScale}.`,
                `Tingkat UV saat ini adalah ${uvScale}, cukup aman untuk jalan-jalan santai.`,
                `Radiasi UV relatif rendah di level ${uvScale}, sangat aman beraktivitas di luar.`,
                `Level UV menunjukan status ${uvScale}, kamu bisa bernapas lega.`,
                `Matahari bersinar lembut, indeks UV tercatat di level ${uvScale}.`,
                `Kondisi UV yang aman (Level: ${uvScale}), tidak perlu terlalu cemas.`,
                `Sinar ultraviolet tidak terlalu menyengat, terpantau di level ${uvScale}.`,
                `Indeks UV ada di level ${uvScale}, nikmati waktu di luar ruangan dengan nyaman.`
            ];
        }

        // 4. Pilih secara acak dari kamus dan gabungkan menjadi satu paragraf yang mengalir
        const opening = pickRandom(openingDict);
        const tempText = pickRandom(tempDict);
        const uvText = pickRandom(uvDict);

        return `${opening} ${tempText} ${uvText}`;
    }

    // --- HELPER 2: Kamus Saran (Advice) Bervariasi (BARU) ---
    _generateHumanAdvice(meta) {
        const condition = meta.msg.toLowerCase();
        const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];
        let adviceDict = [];

        if (condition.includes('cerah')) {
            adviceDict = [
                "Jangan lupa pakai tabir surya (sunscreen) ya kalau mau berlama-lama di luar.",
                "Cuaca cerah begini paling pas pakai kacamata hitam dan pakaian berbahan katun yang menyerap keringat.",
                "Sedia air minum yang cukup biar kamu nggak dehidrasi saat beraktivitas.",
                "Topi dan sunscreen adalah sahabat terbaikmu untuk hari yang cerah ini.",
                "Cuacanya asyik nih buat olahraga ringan atau sekadar jalan sore santai.",
                "Jaga asupan cairan tubuhmu, karena cuaca cerah bisa bikin cepat haus.",
                "Kalau mau menjemur pakaian atau barang, ini adalah waktu yang paling tepat!",
                "Manfaatkan cuaca bagus ini untuk cari udara segar, tapi hindari sinar matahari langsung di siang bolong ya.",
                "Pakaian berwarna cerah dan berbahan tipis sangat direkomendasikan untuk hari ini.",
                "Tetap sedia air putih ke mana pun kamu pergi agar tubuh selalu segar bugar."
            ];
        } else if (condition.includes('hujan') || condition.includes('gerimis')) {
            adviceDict = [
                "Pastiin payung atau jas hujan sudah masuk ke dalam tasmu ya sebelum pergi.",
                "Kalau harus berkendara, pelan-pelan saja ya karena jalanan pasti licin.",
                "Cuaca begini paling enak diseduhin teh atau kopi hangat sambil santai di dalam ruangan.",
                "Jangan lupa pakai pakaian yang agak tebal biar tubuhmu tetap hangat.",
                "Amankan barang-barang elektronikmu ke dalam tas anti-air kalau mau bepergian.",
                "Kalau hujannya deras, lebih baik neduh dulu deh, jangan memaksakan diri.",
                "Pakai alas kaki yang anti-selip biar kamu nggak terpeleset di jalanan yang basah.",
                "Pastikan jemuran sudah diangkat ya, biar nggak basah kuyup lagi.",
                "Sedia vitamin ekstra untuk menjaga daya tahan tubuhmu di cuaca basah ini.",
                "Tetap jaga jarak aman saat mengemudi ya, jarak pengereman biasanya lebih jauh saat hujan."
            ];
        } else if (condition.includes('mendung') || condition.includes('berawan')) {
            adviceDict = [
                "Sedia payung sebelum hujan, karena langit sudah mulai mendung dari sekarang.",
                "Cuaca adem begini enak banget buat jalan-jalan santai, tapi tetap waspada hujan mendadak ya.",
                "Bawa jaket tipis mungkin ide yang bagus untuk menghalau angin yang lumayan kencang.",
                "Nggak ada salahnya bawa jas hujan di jok motormu, sekadar untuk berjaga-jaga.",
                "Kondisi ini pas banget buat aktivitas luar ruangan karena nggak bakal terlalu kepanasan.",
                "Langit agak gelap, kalau bawa kendaraan pastikan lampu utamamu menyala dengan baik ya.",
                "Lebih baik jangan cuci kendaraan dulu deh, takutnya nanti malah turun hujan.",
                "Rencanakan aktivitasmu dengan baik, kalau bisa selesaikan urusan luar sebelum rintik hujan turun.",
                "Anginnya mungkin lumayan terasa, pakai pakaian berlengan panjang bisa bikin lebih nyaman.",
                "Kondisi yang asyik buat berolahraga tanpa takut tersengat sinar matahari!"
            ];
        } else if (condition.includes('badai') || condition.includes('petir') || condition.includes('kabut')) {
            adviceDict = [
                "Sangat disarankan untuk tetap berada di dalam ruangan yang aman sampai cuaca membaik.",
                "Hindari berteduh di bawah pohon besar atau papan reklame jika kamu sedang berada di jalan.",
                "Utamakan keselamatanmu! Lebih baik tunda dulu jadwal bepergian jika tidak mendesak.",
                "Matikan peralatan elektronik yang tidak perlu untuk menghindari risiko korsleting akibat petir.",
                "Kalau sedang menyetir, nyalakan lampu hazard jika jarak pandang sangat buruk akibat kabut/hujan lebat.",
                "Jauhi area tanah lapang dan tiang listrik tinggi demi keamananmu.",
                "Siapkan senter darurat dan pastikan baterai ponselmu penuh, berjaga-jaga jika ada pemadaman listrik.",
                "Tutup semua jendela dan pintu rapat-rapat untuk mencegah air atau angin kencang masuk.",
                "Fokuslah pada keselamatan diri dan keluarga, hindari berkendara di tengah badai.",
                "Tetap tenang, pantau informasi cuaca dari sumber terpercaya, dan jangan panik."
            ];
        } else {
            // Default advice jika kondisinya tidak dikenali
            adviceDict = [
                "Tetap jaga kesehatan dan semangat beraktivitas ya!",
                "Pastikan kamu selalu siap sedia dengan segala kondisi cuaca hari ini.",
                "Jangan lupa makan makanan bergizi untuk menjaga staminamu.",
                "Selalu berhati-hati di jalan dan perhatikan lingkungan sekitarmu.",
                "Semoga harimu menyenangkan dan semua urusanmu dilancarkan!",
                "Apapun cuacanya, senyum dan pikiran positif adalah kunci hari yang indah.",
                "Tetap waspada dan ikuti anjuran keselamatan di lingkunganmu.",
                "Persiapkan dirimu dengan baik sebelum keluar rumah.",
                "Jaga selalu kebersihan dan kesehatan tubuhmu ya.",
                "Mari jalani hari ini dengan penuh semangat dan energi positif!"
            ];
        }

        return pickRandom(adviceDict);
    }

    updateData(current, hourly, daily, units) {
        const currentHour = new Date().getHours();
        const weatherMeta = Utils.getWeatherMeta(current.weather_code);
        const todayUV = Utils.getUVInfo(daily.uv_index_max[0]);

        const hourlyRows = hourly.time.map((time, i) => {
            const date = new Date(time);
            if (date.getDate() !== new Date().getDate() || date.getHours() < currentHour) return '';
            const meta = Utils.getWeatherMeta(hourly.weather_code[i]);
            const isNow = date.getHours() === currentHour ? 'bg-warning text-dark' : '';
            return `
                <td class="text-center ${isNow}" style="min-width: 80px; border-radius: 10px;">
                    <div class="d-flex flex-column align-items-center">
                        <small style="font-size: 2vh;">${date.getHours()}:00</small>
                        <i class="${meta.icon}" style="font-size: 5vh;"></i>
                        <p class="m-0">${hourly.temperature_2m[i]} ${units.temperature_2m}</p>
                    </div>
                </td>`;
        }).join('');

        const dailyRows = daily.time.map((time, i) => {
            const meta = Utils.getWeatherMeta(daily.weather_code[i]);
            const dateStr = new Date(time).toLocaleDateString("id-ID", {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            return `
                <tr>
                    <td>${dateStr}</td>
                    <td><i class="${meta.icon}"></i> ${meta.msg}</td>
                    <td>${daily.temperature_2m_min[i]}°</td>
                    <td>${daily.temperature_2m_max[i]}°</td>
                </tr>`;
        }).join('');

        const humanSummaryText = this._generateHumanSummary(weatherMeta, current.temperature_2m, todayUV.scale);
        const humanAdviceText = this._generateHumanAdvice(weatherMeta);

        this.innerHTML = `
            <div class="row">
                <div class="col-12 col-lg-6 mb-2">
                    <div class="card"><div class="card-body">
                        <h6><i class="bi bi-calendar-day"></i> Hari Ini (Per Jam)</h6>
                        <div class="table-responsive mb-2"><table class="table table-borderless"><tbody><tr>${hourlyRows}</tr></tbody></table></div>
                        <h6><i class="bi bi-calendar-week"></i> Mingguan</h6>
                        <div class="table-responsive"><table class="table table-borderless">
                            <thead><tr><th><i class="bi bi-calendar-date"></i></th><th><i class="bi bi-cloud-sun-fill"></i></th><th><i class="bi bi-thermometer-low"></i></th><th><i class="bi bi-thermometer-high"></i></th></tr></thead>
                            <tbody>${dailyRows}</tbody>
                        </table></div>
                    </div></div>
                </div>
                <div class="col-12 col-lg-6 mb-2">
                    <div class="card"><div class="card-body">
                        <h6><i class="bi bi-chat-right-text"></i> Summary</h6>
                        <p>${humanSummaryText}</p>
                        <h6 class="mt-3"><i class="bi bi-lightbulb"></i> Saran Aktifitas</h6>
                        <p>${humanAdviceText}</p>
                    </div></div>
                </div>
            </div>
        `;
    }

    // Tambahkan di dalam class AppWeatherWidget
    showError(message) {
        this.innerHTML = `
            <div class="card h-100 border-danger">
                <div class="card-body d-flex flex-column justify-content-center align-items-center text-danger text-center">
                    <i class="bi bi-exclamation-triangle-fill mb-2" style="font-size: 3rem;"></i>
                    <h5 class="card-title">Gagal Memuat Cuaca</h5>
                    <p class="card-text">${message}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('app-weather-widget', AppWeatherWidget);
customElements.define('app-weather-details', AppWeatherDetails);