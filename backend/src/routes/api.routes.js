const express = require('express');
const router = express.Router();
const {
  INITIAL_FASKES,
  INITIAL_OBAT,
  INITIAL_LAPORAN_STOK,
  INITIAL_BAHAYA_JALAN,
  INITIAL_KARTU_SIAGA,
  INITIAL_USERS,
  INITIAL_KLAIM_FASKES,
} = require('../data/seedData');

const PenghitungStatusStok = require('../domain/PenghitungStatusStok');
const PenilaiKeamananRute = require('../domain/PenilaiKeamananRute');
const PemilihKartu = require('../domain/PemilihKartu');
const {
  generateToken,
  verifyUserToken,
  optionalUserToken,
  verifyApiKey,
  requireRole,
} = require('../middleware/auth');

// In-Memory Database Store (Initialized from seedData)
let faskesDB = [...INITIAL_FASKES];
let obatDB = [...INITIAL_OBAT];
let laporanStokDB = [...INITIAL_LAPORAN_STOK];
let bahayaJalanDB = [...INITIAL_BAHAYA_JALAN];
let kartuSiagaDB = [...INITIAL_KARTU_SIAGA];
let usersDB = [...INITIAL_USERS];
let klaimDB = [...INITIAL_KLAIM_FASKES];

// Cached weather
let cuacaCache = {
  suhu: 24.2,
  curahHujanMm: 14.5,
  kelembaban: 86,
  anginKmh: 9.0,
  kondisi: 'Hujan Sedang (Siaga Genangan Air)',
  isCuacaEkstrem: false,
  lastUpdated: new Date().toISOString(),
};

// ----------------------------------------------------
// 1. HEALTH CHECK
// ----------------------------------------------------
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'sigap-core-service',
    group: 'sigap',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    contexts: [
      'direktori-faskes',
      'ketersediaan-obat',
      'kondisi-jalan',
      'rute-aman',
      'panduan-siaga',
      'akun-mitra',
    ],
  });
});

// ----------------------------------------------------
// 2. AUTH & MITRA (Generic Subdomain)
// ----------------------------------------------------
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
  }

  const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || (password && user.passwordHash !== password)) {
    return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak valid.' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: `Selamat datang kembali, ${user.nama}!`,
    token,
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      nim: user.nim,
      reputasi: user.reputasi,
      faskesTerkaitId: user.faskesTerkaitId,
    },
  });
});

router.post('/auth/register', (req, res) => {
  const { nama, email, password, role, nim } = req.body;
  if (!nama || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
  }

  const existing = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar di sistem.' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    nama,
    email,
    passwordHash: password,
    role: role === 'Mitra' ? 'Mitra' : 'Warga',
    nim: nim || 'Warga-Publik',
    reputasi: role === 'Mitra' ? 80 : 50,
  };

  usersDB.push(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Pendaftaran berhasil.',
    token,
    user: newUser,
  });
});

router.get('/auth/me', verifyUserToken, (req, res) => {
  const user = usersDB.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
  res.json({ success: true, user });
});

router.post('/auth/switch-role', verifyUserToken, (req, res) => {
  const { targetRole } = req.body;
  const user = usersDB.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (['Warga', 'Mitra', 'Admin'].includes(targetRole)) {
    user.role = targetRole;
    const newToken = generateToken(user);
    return res.json({ success: true, message: `Peran berhasil diubah ke ${targetRole}`, user, token: newToken });
  }
  res.status(400).json({ success: false, message: 'Peran tidak valid.' });
});

// Klaim Faskes
router.get('/klaim', verifyUserToken, (req, res) => {
  if (req.user.role === 'Admin') {
    return res.json({ success: true, data: klaimDB });
  }
  const myClaims = klaimDB.filter(k => k.userId === req.user.id);
  res.json({ success: true, data: myClaims });
});

router.post('/klaim', verifyUserToken, (req, res) => {
  const { faskesId } = req.body;
  const targetFaskes = faskesDB.find(f => f.id === faskesId);
  if (!targetFaskes) {
    return res.status(404).json({ success: false, message: 'Faskes tidak ditemukan.' });
  }

  // Invariant: Satu faskes hanya boleh punya satu pemilik aktif
  if (targetFaskes.isClaimed) {
    return res.status(400).json({
      success: false,
      message: 'Faskes ini sudah memiliki pemilik Mitra aktif yang diverifikasi.',
    });
  }

  const existingPending = klaimDB.find(k => k.faskesId === faskesId && k.status === 'Diajukan');
  if (existingPending) {
    return res.status(400).json({
      success: false,
      message: 'Pengajuan klaim untuk faskes ini sedang dalam proses review admin.',
    });
  }

  const newClaim = {
    id: `klm_${Date.now()}`,
    faskesId,
    faskesNama: targetFaskes.nama,
    userId: req.user.id,
    userNama: req.user.nama,
    status: 'Diajukan',
    tanggalPengajuan: new Date().toISOString(),
  };

  klaimDB.push(newClaim);
  res.status(201).json({ success: true, message: 'Pengajuan klaim berhasil dikirim.', data: newClaim });
});

