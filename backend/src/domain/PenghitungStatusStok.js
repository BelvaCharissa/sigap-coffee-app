/**
 * Domain Service: PenghitungStatusStok (Bab V.2 DDD)
 * 
 * Aturan Invariant:
 * 1. Laporan Mitra Terverifikasi mengalahkan laporan warga.
 * 2. Laporan warga segar < 24 jam, memudar sampai 72 jam, lalu kedaluwarsa.
 * 3. Satu pengguna maksimal satu laporan per obat per faskes per jam (Rate limit).
 * 4. Laporan yang bertentangan ditampilkan dengan tanda "ada laporan berbeda", mengutamakan yang terbaru.
 */

class PenghitungStatusStok {
  static KESEGARAN_SEGAR_MS = 24 * 60 * 60 * 1000;       // 24 jam
  static KESEGARAN_MEMUDAR_MS = 72 * 60 * 60 * 1000;     // 72 jam
  static RATE_LIMIT_USER_MS = 60 * 60 * 1000;            // 1 jam

  /**
   * Cek kesegaran laporan berdasarkan usia timestamp
   */
  static hitungKesegaran(timestamp) {
    const ageMs = Date.now() - new Date(timestamp).getTime();
    if (ageMs <= this.KESEGARAN_SEGAR_MS) {
      return { status: 'Segar', label: '< 24 jam', ageHours: Math.round(ageMs / (3600 * 1000)) };
    }
    if (ageMs <= this.KESEGARAN_MEMUDAR_MS) {
      return { status: 'Memudar', label: '24-72 jam', ageHours: Math.round(ageMs / (3600 * 1000)) };
    }
    return { status: 'Kedaluwarsa', label: '> 72 jam', ageHours: Math.round(ageMs / (3600 * 1000)) };
  }

  /**
   * Validasi invariant rate limit 1 laporan per user per obat per faskes per jam
   */
  static cekRateLimit(laporanList, faskesId, obatId, userId) {
    const recent = laporanList.find(
      l => l.faskesId === faskesId &&
           l.obatId === obatId &&
           l.userId === userId &&
           (Date.now() - new Date(l.timestamp).getTime()) < this.RATE_LIMIT_USER_MS
    );
    return !recent;
  }

  /**
   * Menghitung status stok akhir untuk pasangan faskes + obat
   */
  static hitung(laporanListForPair) {
    if (!laporanListForPair || laporanListForPair.length === 0) {
      return {
        status: 'Tidak Yakin',
        kesegaran: { status: 'Kedaluwarsa', label: 'Belum ada data' },
        skorKepercayaan: 0,
        adaKonflik: false,
        laporanTerakhir: null,
        keterangan: 'Belum ada laporan dari warga atau mitra.',
      };
    }

    // Urutkan laporan dari yang paling baru
    const sorted = [...laporanListForPair].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Filter laporan yang belum kedaluwarsa (>72 jam)
    const validReports = sorted.filter(l => {
      const ageMs = Date.now() - new Date(l.timestamp).getTime();
      return ageMs <= this.KESEGARAN_MEMUDAR_MS;
    });

    if (validReports.length === 0) {
      return {
        status: 'Tidak Yakin',
        kesegaran: { status: 'Kedaluwarsa', label: 'Semua laporan > 72 jam' },
        skorKepercayaan: 10,
        adaKonflik: false,
        laporanTerakhir: sorted[0],
        keterangan: 'Laporan terakhir sudah kedaluwarsa (>72 jam). Disarankan konfirmasi via telepon.',
      };
    }

    // Invariant 1: Laporan Mitra Terverifikasi mengalahkan laporan warga
    const latestMitraReport = validReports.find(l => l.role === 'Mitra' || l.isVerifiedMitra);
    if (latestMitraReport) {
      const kesegaran = this.hitungKesegaran(latestMitraReport.timestamp);
      return {
        status: latestMitraReport.status,
        kesegaran,
        skorKepercayaan: 98,
        adaKonflik: false,
        sumberUtama: 'Mitra Terverifikasi',
        laporanTerakhir: latestMitraReport,
        totalLaporan: validReports.length,
        keterangan: `Diverifikasi resmi oleh pengelola faskes (${latestMitraReport.userName}).`,
      };
    }

    // Laporan warga
    const latestWargaReport = validReports[0];
    const kesegaran = this.hitungKesegaran(latestWargaReport.timestamp);

    // Invariant 4: Cek apakah ada laporan bertentangan dalam 24 jam terakhir
    const recentWargaReports = validReports.filter(l => {
      const ageMs = Date.now() - new Date(l.timestamp).getTime();
      return ageMs <= this.KESEGARAN_SEGAR_MS;
    });

    const hasAda = recentWargaReports.some(l => l.status === 'Ada');
    const hasHabis = recentWargaReports.some(l => l.status === 'Habis');
    const adaKonflik = hasAda && hasHabis;

    let skorKepercayaan = 75;
    if (kesegaran.status === 'Memudar') skorKepercayaan -= 25;
    if (adaKonflik) skorKepercayaan -= 20;

    return {
      status: latestWargaReport.status,
      kesegaran,
      skorKepercayaan: Math.max(20, Math.min(skorKepercayaan, 90)),
      adaKonflik,
      sumberUtama: 'Laporan Komunitas Warga',
      laporanTerakhir: latestWargaReport,
      totalLaporan: validReports.length,
      keterangan: adaKonflik
        ? 'Ada laporan berbeda dari warga lain dalam 24 jam terakhir. Menampilkan laporan terbaru.'
        : `Laporan warga terbaru (${latestWargaReport.userName}).`,
    };
  }
}

module.exports = PenghitungStatusStok;
