/**
 * Domain Service: PemilihKartu (Bab V.5 DDD)
 * 
 * Aturan Invariant:
 * 1. Setiap kartu wajib punya sumber rujukan, tanggal tinjau, dan disclaimer.
 * 2. Tidak boleh berisi diagnosis atau dosis personal.
 * 3. Menyaring kartu berdasarkan keluhan, cuaca, atau tingkat urgensi (Rumah, Puskesmas, IGD).
 */

class PemilihKartu {
  static pilih({ kartuList, query = '', urgensi = 'Semua', cuaca = '' }) {
    let hasil = [...(kartuList || [])];

    // Filter Urgensi
    if (urgensi && urgensi !== 'Semua') {
      hasil = hasil.filter(k => k.tingkatUrgensi === urgensi.toUpperCase());
    }

    // Filter Pencarian Keluhan
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      hasil = hasil.filter(k => {
        const matchJudul = k.judul.toLowerCase().includes(q);
        const matchPemicu = (k.keluhanPemicu || []).some(p => p.toLowerCase().includes(q) || q.includes(p.toLowerCase()));
        const matchIsi = k.isiSingkat.toLowerCase().includes(q);
        return matchJudul || matchPemicu || matchIsi;
      });
    }

    // Jika filter cuaca diberikan (misal Hujan)
    if (cuaca && cuaca.trim().length > 0) {
      const c = cuaca.toLowerCase();
      // Urutkan kartu yang punya cuacaPemicu cocok di posisi teratas
      hasil.sort((a, b) => {
        const aHasCuaca = (a.cuacaPemicu || []).some(cp => c.includes(cp.toLowerCase()));
        const bHasCuaca = (b.cuacaPemicu || []).some(cp => c.includes(cp.toLowerCase()));
        if (aHasCuaca && !bHasCuaca) return -1;
        if (!aHasCuaca && bHasCuaca) return 1;
        return 0;
      });
    }

    return hasil;
  }
}

module.exports = PemilihKartu;
