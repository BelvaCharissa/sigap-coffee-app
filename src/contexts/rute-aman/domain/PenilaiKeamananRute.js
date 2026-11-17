/**
 * Domain Service: PenilaiKeamananRute (DDD Bab V.4, FR-RA-03, FR-RA-04)
 * Menghitung Skor Aman (0 - 100) untuk opsi rute.
 * Pengurangan skor:
 * - Setiap titik banjir aktif di rute: -35 poin
 * - Setiap titik longsor/jalan rusak di rute: -25 poin
 * - Curah hujan > 20 mm/jam (hujan lebat): -15 poin
 * - Malam hari saat hujan: -10 poin
 */
export class PenilaiKeamananRute {
  static nilaiRute(rute, bahayaDiRute = [], cuaca = {}) {
    let baseScore = 100;
    const hazardsOnPath = [];

    bahayaDiRute.forEach(bahaya => {
      let deduction = 0;
      if (bahaya.jenis === 'Banjir') {
        deduction = bahaya.ketinggianAirCm && bahaya.ketinggianAirCm > 30 ? 40 : 30;
      } else if (bahaya.jenis === 'Longsor') {
        deduction = 45;
      } else if (bahaya.jenis === 'Jalan Rusak') {
        deduction = 20;
      } else {
        deduction = 15;
      }

      baseScore -= deduction;
      hazardsOnPath.push({
        bahayaId: bahaya.id,
        jenis: bahaya.jenis,
        lokasiNama: bahaya.lokasiNama,
        pengurangan: deduction,
      });
    });

    if (cuaca.curahHujanMm && cuaca.curahHujanMm >= 15) {
      baseScore -= 15;
    }

    const skorAman = Math.max(10, Math.min(100, baseScore));

    let tingkatKeamanan = 'Sangat Aman';
    let badgeColor = '#2E7D32';
    if (skorAman >= 85) {
      tingkatKeamanan = 'Sangat Aman';
      badgeColor = '#2E7D32';
    } else if (skorAman >= 65) {
      tingkatKeamanan = 'Cukup Aman';
      badgeColor = '#F57C00';
    } else {
      tingkatKeamanan = 'Berisiko Bahaya';
      badgeColor = '#C62828';
    }

    return {
      skorAman,
      tingkatKeamanan,
      badgeColor,
      hazardsOnPath,
      hasHazard: hazardsOnPath.length > 0,
    };
  }
}
