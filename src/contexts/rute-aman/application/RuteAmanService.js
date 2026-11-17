import { PenilaiKeamananRute } from '../domain/PenilaiKeamananRute';
import { kondisiJalanService } from '../../kondisi-jalan/application/KondisiJalanService';
import { eventBus } from '../../../shared/EventBus';

class RuteAmanService {
  hitungRuteKeFaskes(faskes) {
    const cuaca = kondisiJalanService.getCuacaSnapshot();
    const activeHazards = kondisiJalanService.getBahayaAktif();

    // Rute Tercepat: Jarak paling dekat secara linear, namun mungkin melewati titik banjir
    // Rute Teraman: Memutar sedikit menghindari titik banjir yang tercatat
    const bahayaDiRuteTercepat = activeHazards.slice(0, 1); // Melewati satu titik bahaya banjir
    const bahayaDiRuteTeraman = []; // Bersih atau minim bahaya

    const penilaianTercepat = PenilaiKeamananRute.nilaiRute(
      { nama: 'Rute Tercepat' },
      bahayaDiRuteTercepat,
      cuaca
    );

    const penilaianTeraman = PenilaiKeamananRute.nilaiRute(
      { nama: 'Rute Teraman (Rekomendasi SIGAP)' },
      bahayaDiRuteTeraman,
      cuaca
    );

    const waktuTercepatMenit = Math.max(3, Math.round(faskes.jarakKm * 4));
    const waktuTeramanMenit = Math.max(5, Math.round(faskes.jarakKm * 4.8) + 2);

    const rencana = {
      faskes,
      cuaca,
      opsiTercepat: {
        id: 'rute_tercepat',
        nama: 'Rute Tercepat (Jalur Utama)',
        jarakKm: faskes.jarakKm,
        estimasiMenit: waktuTercepatMenit,
        via: 'Via Jl. Ir. H. Juanda / Cikapayang',
        isRekomendasi: penilaianTercepat.skorAman >= penilaianTeraman.skorAman,
        ...penilaianTercepat,
      },
      opsiTeraman: {
        id: 'rute_teraman',
        nama: 'Rute Teraman (Bebas Genangan)',
        jarakKm: parseFloat((faskes.jarakKm + 0.4).toFixed(1)),
        estimasiMenit: waktuTeramanMenit,
        via: 'Via Jl. Siliwangi - Taman Hewan (Jalur Dataran Tinggi)',
        isRekomendasi: true,
        ...penilaianTeraman,
      },
      semuaBerisiko: penilaianTercepat.skorAman < 50 && penilaianTeraman.skorAman < 50,
    };

    eventBus.publish('RuteDiminta', {
      faskesId: faskes.id,
      jarakKm: faskes.jarakKm,
      skorTercepat: rencana.opsiTercepat.skorAman,
      skorTeraman: rencana.opsiTeraman.skorAman,
    });

    return rencana;
  }
}

export const ruteAmanService = new RuteAmanService();
export default ruteAmanService;
