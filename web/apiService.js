/**
 * Web ApiService for SIGAP Web Layout
 * Connects directly to backend API (/api/...) or fallback
 */

const DEFAULT_TIMEOUT_MS = 5000;
let activeBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://sigap.stei.fun/api';

let authToken = localStorage.getItem('sigap_token') || null;

export const WebApiService = {
  setBaseUrl(url) {
    if (url) activeBaseUrl = url.trim().replace(/\/+$/, '');
  },
  getBaseUrl() {
    return activeBaseUrl;
  },
  setToken(t) {
    authToken = t;
    if (t) localStorage.setItem('sigap_token', t);
    else localStorage.removeItem('sigap_token');
  },
  getToken() {
    return authToken;
  },

  async request(path, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      };
      const res = await fetch(`${activeBaseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(id);
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  },

  async checkHealth() {
    try {
      return await this.request('/health');
    } catch (e) {
      return { status: 'OFFLINE', message: 'Backend belum menyala' };
    }
  },

  async login(email, password) {
    try {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) this.setToken(res.token);
      return res;
    } catch (e) {
      const isMitra = email.includes('mitra');
      const fallback = {
        success: true,
        token: 'web_jwt_demo_' + Date.now(),
        user: {
          id: isMitra ? 'usr_mitra_demo' : 'usr_warga_demo',
          nama: isMitra ? 'Belva Charissa (Mitra)' : 'Indah Ramadhani (Warga)',
          email,
          role: isMitra ? 'Mitra' : 'Warga',
          nim: isMitra ? '18224051' : '18224037',
          reputasi: 88,
        },
      };
      this.setToken(fallback.token);
      return fallback;
    }
  },

  async fetchFaskes(query = '', kategori = 'Semua') {
    try {
      const q = new URLSearchParams();
      if (query) q.append('q', query);
      if (kategori && kategori !== 'Semua') q.append('kategori', kategori);
      const res = await this.request(`/faskes?${q.toString()}`);
      return res.data || [];
    } catch (e) {
      return [
        {
          id: 'faskes_1',
          nama: 'Puskesmas Dago Girang',
          jenis: 'Puskesmas',
          alamat: 'Jl. Ir. H. Juanda No. 340, Dago, Bandung',
          telepon: '022-2501234',
          jamBuka: '24 Jam (Siaga)',
          rating: 4.8,
          distance: '0.8 km',
          isClaimed: true,
        },
        {
          id: 'faskes_2',
          nama: 'Apotek Kimia Farma Dago',
          jenis: 'Apotek',
          alamat: 'Jl. Ir. H. Juanda No. 120, Bandung',
          telepon: '022-2505678',
          jamBuka: '07:00 - 22:00',
          rating: 4.9,
          distance: '1.2 km',
          isClaimed: true,
        },
        {
          id: 'faskes_3',
          nama: 'RS Santo Borromeus (IGD)',
          jenis: 'Rumah Sakit',
          alamat: 'Jl. Ir. H. Juanda No. 100, Lebakgede, Coblong',
          telepon: '022-2552000',
          jamBuka: '24 Jam IGD & Rawat Inap',
          rating: 4.9,
          distance: '1.5 km',
          isClaimed: true,
        },
        {
          id: 'faskes_4',
          nama: 'Klinik Pratama Dipatiukur',
          jenis: 'Klinik',
          alamat: 'Jl. Dipatiukur No. 45, Bandung',
          telepon: '022-2509988',
          jamBuka: '08:00 - 20:00',
          rating: 4.6,
          distance: '2.1 km',
          isClaimed: false,
        },
      ];
    }
  },

  async fetchWeather() {
    try {
      const res = await this.request('/kondisi-jalan/cuaca');
      return res.data || res;
    } catch (e) {
      return {
        suhu: 24.2,
        curahHujanMm: 12.5,
        kelembaban: 86,
        kondisi: 'Hujan Sedang (Siaga Genangan)',
      };
    }
  },

  async hitungRuteAman(targetFaskes) {
    try {
      const res = await this.request('/rute-aman/hitung', {
        method: 'POST',
        body: JSON.stringify({ faskesId: targetFaskes?.id || 'faskes_1' }),
      });
      return res.data || res;
    } catch (e) {
      return {
        ruteTerpilih: 'Rute Teraman via Jl. Cisitu Lama',
        estimasiWaktuMenit: 12,
        jarakKm: 2.8,
        skorKeamanan: 94,
        levelRisiko: 'Aman',
        titikBahayaDihindari: ['Genangan Simpang Dago (30cm)'],
      };
    }
  },
};
