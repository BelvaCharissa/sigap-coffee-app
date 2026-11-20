import { initialKatalogObat, initialStokList } from '../infrastructure/initialObatData';
import { PenghitungStatusStok } from '../domain/PenghitungStatusStok';
import { eventBus } from '../../../shared/EventBus';

class KetersediaanObatService {
  constructor() {
    this.katalog = [...initialKatalogObat];
    this.stokMap = new Map(); // key: `${faskesId}_${obatId}` -> { faskesId, obatId, laporan: [] }

    initialStokList.forEach(item => {
      this.stokMap.set(`${item.faskesId}_${item.obatId}`, {
        faskesId: item.faskesId,
        obatId: item.obatId,
        laporan: [...item.laporan],
      });
    });
  }

  getKatalog() {
    return [...this.katalog];
  }

  getObatById(id) {
    return this.katalog.find(o => o.id === id);
  }

  cariObat(query) {
    if (!query || query.trim() === '') return [...this.katalog];
    const q = query.toLowerCase();
    return this.katalog.filter(
      o =>
        o.nama.toLowerCase().includes(q) ||
        o.kategori.toLowerCase().includes(q) ||
        o.keluhanTerkait.some(k => k.toLowerCase().includes(q))
    );
  }

  getStokFaskes(faskesId, obatId) {
    const key = `${faskesId}_${obatId}`;
    const entry = this.stokMap.get(key);
    const laporanList = entry ? entry.laporan : [];
    const computed = PenghitungStatusStok.hitungStatus(laporanList);

    return {
      faskesId,
      obatId,
      laporan: laporanList,
      ...computed,
    };
  }

  /**
   * Mengambil daftar obat dan kuantitas stok yang tersedia di faskes ini
   * Agar warga bisa melihat apotek mana punya obat apa dan berapa jumlahnya
   */
  getSummaryObatTersedia(faskesId) {
    const defaultStok = {
      faskes_1: [
        { id: 'obat_1', nama: 'Paracetamol Sirup 120mg', jumlah: 45, satuan: 'botol', status: 'Ada' },
        { id: 'obat_2', nama: 'Paracetamol 500mg', jumlah: 80, satuan: 'strip', status: 'Ada' },
        { id: 'obat_3', nama: 'Oralit 200ml', jumlah: 35, satuan: 'sachet', status: 'Ada' },
        { id: 'obat_5', nama: 'Cetirizine 10mg', jumlah: 24, satuan: 'strip', status: 'Ada' },
      ],
      faskes_2: [
        { id: 'obat_1', nama: 'Paracetamol Sirup 120mg', jumlah: 0, satuan: 'botol', status: 'Habis' },
        { id: 'obat_2', nama: 'Paracetamol 500mg', jumlah: 60, satuan: 'tablet', status: 'Ada' },
        { id: 'obat_3', nama: 'Oralit 200ml', jumlah: 50, satuan: 'sachet', status: 'Ada' },
        { id: 'obat_6', nama: 'Antasida Doen', jumlah: 30, satuan: 'strip', status: 'Ada' },
      ],
      faskes_3: [
        { id: 'obat_1', nama: 'Paracetamol Sirup 120mg', jumlah: 30, satuan: 'botol', status: 'Ada' },
        { id: 'obat_2', nama: 'Paracetamol 500mg', jumlah: 120, satuan: 'tablet', status: 'Ada' },
        { id: 'obat_3', nama: 'Oralit 200ml', jumlah: 70, satuan: 'sachet', status: 'Ada' },
      ],
      faskes_4: [
        { id: 'obat_1', nama: 'Paracetamol Sirup 120mg', jumlah: 15, satuan: 'botol', status: 'Ada' },
        { id: 'obat_2', nama: 'Paracetamol 500mg', jumlah: 40, satuan: 'strip', status: 'Ada' },
        { id: 'obat_3', nama: 'Oralit 200ml', jumlah: 20, satuan: 'sachet', status: 'Ada' },
      ],
    };

    return defaultStok[faskesId] || [
      { id: 'obat_1', nama: 'Paracetamol Sirup', jumlah: 25, satuan: 'botol', status: 'Ada' },
      { id: 'obat_3', nama: 'Oralit Sachet', jumlah: 20, satuan: 'sachet', status: 'Ada' },
    ];
  }

  getAllStokForFaskes(faskesId) {
    return this.katalog.map(obat => {
      const stokInfo = this.getStokFaskes(faskesId, obat.id);
      return {
        obat,
        stokInfo,
      };
    });
  }

  cariFaskesDenganObat(obatId) {
    // Kembalikan faskes mana saja yang punya status untuk obat ini
    const result = [];
    for (const [key, val] of this.stokMap.entries()) {
      if (val.obatId === obatId) {
        const computed = PenghitungStatusStok.hitungStatus(val.laporan);
        result.push({
          faskesId: val.faskesId,
          obatId,
          ...computed,
        });
      }
    }
    return result;
  }

  /**
   * Laporkan Stok (DDD Command: LaporkanStok / PerbaruiStokOlehMitra)
   * Invariant:
   * - Rate limit 1 laporan per user per obat per faskes per jam.
   */
  laporkanStok({ faskesId, obatId, userId, userName, role, status, catatan }) {
    const key = `${faskesId}_${obatId}`;
    if (!this.stokMap.has(key)) {
      this.stokMap.set(key, { faskesId, obatId, laporan: [] });
    }

    const entry = this.stokMap.get(key);

    // Invariant check: Rate limit 1 jam per pengguna
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentByUser = entry.laporan.find(
      r => r.userId === userId && new Date(r.timestamp).getTime() > oneHourAgo
    );

    if (recentByUser && role !== 'Mitra' && role !== 'Admin') {
      throw new Error(
        'Rate limit: Anda sudah melaporkan stok obat ini kurang dari 1 jam yang lalu.'
      );
    }

    const newReport = {
      id: 'rep_' + Date.now(),
      userId,
      userName: userName || 'Pengguna SIGAP',
      role: role || 'Warga',
      status, // 'Ada' | 'Habis' | 'Tidak Yakin'
      timestamp: new Date().toISOString(),
      catatan: catatan || '',
    };

    entry.laporan.unshift(newReport);

    // Hitung ulang status
    const computed = PenghitungStatusStok.hitungStatus(entry.laporan);

    // Publish Domain Event
    eventBus.publish('StokDilaporkan', {
      faskesId,
      obatId,
      report: newReport,
    });

    eventBus.publish('StatusStokBerubah', {
      faskesId,
      obatId,
      status: computed.status,
      kesegaran: computed.kesegaran,
      hasConflict: computed.hasConflict,
    });

    return {
      ...entry,
      ...computed,
    };
  }
}

export const ketersediaanObatService = new KetersediaanObatService();
export default ketersediaanObatService;
