import { JenisBahaya, StatusBahaya } from './JenisBahaya';

/**
 * BahayaJalan Aggregate Root (DDD Bab V.3)
 * Invariant:
 * 1. Bahaya aktif bila ada minimal 2 konfirmasi atau 1 dari Mitra Terverifikasi.
 * 2. Otomatis kedaluwarsa 3 jam tanpa konfirmasi baru.
 */
export class BahayaJalan {
  constructor({
    id,
    jenis = JenisBahaya.BANJIR,
    lokasiNama,
    latitude,
    longitude,
    deskripsi = '',
    ketinggianAirCm = null,
    status = StatusBahaya.MENUNGGU_KONFIRMASI,
    pelaporRole = 'Warga',
    pelaporName = 'Warga',
    jumlahKonfirmasi = 1,
    konfirmasiOleh = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id || 'bahaya_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    this.jenis = jenis;
    this.lokasiNama = lokasiNama;
    this.latitude = latitude;
    this.longitude = longitude;
    this.deskripsi = deskripsi;
    this.ketinggianAirCm = ketinggianAirCm;
    this.status = status;
    this.pelaporRole = pelaporRole;
    this.pelaporName = pelaporName;
    this.jumlahKonfirmasi = jumlahKonfirmasi;
    this.konfirmasiOleh = konfirmasiOleh;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    // Hitung status awal sesuai invariant
    this.periksaStatusAktif();
  }

  periksaStatusAktif() {
    const ageHours = (Date.now() - new Date(this.updatedAt).getTime()) / (1000 * 60 * 60);
    if (ageHours > 3) {
      this.status = StatusBahaya.KEDALUWARSA;
      return;
    }

    if (this.pelaporRole === 'Mitra' || this.jumlahKonfirmasi >= 2) {
      this.status = StatusBahaya.AKTIF;
    } else {
      this.status = StatusBahaya.MENUNGGU_KONFIRMASI;
    }
  }

  tambahKonfirmasi(userId, role = 'Warga') {
    if (this.konfirmasiOleh.includes(userId)) {
      throw new Error('Anda sudah mengonfirmasi bahaya ini.');
    }

    this.konfirmasiOleh.push(userId);
    this.jumlahKonfirmasi += 1;
    this.updatedAt = new Date().toISOString();

    if (role === 'Mitra' || this.jumlahKonfirmasi >= 2) {
      this.status = StatusBahaya.AKTIF;
    }

    return this.status;
  }
}
