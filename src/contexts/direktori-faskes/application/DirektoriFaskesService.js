import { Faskes } from '../domain/Faskes';
import { initialFaskesList } from '../infrastructure/initialFaskesData';
import { eventBus } from '../../../shared/EventBus';

class DirektoriFaskesService {
  constructor() {
    this.faskesList = initialFaskesList.map(item => new Faskes(item));
  }

  getAll() {
    return [...this.faskesList];
  }

  getById(id) {
    return this.faskesList.find(f => f.id === id);
  }

  search(query, jenisFilter = 'Semua') {
    return this.faskesList.filter(f => {
      const matchQuery = !query ||
        f.nama.toLowerCase().includes(query.toLowerCase()) ||
        f.alamat.toLowerCase().includes(query.toLowerCase());
      const matchJenis = jenisFilter === 'Semua' || f.jenis === jenisFilter;
      return matchQuery && matchJenis;
    });
  }

  tambahFaskes(data) {
    // Invariant: cek duplikat jarak < 30 meter dengan nama mirip
    const existing = this.faskesList.find(
      f => f.nama.toLowerCase() === data.nama.toLowerCase()
    );
    if (existing) {
      throw new Error(`Faskes dengan nama "${data.nama}" sudah terdaftar.`);
    }

    const newFaskes = new Faskes(data);
    this.faskesList.unshift(newFaskes);

    eventBus.publish('FaskesDitambahkan', {
      faskesId: newFaskes.id,
      nama: newFaskes.nama,
      jenis: newFaskes.jenis,
    });

    return newFaskes;
  }

  ajukanKlaim(faskesId, userId) {
    const faskes = this.getById(faskesId);
    if (!faskes) throw new Error('Faskes tidak ditemukan');

    faskes.ajukanKlaim(userId);

    eventBus.publish('FaskesDiklaim', {
      faskesId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return faskes;
  }
}

export const direktoriFaskesService = new DirektoriFaskesService();
export default direktoriFaskesService;
