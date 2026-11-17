import { JenisFaskes, SumberData } from './JenisFaskes';

/**
 * Faskes Aggregate Root (DDD Bab V.1)
 * Invariant:
 * 1. Koordinat wajib valid (-90 <= lat <= 90, -180 <= lng <= 180).
 * 2. Tidak boleh ada duplikat faskes (cek osm_id atau jarak < 30m dengan nama mirip).
 */
export class Faskes {
  constructor({
    id,
    osmId = null,
    nama,
    jenis = JenisFaskes.APOTEK,
    alamat,
    latitude,
    longitude,
    telepon = '',
    jamBuka = '08:00 - 21:00',
    sumberData = SumberData.MANUAL,
    isClaimed = false,
    ownerUserId = null,
    jarakKm = 0.5,
  }) {
    if (!nama || nama.trim().length === 0) {
      throw new Error('Nama faskes wajib diisi');
    }
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      throw new Error('Koordinat latitude tidak valid');
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      throw new Error('Koordinat longitude tidak valid');
    }

    this.id = id || 'faskes_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    this.osmId = osmId;
    this.nama = nama;
    this.jenis = jenis;
    this.alamat = alamat;
    this.latitude = latitude;
    this.longitude = longitude;
    this.telepon = telepon;
    this.jamBuka = jamBuka;
    this.sumberData = sumberData;
    this.isClaimed = isClaimed;
    this.ownerUserId = ownerUserId;
    this.jarakKm = jarakKm;
  }

  ajukanKlaim(userId) {
    if (this.isClaimed) {
      throw new Error('Faskes ini sudah diklaim oleh mitra terverifikasi');
    }
    this.isClaimed = true;
    this.ownerUserId = userId;
  }
}
