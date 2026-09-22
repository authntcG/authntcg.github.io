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
            <div class="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                <div class="p-4 flex justify-center items-center h-full min-h-[150px]">
                    <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" role="status"></div>
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
        <div class="bg-white dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="p-4">
                <div class="flex flex-wrap -mx-2">
                    <div class="w-full px-2 mb-2">
                        <div class="flex items-center">
                            <div class="w-2/3">
                                <h5 class="text-3xl font-light">Weather Info</h5>
                            </div>
                            <div class="w-1/3 flex justify-end">
                                <app-button extra-class="btn-info-modal" variant="transparent" data-bs-toggle="modal" data-bs-target="#infoModal" data-latitude="${lat}" data-longitude="${lon}">
                                    <i class="bi bi-info-circle-fill text-xl text-blue-500 hover:text-blue-600 transition-colors"></i>
                                </app-button>
                            </div>
                        </div>
                    </div>
                    <div class="w-full lg:w-2/3 px-2 mb-4 lg:mb-0">
                        <div class="flex justify-center items-center h-full">
                            <div class="flex flex-wrap w-full items-center">
                                <div class="w-full">
                                    <p class="${meta.icon} text-center text-7xl font-light mb-[-15px]"></p>
                                </div>
                                <div class="w-full">
                                    <h5 class="text-center text-xl font-medium mb-1">${meta.msg}</h5>
                                    <p class="text-center capitalize text-gray-600">
                                        <strong class="font-bold">${current.temperature_2m}${units.temperature_2m}</strong>, terasa <strong class="font-bold">${current.apparent_temperature}${units.apparent_temperature}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="w-full lg:w-1/3 px-2">
                        <div class="flex flex-wrap lg:flex-col -mx-1 lg:mx-0 hidden md:flex">
                            <div class="w-1/2 lg:w-full px-1 lg:px-0 mb-2">
                                <div class="bg-white dark:bg-gray-800/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700"><p class="m-0 text-sm text-gray-700 dark:text-gray-200"><i class="bi bi-info-circle mr-1"></i> ${meta.msg}</p></div>
                            </div>
                            <div class="w-1/2 lg:w-full px-1 lg:px-0 mb-2">
                                <div class="bg-white dark:bg-gray-800/50 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700"><p class="m-0 text-sm text-gray-700 dark:text-gray-200"><i class="bi bi-wind mr-1"></i> ${current.wind_speed_10m} ${units.wind_speed_10m} (${windDir})</p></div>
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
    static DICTIONARY = {
        opening: {
            clear: ["Cuaca di luar sedang cerah dan sangat bersahabat.", "Matahari bersinar terang hari ini, cuacanya sungguh cerah.", "Langit biru dan cerah menyertai hari ini, asyik buat jalan-jalan.", "Saat ini cuaca cerah ceria, pas sekali untuk aktivitas di luar.", "Wah, cuacanya sedang bagus dan cerah sekali di luar sana.", "Hari ini sangat cerah, tidak ada tanda-tanda awan gelap.", "Cuaca yang indah dan cerah untuk menjalani aktivitasmu.", "Langit tampak bersih dan cerah, pemandangan yang menyegarkan.", "Sedang cerah-cerahnya nih, jangan lupa senyum hari ini.", "Kondisi di luar terpantau cerah dan sangat mendukung suasana hati."],
            rain: ["Sepertinya di luar sedang turun hujan.", "Hujan sedang mengguyur nih, jangan lupa sedia payung ya.", "Di luar terpantau hujan, lebih enak santai di dalam ruangan.", "Sedang hujan rupanya, hati-hati jika harus bepergian.", "Rintik hujan sedang turun membasahi bumi.", "Cuaca sedang hujan, pastikan bawa jas hujan atau payung sebelum keluar.", "Air hujan sedang turun, cuaca yang pas untuk minum teh hangat.", "Tampaknya sedang hujan di luar sana, jaga kesehatanmu.", "Hujan membasahi jalanan saat ini, awas licin kalau berkendara.", "Sedang hujan nih, suasana di luar jadi lebih syahdu."],
            cloudy: ["Langit tampak berawan dan mendung hari ini.", "Awan tampak menutupi matahari, cuacanya sedang mendung.", "Suasana cukup teduh karena langit sedang berawan.", "Saat ini cuaca sedang berawan, matahari lagi sembunyi.", "Langit terlihat mendung, sepertinya matahari sedang malas bersinar.", "Cuacanya cukup syahdu nih, banyak awan menggantung di langit.", "Mendung menyelimuti langit, bersiap saja kalau nanti tiba-tiba hujan.", "Terpantau berawan, udara jadi tidak terlalu terik menyengat.", "Kondisi langit cukup berawan hari ini, lumayan adem.", "Awan tebal sedang menghiasi langit, cuacanya agak mendung."],
            extreme: ["Cuaca sedang kurang bersahabat di luar sana.", "Hati-hati, kondisi di luar sedang ada badai atau kabut tebal.", "Cuaca ekstrem sedang terjadi, lebih baik tetap berada di dalam rumah.", "Sedang terjadi cuaca buruk, hindari aktivitas di ruang terbuka.", "Kondisi di luar kurang aman karena badai atau jarak pandang yang terbatas.", "Peringatan cuaca! Sedang ada badai atau kabut di luar.", "Cuacanya lagi galak nih, sebaiknya tunda dulu rencana keluarmu.", "Langit sedang tidak kompromi, terpantau cuaca ekstrem di luar.", "Sebaiknya cari tempat aman, cuaca di luar sedang sangat buruk.", "Alam sedang bergejolak, tetap waspada dengan cuaca saat ini."]
        },
        temp: {
            // Gunakan placeholder {TEMP} agar bisa diganti secara dinamis nanti
            hot: ["Udara terasa lumayan panas dengan suhu mencapai {TEMP}°C.", "Panasnya cukup menyengat nih, suhunya ada di angka {TEMP}°C.", "Suhu menyentuh {TEMP}°C, gampang banget bikin berkeringat.", "Cukup gerah hari ini karena suhu berada di {TEMP}°C.", "Udara di luar cukup terik dengan temperatur {TEMP}°C.", "Suhu udara lumayan tinggi, sekitar {TEMP}°C.", "Hawanya sedang panas-panasnya nih, tercatat {TEMP}°C.", "Dengan suhu {TEMP}°C, pastikan kamu banyak minum air putih ya.", "Temperatur mencapai {TEMP}°C, rasanya seperti sedang dipanggang.", "Udara gerah mendominasi dengan suhu sekitar {TEMP}°C."],
            cold: ["Udaranya terasa cukup sejuk dan dingin di angka {TEMP}°C.", "Suhu sedang turun ke {TEMP}°C, pas banget buat pakai jaket kesayanganmu.", "Lumayan dingin nih, suhunya cuma sekitar {TEMP}°C.", "Hawanya menyejukkan dengan temperatur di angka {TEMP}°C.", "Udara terasa dingin menyegarkan, suhunya {TEMP}°C.", "Bikin menggigil sedikit, suhu saat ini {TEMP}°C.", "Suhu cukup rendah di {TEMP}°C, jangan lupa pakai pakaian hangat.", "Udaranya lagi adem banget, tercatat di angka {TEMP}°C.", "Cukup sejuk hari ini karena suhunya bertahan di {TEMP}°C.", "Cuacanya asyik nih buat tarik selimut, suhu udara mencapai {TEMP}°C."],
            normal: ["Suhu udara terasa cukup nyaman di kisaran {TEMP}°C.", "Hawanya sedang-sedang saja, suhunya sekitar {TEMP}°C.", "Temperatur terpantau sangat ideal di angka {TEMP}°C.", "Suhu berada di {TEMP}°C, tidak terlalu panas dan tidak terlalu dingin.", "Udaranya terasa sangat pas untuk beraktivitas, dengan suhu {TEMP}°C.", "Dengan suhu {TEMP}°C, cuacanya lumayan bersahabat buat jalan-jalan.", "Suhu normal tercatat di {TEMP}°C, cukup bikin rileks.", "Kondisi temperatur sangat wajar, ada di kisaran {TEMP}°C.", "Suhu udara yang enak banget nih, ada di sekitar {TEMP}°C.", "Tercatat suhu {TEMP}°C, cuaca yang benar-benar nyaman untuk hari ini."]
        },
        uv: {
            // Gunakan placeholder {UV}
            high: ["Hati-hati ya, paparan sinar UV matahari sedang menyengat (Level: {UV}).", "Indeks UV cukup mengkhawatirkan di level {UV}, wajib pakai sunscreen!", "Peringatan! Sinar UV masuk level {UV}, jangan berlama-lama di bawah matahari terik.", "Radiasi UV sangat tinggi (Level: {UV}), lindungi kulitmu dengan baik.", "Level UV mencapai status {UV}, sebaiknya berteduh jika memungkinkan.", "Matahari sedang sangat jahat dengan UV level {UV}, selalu gunakan pelindung.", "Waspada UV level {UV}, ini bisa merusak kulit kalau tidak dilindungi.", "Sinar ultraviolet sangat kuat hari ini (Level: {UV}), pakai topi atau payung ya.", "Indeks UV menyentuh level {UV}, batasi aktivitas di luar ruangan sebisa mungkin.", "Paparan radiasi UV sedang berbahaya di level {UV}, jaga dirimu baik-baik."],
            normal: ["Paparan sinar UV masih tergolong aman (Level: {UV}).", "Tidak perlu khawatir, indeks UV terpantau bersahabat di level {UV}.", "Sinar matahari cukup ramah di kulit, UV hanya berada di level {UV}.", "Tingkat UV saat ini adalah {UV}, cukup aman untuk jalan-jalan santai.", "Radiasi UV relatif rendah di level {UV}, sangat aman beraktivitas di luar.", "Level UV menunjukan status {UV}, kamu bisa bernapas lega.", "Matahari bersinar lembut, indeks UV tercatat di level {UV}.", "Kondisi UV yang aman (Level: {UV}), tidak perlu terlalu cemas.", "Sinar ultraviolet tidak terlalu menyengat, terpantau di level {UV}.", "Indeks UV ada di level {UV}, nikmati waktu di luar ruangan dengan nyaman."]
        },
        advice: {
            clear: ["Jangan lupa pakai tabir surya (sunscreen) ya kalau mau berlama-lama di luar.", "Cuaca cerah begini paling pas pakai kacamata hitam dan pakaian berbahan katun yang menyerap keringat.", "Sedia air minum yang cukup biar kamu nggak dehidrasi saat beraktivitas.", "Topi dan sunscreen adalah sahabat terbaikmu untuk hari yang cerah ini.", "Cuacanya asyik nih buat olahraga ringan atau sekadar jalan sore santai.", "Jaga asupan cairan tubuhmu, karena cuaca cerah bisa bikin cepat haus.", "Kalau mau menjemur pakaian atau barang, ini adalah waktu yang paling tepat!", "Manfaatkan cuaca bagus ini untuk cari udara segar, tapi hindari sinar matahari langsung di siang bolong ya.", "Pakaian berwarna cerah dan berbahan tipis sangat direkomendasikan untuk hari ini.", "Tetap sedia air putih ke mana pun kamu pergi agar tubuh selalu segar bugar."],
            rain: ["Pastiin payung atau jas hujan sudah masuk ke dalam tasmu ya sebelum pergi.", "Kalau harus berkendara, pelan-pelan saja ya karena jalanan pasti licin.", "Cuaca begini paling enak diseduhin teh atau kopi hangat sambil santai di dalam ruangan.", "Jangan lupa pakai pakaian yang agak tebal biar tubuhmu tetap hangat.", "Amankan barang-barang elektronikmu ke dalam tas anti-air kalau mau bepergian.", "Kalau hujannya deras, lebih baik neduh dulu deh, jangan memaksakan diri.", "Pakai alas kaki yang anti-selip biar kamu nggak terpeleset di jalanan yang basah.", "Pastikan jemuran sudah diangkat ya, biar nggak basah kuyup lagi.", "Sedia vitamin ekstra untuk menjaga daya tahan tubuhmu di cuaca basah ini.", "Tetap jaga jarak aman saat mengemudi ya, jarak pengereman biasanya lebih jauh saat hujan."],
            cloudy: ["Sedia payung sebelum hujan, karena langit sudah mulai mendung dari sekarang.", "Cuaca adem begini enak banget buat jalan-jalan santai, tapi tetap waspada hujan mendadak ya.", "Bawa jaket tipis mungkin ide yang bagus untuk menghalau angin yang lumayan kencang.", "Nggak ada salahnya bawa jas hujan di jok motormu, sekadar untuk berjaga-jaga.", "Kondisi ini pas banget buat aktivitas luar ruangan karena nggak bakal terlalu kepanasan.", "Langit agak gelap, kalau bawa kendaraan pastikan lampu utamamu menyala dengan baik ya.", "Lebih baik jangan cuci kendaraan dulu deh, takutnya nanti malah turun hujan.", "Rencanakan aktivitasmu dengan baik, kalau bisa selesaikan urusan luar sebelum rintik hujan turun.", "Anginnya mungkin lumayan terasa, pakai pakaian berlengan panjang bisa bikin lebih nyaman.", "Kondisi yang asyik buat berolahraga tanpa takut tersengat sinar matahari!"],
            extreme: ["Sangat disarankan untuk tetap berada di dalam ruangan yang aman sampai cuaca membaik.", "Hindari berteduh di bawah pohon besar atau papan reklame jika kamu sedang berada di jalan.", "Utamakan keselamatanmu! Lebih baik tunda dulu jadwal bepergian jika tidak mendesak.", "Matikan peralatan elektronik yang tidak perlu untuk menghindari risiko korsleting akibat petir.", "Kalau sedang menyetir, nyalakan lampu hazard jika jarak pandang sangat buruk akibat kabut/hujan lebat.", "Jauhi area tanah lapang dan tiang listrik tinggi demi keamananmu.", "Siapkan senter darurat dan pastikan baterai ponselmu penuh, berjaga-jaga jika ada pemadaman listrik.", "Tutup semua jendela dan pintu rapat-rapat untuk mencegah air atau angin kencang masuk.", "Fokuslah pada keselamatan diri dan keluarga, hindari berkendara di tengah badai.", "Tetap tenang, pantau informasi cuaca dari sumber terpercaya, dan jangan panik."]
        }
    };

    _getConditionKey(conditionStr) {
        if (conditionStr.includes('cerah')) return 'clear';
        if (conditionStr.includes('hujan') || conditionStr.includes('gerimis')) return 'rain';
        if (conditionStr.includes('mendung') || conditionStr.includes('berawan')) return 'cloudy';
        if (conditionStr.includes('badai') || conditionStr.includes('petir') || conditionStr.includes('kabut')) return 'extreme';
        return 'default';
    }

    _pickRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    _generateHumanSummary(meta, temp, uvScale) {
        const condition = meta.msg.toLowerCase();
        const key = this._getConditionKey(condition);

        // A. Susun Pembuka
        let opening = "";
        if (key === 'default') {
            const defaults = [`Saat ini cuaca terpantau ${condition}.`, `Kondisi langit saat ini menunjukkan status ${condition}.`, `Informasi cuaca terkini: ${condition}.`, `Secara umum, cuaca di luar sedang ${condition}.`];
            opening = this._pickRandom(defaults);
        } else {
            opening = this._pickRandom(AppWeatherDetails.DICTIONARY.opening[key]);
        }

        // B. Susun Suhu (Ganti placeholder {TEMP} dengan angka asli)
        let tempKey = 'normal';
        if (temp >= 30) tempKey = 'hot';
        else if (temp <= 22) tempKey = 'cold';
        
        let tempText = this._pickRandom(AppWeatherDetails.DICTIONARY.temp[tempKey]);
        tempText = tempText.replace('{TEMP}', temp);

        // C. Susun UV (Ganti placeholder {UV} dengan angka asli)
        let uvKey = 'normal';
        if (['Tinggi', 'Sangat Tinggi', 'Ekstrem'].includes(uvScale)) uvKey = 'high';
        
        let uvText = this._pickRandom(AppWeatherDetails.DICTIONARY.uv[uvKey]);
        uvText = uvText.replace('{UV}', uvScale);

        // Kembalikan gabungan kalimat
        return `${opening} ${tempText} ${uvText}`;
    }

    _generateHumanAdvice(meta) {
        const key = this._getConditionKey(meta.msg.toLowerCase());
        
        if (key === 'default') {
            const defaults = ["Tetap jaga kesehatan dan semangat beraktivitas ya!", "Pastikan kamu selalu siap sedia dengan segala kondisi cuaca hari ini.", "Semoga harimu menyenangkan dan semua urusanmu dilancarkan!"];
            return this._pickRandom(defaults);
        }
        
        return this._pickRandom(AppWeatherDetails.DICTIONARY.advice[key]);
    }

    updateData(current, hourly, daily, units) {
        const currentHour = new Date().getHours();
        const weatherMeta = Utils.getWeatherMeta(current.weather_code);
        const todayUV = Utils.getUVInfo(daily.uv_index_max[0]);

        const hourlyRows = hourly.time.map((time, i) => {
            const date = new Date(time);
            if (date.getDate() !== new Date().getDate() || date.getHours() < currentHour) return '';
            const meta = Utils.getWeatherMeta(hourly.weather_code[i]);
            const isNow = date.getHours() === currentHour ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/50' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700';
            return `
                <div class="flex-shrink-0 text-center rounded-xl p-3 border shadow-sm ${isNow} min-w-[80px]">
                    <div class="flex flex-col items-center">
                        <small class="text-sm font-medium mb-1">${date.getHours()}:00</small>
                        <i class="${meta.icon} text-3xl mb-1"></i>
                        <p class="m-0 text-sm">${hourly.temperature_2m[i]} ${units.temperature_2m}</p>
                    </div>
                </div>`;
        }).join('');

        const dailyRows = daily.time.map((time, i) => {
            const meta = Utils.getWeatherMeta(daily.weather_code[i]);
            const dateStr = new Date(time).toLocaleDateString("id-ID", {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            return `
                <tr class="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td class="py-3 px-2 whitespace-nowrap">${dateStr}</td>
                    <td class="py-3 px-2"><i class="${meta.icon} mr-1 text-gray-500"></i> ${meta.msg}</td>
                    <td class="py-3 px-2 text-right text-blue-500 font-medium">${daily.temperature_2m_min[i]}°</td>
                    <td class="py-3 px-2 text-right text-red-500 font-medium">${daily.temperature_2m_max[i]}°</td>
                </tr>`;
        }).join('');

        const humanSummaryText = this._generateHumanSummary(weatherMeta, current.temperature_2m, todayUV.scale);
        const humanAdviceText = this._generateHumanAdvice(weatherMeta);

        this.innerHTML = `
            <div class="flex flex-wrap -mx-2">
                <div class="w-full lg:w-1/2 px-2 mb-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                        <div class="p-5">
                            <h6 class="text-lg font-medium mb-3"><i class="bi bi-calendar-day mr-2"></i> Hari Ini (Per Jam)</h6>
                            <div class="flex overflow-x-auto space-x-3 pb-4 mb-4 snap-x">${hourlyRows}</div>
                            <h6 class="text-lg font-medium mb-3"><i class="bi bi-calendar-week mr-2"></i> Mingguan</h6>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-sm">
                                    <thead><tr class="text-gray-500 border-b border-gray-200 dark:border-gray-700"><th class="py-2 px-2 font-normal"><i class="bi bi-calendar-date"></i></th><th class="py-2 px-2 font-normal"><i class="bi bi-cloud-sun-fill"></i></th><th class="py-2 px-2 font-normal text-right"><i class="bi bi-thermometer-low"></i></th><th class="py-2 px-2 font-normal text-right"><i class="bi bi-thermometer-high"></i></th></tr></thead>
                                    <tbody>${dailyRows}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full lg:w-1/2 px-2 mb-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                        <div class="p-5">
                            <h6 class="text-lg font-medium mb-3 text-blue-600"><i class="bi bi-chat-right-text mr-2"></i> Summary</h6>
                            <p class="text-gray-700 dark:text-gray-200 leading-relaxed">${humanSummaryText}</p>
                            <h6 class="text-lg font-medium mt-6 mb-3 text-green-600"><i class="bi bi-lightbulb mr-2"></i> Saran Aktifitas</h6>
                            <p class="text-gray-700 dark:text-gray-200 leading-relaxed">${humanAdviceText}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Tambahkan di dalam class AppWeatherWidget
    showError(message) {
        this.innerHTML = `
            <div class="bg-red-50 rounded-xl shadow-sm border border-red-200 h-full">
                <div class="p-5 flex flex-col justify-center items-center h-full min-h-[150px] text-red-500 text-center">
                    <i class="bi bi-exclamation-triangle-fill mb-3 text-5xl"></i>
                    <h5 class="text-xl font-medium mb-2 text-red-700">Gagal Memuat Cuaca</h5>
                    <p class="text-red-600">${message}</p>
                </div>
            </div>
        `;
    }
}

customElements.define('app-weather-widget', AppWeatherWidget);
customElements.define('app-weather-details', AppWeatherDetails);