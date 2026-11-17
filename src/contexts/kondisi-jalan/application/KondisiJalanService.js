import { BahayaJalan } from '../domain/BahayaJalan';
import { JenisBahaya, StatusBahaya } from '../domain/JenisBahaya';
import { eventBus } from '../../../shared/EventBus';

const initialBahayaData = [
  {
    id: 'bahaya_1',
    jenis: JenisBahaya.BANJIR,
    lokasiNama: 'Underpass Jl. Pasteur (Dekat Mall BTC)',
    latitude: -6.8965,
    longitude: 107.5925,
    deskripsi: 'Genangan air setinggi 30-40 cm akibat hujan lebat, motor dihimbau hindari.',
    ketinggianAirCm: 35,
    status: StatusBahaya.AKTIF,
    pelaporRole: 'Mitra',
    pelaporName: 'Dishub / Relawan Siaga',
    jumlahKonfirmasi: 4,
    konfirmasiOleh: ['user_warga_1', 'user_warga_2'],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'bahaya_2',
    jenis: JenisBahaya.BANJIR,
    lokasiNama: 'Jl. Dago Bawah persimpangan Cikapayang',
    latitude: -6.8988,
    longitude: 107.6121,
    deskripsi: 'Air limpasan selokan sekitar 15-20 cm, lalu lintas merayap.',
    ketinggianAirCm: 18,
    status: StatusBahaya.AKTIF,
    pelaporRole: 'Warga',
    pelaporName: 'Rian Pratama',
    jumlahKonfirmasi: 3,
    konfirmasiOleh: ['user_10', 'user_11'],
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'bahaya_3',
    jenis: JenisBahaya.JALAN_RUSAK,
    lokasiNama: 'Jl. Tamansari samping Kebun Binatang',
    latitude: -6.8925,
    longitude: 107.6062,
    deskripsi: 'Lubang galian pipa cukup dalam dan licin saat hujan.',
    ketinggianAirCm: null,
    status: StatusBahaya.MENUNGGU_KONFIRMASI,
    pelaporRole: 'Warga',
    pelaporName: 'Agus',
    jumlahKonfirmasi: 1,
    konfirmasiOleh: [],
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

class KondisiJalanService {
  constructor() {
    this.bahayaList = initialBahayaData.map(b => new BahayaJalan(b));
    this.cuacaSnapshot = {
      lokasi: 'Bandung (Coblong / Dago)',
      suhu: 23.5,
      kondisi: 'Hujan Sedang',
      curahHujanMm: 14.2,
      isCuacaEkstrem: false,
      kelembaban: 88,
      anginKmh: 12,
      terakhirDiperbarui: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  getAllBahaya() {
    // Periksa status kedaluwarsa sebelum return
    this.bahayaList.forEach(b => b.periksaStatusAktif());
    return [...this.bahayaList];
  }

  getBahayaAktif() {
    return this.getAllBahaya().filter(b => b.status === StatusBahaya.AKTIF);
  }

  laporkanBahaya({ jenis, lokasiNama, latitude, longitude, deskripsi, ketinggianAirCm, user }) {
    const newBahaya = new BahayaJalan({
      jenis,
      lokasiNama,
      latitude: latitude || -6.8930,
      longitude: longitude || 107.6100,
      deskripsi,
      ketinggianAirCm: ketinggianAirCm ? Number(ketinggianAirCm) : null,
      pelaporRole: user?.role || 'Warga',
      pelaporName: user?.nama || 'Warga',
      jumlahKonfirmasi: 1,
      konfirmasiOleh: [user?.id || 'anonymous'],
    });

    this.bahayaList.unshift(newBahaya);

    eventBus.publish('BahayaDilaporkan', {
      bahayaId: newBahaya.id,
      jenis: newBahaya.jenis,
      lokasiNama: newBahaya.lokasiNama,
      status: newBahaya.status,
    });

    if (newBahaya.status === StatusBahaya.AKTIF) {
      eventBus.publish('BahayaAktif', {
        bahayaId: newBahaya.id,
        jenis: newBahaya.jenis,
        lokasiNama: newBahaya.lokasiNama,
      });
    }

    return newBahaya;
  }

  konfirmasiBahaya(bahayaId, user) {
    const bahaya = this.bahayaList.find(b => b.id === bahayaId);
    if (!bahaya) throw new Error('Laporan bahaya jalan tidak ditemukan.');

    const newStatus = bahaya.tambahKonfirmasi(user?.id || 'anon_' + Date.now(), user?.role);

    if (newStatus === StatusBahaya.AKTIF) {
      eventBus.publish('BahayaAktif', {
        bahayaId: bahaya.id,
        jenis: bahaya.jenis,
        lokasiNama: bahaya.lokasiNama,
      });
    }

    return bahaya;
  }

  setCuacaSnapshot(cuaca) {
    this.cuacaSnapshot = { ...this.cuacaSnapshot, ...cuaca };
    if (this.cuacaSnapshot.isCuacaEkstrem) {
      eventBus.publish('CuacaEkstremTerdeteksi', this.cuacaSnapshot);
    }
  }

  getCuacaSnapshot() {
    return { ...this.cuacaSnapshot };
  }
}

export const kondisiJalanService = new KondisiJalanService();
export default kondisiJalanService;
