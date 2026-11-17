/**
 * ApiService.js (Deliverable PWAM #3 - Slide 22 & PRD Bab 7 & 9)
 * 
 * Bertugas mengonsumsi API microservice SIGAP sendiri + API >= 2 kelompok lain:
 * 1. Kelompok 1: JalanAman (Smart City & Titik Banjir - K01: https://jalanaman.stei.fun/api)
 * 2. Kelompok 2: SehatDekat (Health & Antrean Faskes - K02: https://sehatdekat.stei.site/api)
 * 
 * Dilengkapi:
 * - Circuit-breaker timeout (3.5s - 5s)
 * - Resilient offline cache fallback agar aplikasi TIDAK PERNAH CRASH di Expo Go
 * - URL backend dinamis (Production Cloudflare Tunnel / Local LAN IP / Mock)
 */

import { INITIAL_FASKES, INITIAL_OBAT, INITIAL_KARTU_SIAGA } from '../contexts/direktori-faskes/infrastructure/initialFaskesData';

const TIMEOUT_MS = 5000;

// Hostname terdaftar sesuai aturan kelas K01/K02
let activeBaseUrl = 'https://sigap.stei.fun/api';

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
  /**
   * Atur base URL backend (bisa diganti ke IP laptop saat uji coba Expo Go lokal)
   */
  static setBaseUrl(newUrl) {
    if (newUrl && newUrl.trim()) {
      activeBaseUrl = newUrl.trim().replace(/\/+$/, '');
    }
  }

  static getBaseUrl() {
    return activeBaseUrl;
  }

  // ====================================================
  // 1. HEALTH CHECK MICROSERVICE
  // ====================================================
  static async checkHealth() {
    try {
      const res = await fetchWithTimeout(`${activeBaseUrl}/health`, {}, 3000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { success: true, isLive: true, data };
    } catch (err) {
      return {
        success: false,
        isLive: false,
        message: 'Microservice belum terhubung via network. Mengaktifkan mode mandiri offline.',
        error: err.message,
      };
    }
  }

  // ====================================================
  // 2. AUTHENTICATION & LOGIN (JWT Bonus TST +10%)
  // ====================================================
  static async login(email, password) {
    try {
      const res = await fetchWithTimeout(`${activeBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 4000);

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Login gagal');
      return { success: true, ...json };
    } catch (err) {
      console.warn('[ApiService] Backend login fallback to local auth:', err.message);
      // Fallback local mock user auth
      return {
        success: true,
        isFallback: true,
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 'usr_local_demo',
          nama: email.includes('mitra') ? 'Belva Charissa (Mitra Faskes)' : 'Indah Ramadhani (Warga)',
          email,
          role: email.includes('mitra') ? 'Mitra' : 'Warga',
          nim: email.includes('mitra') ? '18224051' : '18224037',
          reputasi: 88,
        },
      };
    }
  }

  static async register(userData) {
    try {
      const res = await fetchWithTimeout(`${activeBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }, 4000);

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Registrasi gagal');
      return { success: true, ...json };
    } catch (err) {
      return {
        success: true,
        isFallback: true,
        token: 'mock_jwt_reg_' + Date.now(),
        user: {
          id: 'usr_reg_' + Date.now(),
          nama: userData.nama,
          email: userData.email,
          role: userData.role || 'Warga',
          nim: userData.nim || '18224037',
          reputasi: 60,
        },
      };
    }
  }

  // ====================================================
  // 3. DIREKTORI FASKES (Supporting Subdomain)
  // ====================================================
  static async fetchFaskes(query = '', kategori = 'Semua') {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (kategori && kategori !== 'Semua') params.append('kategori', kategori);

      const res = await fetchWithTimeout(`${activeBaseUrl}/faskes?${params.toString()}`, {}, 3500);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[ApiService] Using local faskes fallback:', err.message);
      return null; // Return null to let screen use local service data
    }
  }

  // ====================================================
  // 4. KONDISI JALAN & CUACA (Open-Meteo + Laporan Warga)
  // ====================================================
  static async fetchLiveWeather(lat = -6.89, lng = 107.61) {
    const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`;

    try {
      const res = await fetchWithTimeout(directUrl, {
        headers: { 'User-Agent': 'TugasBesar-TST-PWAM/1.0 (SIGAP-ITB)' },
      }, 3500);

      if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

      const data = await res.json();
      const current = data.current || {};
      const rain = current.rain ?? 0;

      let kondisi = 'Cerah Berawan';
      if (rain > 15) kondisi = 'Hujan Sangat Lebat (Peringatan Banjir)';
      else if (rain > 5) kondisi = 'Hujan Sedang';
      else if (rain > 0.1) kondisi = 'Gerimis Ringan';

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
      console.warn('[ApiService] Open-Meteo fallback cache active:', err.message);
      return {
        success: false,
        source: 'Cache Offline Siaga',
        suhu: 23.8,
        curahHujanMm: 14.0,
        kelembaban: 85,
        anginKmh: 9.5,
        kondisi: 'Hujan Sedang (Siaga Genangan Air)',
        isCuacaEkstrem: false,
        isFallback: true,
        errorMessage: err.message,
      };
    }
  }

  // ====================================================
  // 5. INTEGRASI KELOMPOK 1: JalanAman (Smart City & Titik Banjir - K01)
  // Base URL: https://jalanaman.stei.fun/api
  // ====================================================
  static async fetchPeerJalanAmanReports() {
    const targetUrl = 'https://jalanaman.stei.fun/api/reports?city=bandung';

    try {
      const res = await fetchWithTimeout(targetUrl, {
        headers: {
          'X-API-Key': 'SIGAP-PWAM-PARTNER-KEY-2026',
          'User-Agent': 'SIGAP-PWAM-App/1.0',
        },
      }, 3000);

      if (!res.ok) throw new Error(`JalanAman status ${res.status}`);
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
        message: 'Endpoint peer kelompok JalanAman sedang offline, menggunakan data sinkronisasi lokal.',
        data: [
          {
            id: 'ja_rep_1',
            lokasi: 'Jl. Pasteur simpang Surya Sumantri',
            status: 'Banjir 30cm',
            kondisi: 'Macet Tersendat',
            waktu: '15 menit lalu',
          },
          {
            id: 'ja_rep_2',
            lokasi: 'Jl. Supratman dekat PPI',
            status: 'Lancar',
            kondisi: 'Gerimis Ringan',
            waktu: '35 menit lalu',
          },
        ],
      };
    }
  }

  // ====================================================
  // 6. INTEGRASI KELOMPOK 2: SehatDekat (Faskes & Antrean Terdekat - K02)
  // Base URL: https://sehatdekat.stei.site/api
  // ====================================================
  static async fetchPeerSehatDekatQueues() {
    const targetUrl = 'https://sehatdekat.stei.site/api/queues';

    try {
      const res = await fetchWithTimeout(targetUrl, {
        headers: {
          'X-API-Key': 'SIGAP-HEALTH-KEY-2026',
        },
      }, 3000);

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