router.post('/klaim/:id/approve', verifyUserToken, requireRole('Admin'), (req, res) => {
  const claim = klaimDB.find(k => k.id === req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Klaim tidak ditemukan.' });

  claim.status = 'Disetujui';
  claim.tanggalVerifikasi = new Date().toISOString();

  const faskes = faskesDB.find(f => f.id === claim.faskesId);
  if (faskes) {
    faskes.isClaimed = true;
    faskes.pemilikId = claim.userId;
  }

  res.json({ success: true, message: `Klaim faskes ${claim.faskesNama} disetujui.`, data: claim });
});

router.post('/klaim/:id/reject', verifyUserToken, requireRole('Admin'), (req, res) => {
  const claim = klaimDB.find(k => k.id === req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Klaim tidak ditemukan.' });

  claim.status = 'Ditolak';
  claim.tanggalVerifikasi = new Date().toISOString();

  res.json({ success: true, message: `Klaim faskes ${claim.faskesNama} ditolak.`, data: claim });
});

// ----------------------------------------------------
// 3. DIREKTORI FASKES (Supporting Subdomain)
// ----------------------------------------------------
router.get('/faskes', (req, res) => {
  const { q, kategori } = req.query;
  let results = [...faskesDB];

  if (kategori && kategori !== 'Semua') {
    results = results.filter(f => f.jenis.toLowerCase() === kategori.toLowerCase());
  }

  if (q && q.trim()) {
    const keyword = q.toLowerCase().trim();
    results = results.filter(
      f => f.nama.toLowerCase().includes(keyword) || f.alamat.toLowerCase().includes(keyword)
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

router.get('/faskes/:id', (req, res) => {
  const f = faskesDB.find(item => item.id === req.params.id);
  if (!f) return res.status(404).json({ success: false, message: 'Faskes tidak ditemukan.' });
  res.json({ success: true, data: f });
});

router.post('/faskes', optionalUserToken, (req, res) => {
  const { nama, jenis, alamat, lat, lng, telepon, jamBuka } = req.body;

  // Invariant 1: Koordinat wajib valid
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
    return res.status(400).json({ success: false, message: 'Koordinat lokasi (lat/lng) tidak valid.' });
  }

  if (!nama || !jenis || !alamat) {
    return res.status(400).json({ success: false, message: 'Nama, jenis, dan alamat faskes wajib diisi.' });
  }

  // Invariant 2: Cek duplikasi (< 30 meter dengan nama mirip)
  const isDuplicate = faskesDB.some(f => {
    const distMeters = Math.sqrt(
      Math.pow((f.lat - parsedLat) * 111000, 2) +
      Math.pow((f.lng - parsedLng) * 111000 * Math.cos(parsedLat * (Math.PI / 180)), 2)
    );
    const nameMatch = f.nama.toLowerCase().includes(nama.toLowerCase()) || nama.toLowerCase().includes(f.nama.toLowerCase());
    return distMeters < 30 && nameMatch;
  });

  if (isDuplicate) {
    return res.status(400).json({
      success: false,
      message: 'Faskes serupa terdeteksi di lokasi yang sama (<30 meter). Entri duplikat ditolak.',
    });
  }

  const newFaskes = {
    id: `faskes_${Date.now()}`,
    nama,
    jenis,
    alamat,
    lat: parsedLat,
    lng: parsedLng,
    telepon: telepon || '-',
    jamBuka: jamBuka || '08:00 - 21:00 WIB',
    sumberData: 'Manual',
    isClaimed: false,
    pemilikId: null,
    rating: 4.5,
  };

  faskesDB.push(newFaskes);
  res.status(201).json({ success: true, message: 'Faskes baru berhasil ditambahkan.', data: newFaskes });
});

// ----------------------------------------------------
// 4. KETERSEDIAAN OBAT (Core Subdomain)
// ----------------------------------------------------
router.get('/obat', (req, res) => {
  res.json({ success: true, data: obatDB });
});

router.get('/stok', (req, res) => {
  const { faskesId, obatId } = req.query;

  if (faskesId && obatId) {
    const filtered = laporanStokDB.filter(l => l.faskesId === faskesId && l.obatId === obatId);
    const kalkulasi = PenghitungStatusStok.hitung(filtered);
    return res.json({ success: true, faskesId, obatId, ...kalkulasi });
  }

  // Jika faskesId saja, berikan status semua obat di faskes tsb
  if (faskesId) {
    const list = obatDB.map(o => {
      const filtered = laporanStokDB.filter(l => l.faskesId === faskesId && l.obatId === o.id);
      return {
        obat: o,
        stok: PenghitungStatusStok.hitung(filtered),
      };
    });
    return res.json({ success: true, faskesId, data: list });
  }

  // Jika obatId saja, berikan status di seluruh faskes
  if (obatId) {
    const list = faskesDB.map(f => {
      const filtered = laporanStokDB.filter(l => l.faskesId === f.id && l.obatId === obatId);
      return {
        faskes: f,
        stok: PenghitungStatusStok.hitung(filtered),
      };
    });
    return res.json({ success: true, obatId, data: list });
  }

  res.json({ success: true, countLaporan: laporanStokDB.length, data: laporanStokDB });
});

router.post('/stok/lapor', optionalUserToken, (req, res) => {
  const { faskesId, obatId, status, catatan } = req.body;
  if (!faskesId || !obatId || !status) {
    return res.status(400).json({ success: false, message: 'faskesId, obatId, dan status wajib diisi.' });
  }

  const userId = req.user?.id || 'usr_anonymous';
  const userName = req.user?.nama || 'Warga Anonim';
  const role = req.user?.role || 'Warga';

  // Invariant 3: Rate limit 1 laporan per user per obat per faskes per jam (hanya untuk warga)
  if (role !== 'Mitra') {
    const canReport = PenghitungStatusStok.cekRateLimit(laporanStokDB, faskesId, obatId, userId);
    if (!canReport) {
      return res.status(429).json({
        success: false,
        message: 'Batas frekuensi laporan tercapai: Anda hanya dapat melaporkan obat ini sekali setiap 1 jam.',
      });
    }
  }

  // Cek apakah faskes memang dimiliki oleh user jika peran Mitra
  const faskes = faskesDB.find(f => f.id === faskesId);
  const isVerifiedMitra = role === 'Mitra' && (faskes?.pemilikId === userId || faskes?.isClaimed);

  const newLaporan = {
    id: `lap_${Date.now()}`,
    faskesId,
    obatId,
    userId,
    userName,
    role,
    status,
    catatan: catatan || '',
    timestamp: new Date().toISOString(),
    isVerifiedMitra,
  };

  laporanStokDB.unshift(newLaporan);

  // Hitung ulang status
  const filtered = laporanStokDB.filter(l => l.faskesId === faskesId && l.obatId === obatId);
  const kalkulasi = PenghitungStatusStok.hitung(filtered);

  res.status(201).json({
    success: true,
    message: 'Laporan stok berhasil diterima.',
    laporan: newLaporan,
    statusTerbaru: kalkulasi,
  });
});

// ----------------------------------------------------
// 5. KONDISI JALAN (Supporting Subdomain)
// ----------------------------------------------------
router.get('/kondisi-jalan/cuaca', async (req, res) => {
  const lat = req.query.lat || -6.89;
  const lng = req.query.lng || 107.61;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`;
    const resp = await fetch(openMeteoUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TugasBesar-TST-PWAM/1.0 (SIGAP)' },
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      const current = data.current || {};
      const rain = current.rain ?? 0;

      let kondisi = 'Cerah Berawan';
      if (rain > 15) kondisi = 'Hujan Sangat Lebat (Peringatan Banjir)';
      else if (rain > 5) kondisi = 'Hujan Sedang';
      else if (rain > 0.1) kondisi = 'Gerimis Ringan';

      cuacaCache = {
        suhu: current.temperature_2m ?? 24.5,
        curahHujanMm: rain,
        kelembaban: current.relative_humidity_2m ?? 80,
        anginKmh: current.wind_speed_10m ?? 8.5,
        kondisi,
        isCuacaEkstrem: rain > 15,
        source: 'Open-Meteo Live API',
        lastUpdated: new Date().toISOString(),
      };
    }
  } catch (err) {
    // Gunakan fallback cache bila timeout/offline
    cuacaCache.source = 'Cache Siaga Offline (Fallback Resilient)';
  }

  res.json({ success: true, data: cuacaCache });
});

router.get('/kondisi-jalan/bahaya', (req, res) => {
  res.json({ success: true, count: bahayaJalanDB.length, data: bahayaJalanDB });
});

router.post('/kondisi-jalan/bahaya', optionalUserToken, (req, res) => {
  const { jenis, lokasi, deskripsi, lat, lng } = req.body;
  if (!jenis || !lokasi) {
    return res.status(400).json({ success: false, message: 'Jenis dan lokasi bahaya jalan wajib diisi.' });
  }

  const userId = req.user?.id || 'usr_warga_guest';
  const isMitra = req.user?.role === 'Mitra';

  // Invariant: Bahaya aktif bila ada minimal 2 konfirmasi atau 1 dari Mitra Terverifikasi
  const newBahaya = {
    id: `hzd_${Date.now()}`,
    jenis,
    lokasi,
    lat: parseFloat(lat) || -6.892,
    lng: parseFloat(lng) || 107.61,
    deskripsi: deskripsi || `Laporan bahaya ${jenis} di ${lokasi}`,
    jumlahKonfirmasi: isMitra ? 2 : 1,
    konfirmasiOleh: [userId],
    isAktif: isMitra, // Mitra langsung mengaktifkan
    waktuLapor: new Date().toISOString(),
  };

  bahayaJalanDB.unshift(newBahaya);
  res.status(201).json({
    success: true,
    message: isMitra
      ? 'Bahaya jalan berhasil dilaporkan dan langsung aktif (diverifikasi oleh Mitra).'
      : 'Laporan bahaya tercatat. Akan aktif setelah mendapat konfirmasi warga lainnya.',
    data: newBahaya,
  });
});

router.post('/kondisi-jalan/bahaya/:id/konfirmasi', optionalUserToken, (req, res) => {
  const bahaya = bahayaJalanDB.find(h => h.id === req.params.id);
  if (!bahaya) return res.status(404).json({ success: false, message: 'Bahaya tidak ditemukan.' });

  const userId = req.user?.id || `user_${Date.now()}`;
  if (bahaya.konfirmasiOleh.includes(userId)) {
    return res.status(400).json({ success: false, message: 'Anda sudah mengonfirmasi bahaya ini.' });
  }

  bahaya.konfirmasiOleh.push(userId);
  bahaya.jumlahKonfirmasi += 1;

  // Invariant: >= 2 konfirmasi mengaktifkan bahaya
  if (bahaya.jumlahKonfirmasi >= 2) {
    bahaya.isAktif = true;
  }

  res.json({
    success: true,
    message: 'Konfirmasi bahaya jalan tercatat.',
    data: bahaya,
  });
});

// ----------------------------------------------------
// 6. RUTE AMAN (Core Subdomain)
// ----------------------------------------------------
router.post('/rute-aman/hitung', (req, res) => {
  const { faskesId, userLat, userLng } = req.body;
  const faskes = faskesDB.find(f => f.id === faskesId) || faskesDB[0];

  const hasilEvaluasi = PenilaiKeamananRute.evaluasiRute({
    faskes,
    userLat: parseFloat(userLat) || -6.8915,
    userLng: parseFloat(userLng) || 107.6107,
    cuaca: cuacaCache,
    bahayaJalanList: bahayaJalanDB,
  });

  res.json({ success: true, data: hasilEvaluasi });
});

// ----------------------------------------------------
// 7. PANDUAN SIAGA / KARTU SIAGA (Supporting Subdomain)
// ----------------------------------------------------
router.get('/kartu-siaga', (req, res) => {
  const { q, urgensi, cuaca } = req.query;
  const hasil = PemilihKartu.pilih({
    kartuList: kartuSiagaDB,
    query: q,
    urgensi,
    cuaca,
  });

  res.json({
    success: true,
    count: hasil.length,
    disclaimerUmum: 'Seluruh materi bersumber dari standar rujukan resmi Kemenkes RI dan WHO untuk edukasi siaga dan triage awal non-diagnostik.',
    data: hasil,
  });
});

// ----------------------------------------------------
// 8. INTER-GROUP INTEGRATION (X-API-Key Protected)
// Slide 16 & 17: Layanan untuk diakses kelompok lain
// ----------------------------------------------------
router.get('/public/faskes', verifyApiKey, (req, res) => {
  res.json({
    success: true,
    provider: 'SIGAP (Kelompok K01/K02 ITB)',
    contact: 'indah@sigap.itb.ac.id / belva@sigap.itb.ac.id',
    data: faskesDB.map(f => ({
      id: f.id,
      nama: f.nama,
      jenis: f.jenis,
      alamat: f.alamat,
      lat: f.lat,
      lng: f.lng,
      jamBuka: f.jamBuka,
      telepon: f.telepon,
      isVerified: f.isClaimed,
    })),
  });
});

router.get('/public/stok-summary', verifyApiKey, (req, res) => {
  const summary = faskesDB.map(f => {
    const paracetamol = PenghitungStatusStok.hitung(
      laporanStokDB.filter(l => l.faskesId === f.id && l.obatId === 'obat_1')
    );
    const oralit = PenghitungStatusStok.hitung(
      laporanStokDB.filter(l => l.faskesId === f.id && l.obatId === 'obat_3')
    );
    return {
      faskesId: f.id,
      namaFaskes: f.nama,
      stokParacetamol: paracetamol.status,
      kesegaranParacetamol: paracetamol.kesegaran.status,
      stokOralit: oralit.status,
    };
  });

  res.json({
    success: true,
    provider: 'SIGAP Ketersediaan Obat Service',
    totalFaskes: faskesDB.length,
    summary,
  });
});

router.get('/public/hazard-alerts', verifyApiKey, (req, res) => {
  const activeOnly = bahayaJalanDB.filter(h => h.isAktif);
  res.json({
    success: true,
    provider: 'SIGAP Kondisi Jalan Alert',
    totalAktif: activeOnly.length,
    alerts: activeOnly,
  });
});

// ----------------------------------------------------
// 9. PEER INTEGRATION PROXIES (Memakai API Kelompok Lain)
// TST Tugas 3 & PWAM Deliverable #3 (Slide 14-16 & 22)
// Kelompok 1: JalanAman (Smart City & Titik Banjir)
// Kelompok 2: SehatDekat (Health & Antrean Faskes)
// ----------------------------------------------------
router.get('/peer/jalanaman', async (req, res) => {
  const PEER_URL = process.env.PEER_JALANAMAN_URL || 'https://jalanaman.stei.fun/api';
  const PEER_KEY = process.env.PEER_JALANAMAN_KEY || 'SIGAP-PWAM-PARTNER-KEY-2026';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const peerResp = await fetch(`${PEER_URL}/reports?city=bandung`, {
      signal: controller.signal,
      headers: { 'X-API-Key': PEER_KEY, 'User-Agent': 'SIGAP-Peer-Consumer/1.0' },
    });
    clearTimeout(timer);

    if (!peerResp.ok) throw new Error(`Peer HTTP ${peerResp.status}`);
    const data = await peerResp.json();

    return res.json({
      success: true,
      status: 'Online',
      source: 'jalanaman.stei.fun (Live Peer API)',
      data,
    });
  } catch (err) {
    // Sesuai Aturan Slide 14 & 22: Tahan gangguan jika API kelompok lain mati
    res.json({
      success: true,
      status: 'Fallback / Cache Siaga',
      source: 'Mock Kontrak OpenAPI jalanaman.stei.fun',
      warning: 'Layanan peer JalanAman sedang offline, menggunakan data sinkronisasi lokal agar aplikasi tidak crash.',
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
          waktu: '30 menit lalu',
        },
      ],
    });
  }
});

router.get('/peer/sehatdekat', async (req, res) => {
  const PEER_URL = process.env.PEER_SEHATDEKAT_URL || 'https://sehatdekat.stei.site/api';
  const PEER_KEY = process.env.PEER_SEHATDEKAT_KEY || 'SIGAP-HEALTH-KEY-2026';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const peerResp = await fetch(`${PEER_URL}/queues`, {
      signal: controller.signal,
      headers: { 'X-API-Key': PEER_KEY },
    });
    clearTimeout(timer);

    if (!peerResp.ok) throw new Error(`Peer HTTP ${peerResp.status}`);
    const data = await peerResp.json();

    return res.json({
      success: true,
      status: 'Online',
      source: 'sehatdekat.stei.site (Live Peer API)',
      data,
    });
  } catch (err) {
    // Fallback resilient
    res.json({
      success: true,
      status: 'Fallback / Cache Siaga',
      source: 'Mock Kontrak OpenAPI sehatdekat.stei.site',
      warning: 'Layanan peer SehatDekat sedang offline/maintenance, menggunakan data sinkronisasi lokal.',
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
    });
  }
});

module.exports = router;
