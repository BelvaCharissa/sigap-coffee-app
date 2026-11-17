import { UrgensiLevel } from './TingkatUrgensi';

/**
 * KartuSiaga Aggregate Root (DDD Bab V.5, FR-PS-03, FR-PS-04)
 * Invariant:
 * 1. Setiap kartu wajib punya sumber rujukan, tanggal tinjau, dan disclaimer.
 * 2. Tidak boleh berisi diagnosis atau dosis personal.
 */
export class KartuSiaga {
  constructor({
    id,
    judul,
    keluhanPemicu = [],
    tingkatUrgensi = UrgensiLevel.RUMAH,
    tandaBahaya = [],
    tindakanAwal = [],
    kapanKeFaskes = '',
    sumberRujukan,
    tanggalTinjau,
    disclaimer = 'Panduan ini bukan diagnosis medis atau resep dosis personal. Jika kondisi memburuk, segera periksakan ke dokter/faskes terdekat.',
  }) {
    if (!judul || judul.trim().length === 0) {
      throw new Error('Judul Kartu Siaga wajib diisi.');
    }
    if (!sumberRujukan || sumberRujukan.trim().length === 0) {
      throw new Error('Sumber rujukan medis (Kemenkes/WHO/IDI) wajib disertakan.');
    }
    if (!tanggalTinjau) {
      throw new Error('Tanggal tinjau medis wajib dicantumkan.');
    }
    if (!disclaimer || disclaimer.trim().length === 0) {
      throw new Error('Disclaimer medis wajib ada.');
    }

    this.id = id || 'kartu_' + Date.now();
    this.judul = judul;
    this.keluhanPemicu = keluhanPemicu;
    this.tingkatUrgensi = tingkatUrgensi;
    this.tandaBahaya = tandaBahaya;
    this.tindakanAwal = tindakanAwal;
    this.kapanKeFaskes = kapanKeFaskes;
    this.sumberRujukan = sumberRujukan;
    this.tanggalTinjau = tanggalTinjau;
    this.disclaimer = disclaimer;
  }
}
