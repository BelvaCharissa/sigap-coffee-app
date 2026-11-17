import { initialKartuSiagaList } from '../infrastructure/initialKartuData';
import { KartuSiaga } from './KartuSiaga';
import { eventBus } from '../../../shared/EventBus';

export class PemilihKartu {
  constructor() {
    this.kartuList = initialKartuSiagaList.map(k => new KartuSiaga(k));
  }

  getAllKartu() {
    return [...this.kartuList];
  }

  getKartuById(id) {
    return this.kartuList.find(k => k.id === id);
  }

  pilihBerdasarkanKeluhan(query, filterUrgensi = 'Semua') {
    let list = this.kartuList;

    if (filterUrgensi !== 'Semua') {
      list = list.filter(k => k.tingkatUrgensi === filterUrgensi);
    }

    if (!query || query.trim() === '') {
      return list;
    }

    const q = query.toLowerCase();
    const filtered = list.filter(k =>
      k.judul.toLowerCase().includes(q) ||
      k.keluhanPemicu.some(p => p.toLowerCase().includes(q)) ||
      k.kapanKeFaskes.toLowerCase().includes(q)
    );

    if (filtered.length > 0) {
      eventBus.publish('KartuDitampilkan', {
        query,
        count: filtered.length,
        firstCardId: filtered[0].id,
      });
    }

    return filtered;
  }

  pilihKartuCuaca(kondisiCuaca = 'Hujan') {
    // Saat cuaca hujan atau rawan banjir, rekomendasikan kartu DBD & Hipotermia
    if (kondisiCuaca.toLowerCase().includes('hujan') || kondisiCuaca.toLowerCase().includes('banjir')) {
      return this.kartuList.filter(k =>
        k.keluhanPemicu.includes('hujan') ||
        k.keluhanPemicu.includes('dbd') ||
        k.keluhanPemicu.includes('hipotermia')
      );
    }
    return this.kartuList.slice(0, 3);
  }
}

export const pemilihKartuService = new PemilihKartu();
export default pemilihKartuService;
