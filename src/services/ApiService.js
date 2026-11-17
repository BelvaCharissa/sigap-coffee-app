/**
 * ApiService.js (Deliverable PWAM #3 - Slide 22)
 * Bertugas mengonsumsi API microservice sendiri + API >= 2 kelompok lain
 * Dilengkapi circuit-breaker timeout, offline cache fallback, dan proteksi crash.
 */

const TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export class ApiService {
  // 1. Snapshot Cuaca Publik via Open-Meteo (Slide 9 & PRD 7.4)
  static async fetchLiveWeather(lat = -6.89, lng = 107.61) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`;

    try {
      const res = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'TugasBesar-TST-PWAM/1.0 (SIGAP-ITB)',
        },
      });

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}`);
      }

      const data = await res.json();
      const current = data.current || {};
      const rain = current.rain ?? 0;

      let kondisi = 'Cerah Berawan';
      if (rain > 15) {
        kondisi = 'Hujan Sangat Lebat (Peringatan Banjir)';
      } else if (rain > 5) {
        kondisi = 'Hujan Sedang';
      } else if (rain > 0.1) {
        kondisi = 'Gerimis Ringan';
      }

      return {
        success: true,
        source: 'Open-Meteo Live API',
        suhu: current.temperature_2m ?? 24.5,
        curahHujanMm: rain,
        kelembaban: current.relative_humidity_2m ?? 80,
        anginKmh: current.wind_speed_10m ?? 8.5,
        kondisi,
        isCuacaEkstrem: rain > 15,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[ApiService] Open-Meteo offline/timeout, using resilient cache:', err.message);
      // Fallback cache agar aplikasi tidak crash
      return {
        success: false,
        source: 'Cache Offline (Fallback Tahan Gangguan)',
        suhu: 23.5,
        curahHujanMm: 12.0,
        kelembaban: 85,
        anginKmh: 10,
        kondisi: 'Hujan Sedang (Cache)',
        isCuacaEkstrem: false,
        isFallback: true,
        errorMessage: err.message,
      };
    }
  }

  // 2. Integrasi Kelompok 1: JalanAman (Smart City & Titik Banjir Warga - K01)
  // Base URL: https://jalanaman.stei.fun/api
  static async fetchPeerJalanAmanReports() {
    const targetUrl = 'https://jalanaman.stei.fun/api/reports?city=bandung';

    try {
      const res = await fetchWithTimeout(targetUrl, {
        headers: {
          'X-API-Key': 'SIGAP-PWAM-PARTNER-KEY-2026',
          'User-Agent': 'SIGAP-PWAM-App/1.0',
        },
      }, 3500);

      if (!res.ok) {
        throw new Error(`JalanAman status ${res.status}`);
      }

      const data = await res.json();
      return {
        status: 'Online',
        source: 'jalanaman.stei.fun',
        data,
      };
    } catch (err) {
      // Sesuai aturan: jika API kelompok lain mati/timeout, aplikasi tetap jalan & sediakan mock/cache
      return {
        status: 'Mock / Cache Siaga',
        source: 'Mock Kontrak OpenAPI jalanaman.stei.fun',
        message: 'Endpoint kelompok JalanAman sedang offline, menggunakan data sinkronisasi lokal.',
        data: [
          {
            id: 'ja_rep_1',
            lokasi: 'Jl. Pasteur simpang Surya Sumantri',
            status: 'Banjir 30cm',
            kondisi: 'Tersendat',
            waktu: '20 menit lalu',
          },
          {
            id: 'ja_rep_2',
            lokasi: 'Jl. Supratman dekat PPI',
            status: 'Lancar',
            kondisi: 'Gerimis',
            waktu: '35 menit lalu',
          },
        ],
      };
    }
  }

  // 3. Integrasi Kelompok 2: SehatDekat (Faskes & Antrean Terdekat - K02)
  // Base URL: https://sehatdekat.stei.site/api
  static async fetchPeerSehatDekatQueues() {
    const targetUrl = 'https://sehatdekat.stei.site/api/queues';

    try {
      const res = await fetchWithTimeout(targetUrl, {
        headers: {
          'X-API-Key': 'SIGAP-HEALTH-KEY-2026',
        },
      }, 3500);

      if (!res.ok) throw new Error(`SehatDekat status ${res.status}`);
      const data = await res.json();
      return {
        status: 'Online',
        source: 'sehatdekat.stei.site',
        data,
      };
    } catch (err) {
      return {
        status: 'Mock / Cache Siaga',
        source: 'Mock Kontrak OpenAPI sehatdekat.stei.site',
        message: 'Endpoint SehatDekat belum aktif di Registry, menampilkan antrean simulasi terintegrasi.',
        data: [
          {
            faskes: 'Apotek Kimia Farma Dago',
            antreanResep: 3,
            estimasiTungguMenit: 8,
          },
          {
            faskes: 'Puskesmas Dago Girang',
            antreanPoliUmum: 14,
            estimasiTungguMenit: 35,
          },
          {
            faskes: 'RS Santo Borromeus (IGD)',
            statusIGD: 'Siaga Normal',
            kapasitasTersedia: 6,
          },
        ],
      };
    }
  }
}

export default ApiService;
