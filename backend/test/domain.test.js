const test = require('node:test');
const assert = require('node:assert/strict');

const PenghitungStatusStok = require('../src/domain/PenghitungStatusStok');
const PenilaiKeamananRute = require('../src/domain/PenilaiKeamananRute');
const PemilihKartu = require('../src/domain/PemilihKartu');
const { generateToken, verifyUserToken, JWT_SECRET } = require('../src/middleware/auth');
const jwt = require('jsonwebtoken');

test('DDD Invariant FR-KO-04: Laporan Mitra Terverifikasi mengalahkan laporan warga', () => {
  const now = Date.now();
  const laporan = [
    {
      id: '1',
      faskesId: 'faskes_1',
      obatId: 'obat_1',
      userId: 'usr_warga_1',
      userName: 'Warga A',
      role: 'Warga',
      status: 'Habis',
      timestamp: new Date(now - 1000).toISOString(),
      isVerifiedMitra: false,
    },
    {
      id: '2',
      faskesId: 'faskes_1',
      obatId: 'obat_1',
      userId: 'usr_mitra_1',
      userName: 'Apoteker Mitra',
      role: 'Mitra',
      status: 'Ada',
      timestamp: new Date(now - 2000).toISOString(),
      isVerifiedMitra: true,
    },
  ];

  const hasil = PenghitungStatusStok.hitung(laporan);
  assert.equal(hasil.status, 'Ada', 'Status harus mengikuti laporan Mitra meskipun laporan warga lebih baru');
  assert.equal(hasil.sumberUtama, 'Mitra Terverifikasi');
  assert.equal(hasil.skorKepercayaan, 98);
});

test('DDD Invariant FR-KO-05: Kesegaran laporan warga (< 24 jam segar, 24-72 jam memudar, > 72 jam kedaluwarsa)', () => {
  const now = Date.now();
  const oneHour = 3600 * 1000;

  // 1. Segar (< 24 jam)
  const segar = PenghitungStatusStok.hitungKesegaran(new Date(now - 3 * oneHour).toISOString());
  assert.equal(segar.status, 'Segar');

  // 2. Memudar (24-72 jam)
  const memudar = PenghitungStatusStok.hitungKesegaran(new Date(now - 30 * oneHour).toISOString());
  assert.equal(memudar.status, 'Memudar');

  // 3. Kedaluwarsa (> 72 jam)
  const kedaluwarsa = PenghitungStatusStok.hitungKesegaran(new Date(now - 80 * oneHour).toISOString());
  assert.equal(kedaluwarsa.status, 'Kedaluwarsa');
});

test('DDD Invariant FR-KO-06: Rate limit satu pengguna maksimal 1 laporan per obat per faskes per jam', () => {
  const now = Date.now();
  const existingReports = [
    {
      faskesId: 'faskes_1',
      obatId: 'obat_1',
      userId: 'user_123',
      timestamp: new Date(now - 20 * 60 * 1000).toISOString(), // 20 menit lalu
    },
  ];

  const canReportSame = PenghitungStatusStok.cekRateLimit(existingReports, 'faskes_1', 'obat_1', 'user_123');
  assert.equal(canReportSame, false, 'User yang sama melaporkan obat & faskes yang sama dalam 1 jam harus ditolak');

  const canReportDifferentObat = PenghitungStatusStok.cekRateLimit(existingReports, 'faskes_1', 'obat_2', 'user_123');
  assert.equal(canReportDifferentObat, true, 'User boleh melaporkan obat yang berbeda');
});

test('DDD Invariant FR-KO-07: Laporan warga bertentangan ditandai ada konflik', () => {
  const now = Date.now();
  const laporan = [
    {
      id: '1',
      faskesId: 'faskes_1',
      obatId: 'obat_1',
      userId: 'usr_warga_1',
      userName: 'Warga 1',
      role: 'Warga',
      status: 'Habis',
      timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: '2',
      faskesId: 'faskes_1',
      obatId: 'obat_1',
      userId: 'usr_warga_2',
      userName: 'Warga 2',
      role: 'Warga',
      status: 'Ada',
      timestamp: new Date(now - 1 * 3600 * 1000).toISOString(), // Lebih baru
    },
  ];

  const hasil = PenghitungStatusStok.hitung(laporan);
  assert.equal(hasil.adaKonflik, true, 'Harus mendeteksi konflik bila ada Ada dan Habis dalam 24 jam');
  assert.equal(hasil.status, 'Ada', 'Harus mengutamakan laporan warga yang paling baru');
});

test('DDD Invariant FR-RA-01 s/d FR-RA-06: Penilai Keamanan Rute menghitung Tercepat vs Teraman', () => {
  const faskes = {
    id: 'faskes_1',
    nama: 'Apotek Dago',
    lat: -6.8924,
    lng: 107.6105,
    telepon: '022-2500123',
  };

  const bahayaBanjir = [
    {
      id: 'hzd_1',
      jenis: 'Banjir',
      lat: -6.892,
      lng: 107.61,
      isAktif: true,
    },
  ];

  const hasil = PenilaiKeamananRute.evaluasiRute({
    faskes,
    userLat: -6.891,
    userLng: 107.61,
    cuaca: { kondisi: 'Hujan Lebat', curahHujanMm: 18, isCuacaEkstrem: true },
    bahayaJalanList: bahayaBanjir,
  });

  assert.ok(hasil.opsiRute.tercepat, 'Wajib ada opsi tercepat');
  assert.ok(hasil.opsiRute.teraman, 'Wajib ada opsi teraman');
  assert.ok(hasil.opsiRute.teraman.skorAman > hasil.opsiRute.tercepat.skorAman, 'Skor teraman harus lebih tinggi dari tercepat yang melewati banjir');
  assert.equal(hasil.opsiRute.tercepat.adaPeringatan, true, 'Rute tercepat yang kena banjir harus diberi peringatan');
});

test('DDD Invariant FR-PS-01 & FR-PS-03: Kartu Siaga memiliki disclaimer dan filter keluhan', () => {
  const kartu = [
    {
      id: 'ks_1',
      judul: 'Demam pada Anak',
      keluhanPemicu: ['demam', 'panas', 'demam anak'],
      tingkatUrgensi: 'RUMAH',
      isiSingkat: 'Kompres hangat',
      sumberRujukan: 'IDAI',
      disclaimer: 'Bukan pengganti dokter',
    },
    {
      id: 'ks_2',
      judul: 'Sesak Napas',
      keluhanPemicu: ['sesak', 'asma'],
      tingkatUrgensi: 'IGD',
      isiSingkat: 'Duduk tegak',
      sumberRujukan: 'PDPI',
      disclaimer: 'Gawat darurat',
    },
  ];

  const hasil = PemilihKartu.pilih({ kartuList: kartu, query: 'demam anak' });
  assert.equal(hasil.length, 1);
  assert.equal(hasil[0].id, 'ks_1');
});

test('Auth: JWT Token generasi dan verifikasi valid', () => {
  const user = {
    id: 'usr_test',
    nama: 'Indah Ramadhani',
    email: 'indah@sigap.itb.ac.id',
    role: 'Warga',
    nim: '18224037',
  };

  const token = generateToken(user);
  assert.ok(token);

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.equal(decoded.id, user.id);
  assert.equal(decoded.nama, user.nama);
  assert.equal(decoded.role, user.role);
});
