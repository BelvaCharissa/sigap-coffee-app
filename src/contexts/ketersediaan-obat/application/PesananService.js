/**
 * PesananService.js - Mengelola Transaksi Pembelian Obat Warga & Verifikasi Apoteker
 */

import { ketersediaanObatService } from './KetersediaanObatService';
import { eventBus } from '../../../shared/EventBus';

class PesananService {
  constructor() {
    this.pesananList = [
      {
        id: 'ord_1',
        faskesId: 'faskes_1',
        faskesNama: 'Apotek Kimia Farma Dago',
        obatId: 'obat_1',
        obatNama: 'Paracetamol Sirup 120mg',
        jumlah: 2,
        hargaSatuan: 18000,
        totalHarga: 36000,
        pembeliId: 'usr_warga_demo',
        pembeliNama: 'Indah Ramadhani',
        status: 'Diproses Apoteker', // 'Menunggu Konfirmasi', 'Diproses Apoteker', 'Siap Diambil'
        metode: 'Ambil di Apotek (Pick-up)',
        catatan: 'Untuk anak demam tinggi 38.5C',
        waktu: new Date(Date.now() - 35 * 60000).toISOString(),
      },
    ];
  }

  buatPesanan({ faskesId, faskesNama, obatId, obatNama, jumlah, hargaSatuan, pembeliId, pembeliNama, metode, catatan }) {
    const totalHarga = (jumlah || 1) * (hargaSatuan || 15000);
    const order = {
      id: 'ord_' + Date.now(),
      faskesId,
      faskesNama,
      obatId,
      obatNama,
      jumlah: jumlah || 1,
      hargaSatuan: hargaSatuan || 15000,
      totalHarga,
      pembeliId: pembeliId || 'usr_warga_default',
      pembeliNama: pembeliNama || 'Warga Siaga',
      status: 'Menunggu Konfirmasi Apoteker',
      metode: metode || 'Ambil di Apotek (Pick-up)',
      catatan: catatan || 'Pesanan obat darurat warga',
      waktu: new Date().toISOString(),
    };

    this.pesananList.unshift(order);

    // Otomatis kurangi stok pada faskes bersangkutan
    try {
      const summary = ketersediaanObatService.getSummaryObatTersedia(faskesId);
      const targetObat = summary.find(o => o.id === obatId || o.nama.toLowerCase().includes(obatNama.toLowerCase().split(' ')[0]));
      if (targetObat && targetObat.jumlah > 0) {
        targetObat.jumlah = Math.max(0, targetObat.jumlah - (jumlah || 1));
      }
    } catch (_) {}

    eventBus.publish('PesananBaru', order);
    return order;
  }

  getPesananByFaskes(faskesId) {
    if (!faskesId) return [...this.pesananList];
    return this.pesananList.filter(p => p.faskesId === faskesId);
  }

  getPesananByPembeli(pembeliId) {
    if (!pembeliId) return [...this.pesananList];
    return this.pesananList.filter(p => p.pembeliId === pembeliId);
  }

  updateStatusPesanan(orderId, statusBaru) {
    const order = this.pesananList.find(o => o.id === orderId);
    if (order) {
      order.status = statusBaru;
      eventBus.publish('StatusPesananBerubah', order);
      return order;
    }
    return null;
  }
}

export const pesananService = new PesananService();
export default pesananService;
