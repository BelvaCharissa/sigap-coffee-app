import { StatusStok, Kesegaran } from './StatusStok';

/**
 * Domain Service: PenghitungStatusStok (DDD Bab V.2)
 * Rules:
 * 1. Laporan Mitra Terverifikasi mengalahkan laporan warga.
 * 2. Laporan warga segar < 24 jam, memudar sampai 72 jam, > 72 jam kedaluwarsa.
 * 3. Laporan bertentangan (misal ada yang lapor Ada dan Habis dalam waktu dekat)
 *    diberi tanda hasConflict: true, mengutamakan yang terbaru.
 * 4. Bila semua laporan kedaluwarsa (>72 jam) status jadi 'Tidak Yakin'.
 */
export class PenghitungStatusStok {
  static hitungStatus(laporanList) {
    if (!laporanList || laporanList.length === 0) {
      return {
        status: StatusStok.TIDAK_YAKIN,
        kesegaran: Kesegaran.KEDALUWARSA,
        hasConflict: false,
        skorKepercayaan: 0,
        lastReportedAt: null,
        reportedByRole: null,
      };
    }

    const now = Date.now();

    // Urutkan laporan dari yang paling baru
    const sorted = [...laporanList].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Cek laporan mitra terverifikasi terbaru
    const mitraReport = sorted.find(r => r.role === 'Mitra' || r.isMitra);
    const newestReport = sorted[0];

    const effectiveReport = mitraReport || newestReport;
    const reportAgeHours = (now - new Date(effectiveReport.timestamp).getTime()) / (1000 * 60 * 60);

    let kesegaran;
    if (reportAgeHours < 24) {
      kesegaran = Kesegaran.SEGAR;
    } else if (reportAgeHours <= 72) {
      kesegaran = Kesegaran.MEMUDAR;
    } else {
      kesegaran = Kesegaran.KEDALUWARSA;
    }

    // Cek konflik: apakah ada laporan dalam 24 jam terakhir dengan status berbeda
    const recent24h = sorted.filter(
      r => (now - new Date(r.timestamp).getTime()) / (1000 * 60 * 60) <= 24
    );
    const uniqueStatuses = new Set(recent24h.map(r => r.status));
    const hasConflict = uniqueStatuses.size > 1;

    let finalStatus = effectiveReport.status;
    if (kesegaran === Kesegaran.KEDALUWARSA && !mitraReport) {
      finalStatus = StatusStok.TIDAK_YAKIN;
    }

    // Hitung skor kepercayaan (0 - 100)
    let skorKepercayaan = 50;
    if (effectiveReport.role === 'Mitra' || effectiveReport.isMitra) {
      skorKepercayaan = 98;
    } else {
      skorKepercayaan = kesegaran === Kesegaran.SEGAR ? 85 : 45;
      if (hasConflict) skorKepercayaan -= 25;
    }

    return {
      status: finalStatus,
      kesegaran,
      hasConflict,
      skorKepercayaan: Math.max(10, Math.min(100, skorKepercayaan)),
      lastReportedAt: effectiveReport.timestamp,
      reportedByRole: effectiveReport.role || (effectiveReport.isMitra ? 'Mitra' : 'Warga'),
    };
  }
}
