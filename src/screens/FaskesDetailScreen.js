import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';
import { pesananService } from '../contexts/ketersediaan-obat/application/PesananService';
import ModalLaporStok from '../components/ModalLaporStok';

export default function FaskesDetailScreen({ route, navigation }) {
  const faskes = route?.params?.faskes || {
    id: 'faskes_1',
    nama: 'Apotek Kimia Farma Dago',
    kategori: 'Apotek',
    alamat: 'Jl. Ir. H. Juanda No. 120, Dago, Bandung',
    telepon: '022-2501234',
    jamOperasional: '24 Jam',
  };
  const { currentUser } = useAuth();
  const [modalLaporVisible, setModalLaporVisible] = useState(false);
  const [selectedObatForLapor, setSelectedObatForLapor] = useState(null);

  // Purchase Modal State
  const [modalBeliVisible, setModalBeliVisible] = useState(false);
  const [selectedObatForBeli, setSelectedObatForBeli] = useState(null);
  const [qtyBeli, setQtyBeli] = useState(1);
  const [catatanBeli, setCatatanBeli] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const katalog = ketersediaanObatService.getKatalog() || [];
  const pesananList = pesananService.getPesananByFaskes(faskes.id) || [];

  const handleCall = () => {
    if (faskes.telepon && faskes.telepon !== '-') {
      Linking.openURL(`tel:${faskes.telepon}`);
    } else {
      Alert.alert('Kontak Apotek', `Nomor telepon untuk ${faskes.nama} belum terdaftar.`);
    }
  };

  const handleOpenRoute = () => {
    navigation.navigate('MainTabs', {
      screen: 'Rute',
      params: { targetFaskes: faskes },
    });
  };

  const handleOpenBeli = (obat) => {
    setSelectedObatForBeli(obat);
    setQtyBeli(1);
    setCatatanBeli('');
    setModalBeliVisible(true);
  };

  const handleConfirmBeli = () => {
    if (!selectedObatForBeli) return;
    const hargaPerPcs = selectedObatForBeli.id === 'obat_1' ? 18000 : selectedObatForBeli.id === 'obat_3' ? 8000 : 15000;

    pesananService.buatPesanan({
      faskesId: faskes.id,
      faskesNama: faskes.nama,
      obatId: selectedObatForBeli.id,
      obatNama: selectedObatForBeli.nama,
      jumlah: qtyBeli,
      hargaSatuan: hargaPerPcs,
      pembeliId: currentUser?.id || 'usr_warga_1',
      pembeliNama: currentUser?.nama || 'Indah Ramadhani',
      metode: 'Ambil di Apotek (Pick-up Langsung)',
      catatan: catatanBeli || 'Pesanan obat warga',
    });

    setModalBeliVisible(false);
    setRefreshKey(prev => prev + 1);

    Alert.alert(
      'Pesanan Obat Berhasil!',
      `Pesanan ${selectedObatForBeli.nama} (${qtyBeli} pcs) telah tercatat dan langsung masuk ke dashboard Apoteker ${faskes.nama}.`,
      [{ text: 'OK' }]
    );
  };

  const handleUpdateStatusPesanan = (orderId, statusBaru) => {
    pesananService.updateStatusPesanan(orderId, statusBaru);
    setRefreshKey(prev => prev + 1);
    Alert.alert('Status Diperbarui', `Pesanan berhasil diubah menjadi: "${statusBaru}"`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Detail &amp; Pembelian Obat</Text>
          <TouchableOpacity onPress={handleOpenRoute} style={styles.routeHeaderBtn}>
            <Ionicons name="navigate-circle" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Faskes Main Card */}
        <View style={styles.faskesHeaderCard}>
          <View style={styles.faskesTypeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{faskes.jenis}</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={[styles.badgePillText, { color: colors.primary }]}>Mitra Apotek Terdaftar</Text>
            </View>
          </View>

          <Text style={styles.faskesTitle}>{faskes.nama}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>{faskes.alamat}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={15} color={colors.primary} />
              <Text style={styles.metaText}>{faskes.jamBuka}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="call-outline" size={15} color={colors.primary} />
              <Text style={styles.metaText}>{faskes.telepon || '022-2505678'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={15} color="#1B2E24" />
              <Text style={styles.metaText}>Rating: {faskes.rating || 4.8}/5.0</Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.callButtonText}>Telepon Apotek</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.routeButton} onPress={handleOpenRoute} activeOpacity={0.8}>
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.routeButtonText}>Rute Bebas Bahaya</Text>
            </TouchableOpacity>
          </View>

          {/* Apoteker Notice */}
          <View style={styles.apotekerBanner}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.apotekerBannerText}>
              {currentUser?.role === 'Mitra'
                ? 'Mode Apoteker Aktif: Anda berwenang memproses pesanan dan memperbarui stok.'
                : 'Warga dapat langsung memesan obat di bawah dan mengambilnya di apotek.'}
            </Text>
          </View>
        </View>

        {/* Medicine Inventory & Buy Section */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeaderRow}>
            <Text style={styles.sectionTitle}>Katalog & Pembelian Obat Warga</Text>
            <Text style={styles.sectionSubtitle}>
              Pilih obat yang tersedia untuk langsung dipesan dan diambil di apotek ini
            </Text>
          </View>

          {katalog.map((obat) => {
            const stokInfo = ketersediaanObatService.getStokFaskes(faskes.id, obat.id);
            const isHabis = stokInfo?.status === 'Habis';
            const jumlahStok = isHabis ? 0 : (obat.id === 'obat_1' ? 45 : obat.id === 'obat_3' ? 35 : 20);
            const harga = obat.id === 'obat_1' ? 18000 : obat.id === 'obat_3' ? 8000 : 15000;

            return (
              <View key={obat.id} style={styles.obatCard}>
                <View style={styles.obatCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.obatName}>{obat.nama}</Text>
                    <Text style={styles.obatCategory}>
                      {obat.kategori} • Rp {harga.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <View style={[styles.qtyBadge, isHabis && styles.qtyBadgeHabis]}>
                    <Text style={[styles.qtyBadgeText, isHabis && styles.qtyBadgeTextHabis]}>
                      {isHabis ? 'Stok Habis' : `${jumlahStok} Tersedia`}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActionsRow}>
                  {/* Tombol Beli untuk Warga */}
                  {!isHabis && (
                    <TouchableOpacity
                      style={styles.btnBeliObat}
                      onPress={() => handleOpenBeli(obat)}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="cart" size={14} color="#FFFFFF" />
                      <Text style={styles.btnBeliObatText}>Beli / Pesan Obat</Text>
                    </TouchableOpacity>
                  )}

                  {/* Tombol Update untuk Apoteker */}
                  {currentUser?.role === 'Mitra' ? (
                    <TouchableOpacity
                      style={styles.laporItemBtn}
                      onPress={() => {
                        setSelectedObatForLapor(obat);
                        setModalLaporVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={14} color={colors.primary} />
                      <Text style={styles.laporItemBtnText}>Update Stok (Apoteker)</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Section: Pesanan Masuk (Terintegrasi Apoteker & Warga) */}
        <View style={styles.orderSection}>
          <View style={styles.inventoryHeaderRow}>
            <Text style={styles.sectionTitle}>
              {currentUser?.role === 'Mitra' ? '📋 Pesanan Masuk (Dashboard Apoteker)' : '🛍️ Pesanan Anda di Apotek Ini'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {currentUser?.role === 'Mitra'
                ? 'Daftar pesanan warga yang perlu disiapkan oleh petugas apotek'
                : 'Status pesanan obat yang Anda pesan untuk diambil di apotek'}
            </Text>
          </View>

          {pesananList.length === 0 ? (
            <View style={styles.emptyOrderBox}>
              <Text style={styles.emptyOrderText}>Belum ada pesanan aktif di apotek ini.</Text>
            </View>
          ) : (
            pesananList.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderBuyerName}>{order.pembeliNama}</Text>
                    <Text style={styles.orderItemName}>
                      {order.obatNama} ({order.jumlah} pcs) • Rp {order.totalHarga.toLocaleString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.orderStatusPill}>
                    <Text style={styles.orderStatusText}>{order.status}</Text>
                  </View>
                </View>

                <Text style={styles.orderNoteText}>
                  Catatan: {order.catatan} • {order.metode}
                </Text>

                {/* Tombol Aksi Apoteker untuk Memproses Pesanan */}
                {currentUser?.role === 'Mitra' && (
                  <View style={styles.apotekerActionRow}>
                    <TouchableOpacity
                      style={styles.btnProsesOrder}
                      onPress={() => handleUpdateStatusPesanan(order.id, 'Diproses & Disiapkan')}
                    >
                      <Text style={styles.btnProsesOrderText}>✓ Proses Pesanan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnProsesOrder, { backgroundColor: colors.primary }]}
                      onPress={() => handleUpdateStatusPesanan(order.id, 'Siap Diambil di Kasir')}
                    >
                      <Text style={[styles.btnProsesOrderText, { color: '#FFFFFF' }]}>✓ Siap Diambil</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Beli / Pesan Obat */}
      <Modal visible={modalBeliVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Beli / Pesan Obat</Text>
              <TouchableOpacity onPress={() => setModalBeliVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedObatForBeli && (
              <View style={styles.modalMedicineBox}>
                <Text style={styles.modalMedName}>{selectedObatForBeli.nama}</Text>
                <Text style={styles.modalFaskesSub}>Apotek: {faskes.nama}</Text>
                <Text style={styles.modalPriceText}>
                  Harga: Rp{' '}
                  {(
                    selectedObatForBeli.id === 'obat_1' ? 18000 : 15000
                  ).toLocaleString('id-ID')}{' '}
                  / pcs
                </Text>

                {/* Stepper Jumlah */}
                <View style={styles.stepperRow}>
                  <Text style={styles.stepperLabel}>Jumlah Pesanan:</Text>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setQtyBeli(Math.max(1, qtyBeli - 1))}
                    >
                      <Ionicons name="remove" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{qtyBeli}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setQtyBeli(Math.min(5, qtyBeli + 1))}
                    >
                      <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Catatan Tambahan */}
                <Text style={[styles.stepperLabel, { marginTop: 12 }]}>Catatan untuk Apoteker:</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Contoh: Titip di kasir, diambil 30 menit lagi"
                  value={catatanBeli}
                  onChangeText={setCatatanBeli}
                />

                {/* Total Bayar */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Pembayaran:</Text>
                  <Text style={styles.totalValue}>
                    Rp{' '}
                    {(
                      qtyBeli * (selectedObatForBeli.id === 'obat_1' ? 18000 : 15000)
                    ).toLocaleString('id-ID')}
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.btnSubmitOrder}
                  onPress={handleConfirmBeli}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.btnSubmitOrderText}>Konfirmasi &amp; Kirim ke Apoteker</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Lapor Stok (Khusus Apoteker) */}
      <ModalLaporStok
        visible={modalLaporVisible}
        onClose={() => setModalLaporVisible(false)}
        faskes={faskes}
        obat={selectedObatForLapor}
        onSuccess={() => {
          Alert.alert('Sukses', 'Status ketersediaan obat berhasil diperbarui secara realtime.');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECE5',
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#1B2E24',
  },
  routeHeaderBtn: {
    padding: 2,
  },
  faskesHeaderCard: {
    backgroundColor: '#FFFFFF',
    margin: 18,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    shadowColor: '#1B2E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  faskesTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F9F4',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primary,
  },
  faskesTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1B2E24',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12.5,
    color: '#52695E',
    flex: 1,
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F9F4',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F9F4',
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#52695E',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  callButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  routeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  apotekerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  apotekerBannerText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  inventorySection: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  inventoryHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B2E24',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#52695E',
    marginTop: 2,
  },
  obatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    marginBottom: 10,
  },
  obatCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  obatName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B2E24',
  },
  obatCategory: {
    fontSize: 11.5,
    color: '#52695E',
    marginTop: 2,
  },
  qtyBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  qtyBadgeHabis: {
    backgroundColor: colors.highlightRedBg,
  },
  qtyBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
  },
  qtyBadgeTextHabis: {
    color: colors.highlightRed,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F9F4',
    paddingTop: 8,
  },
  btnBeliObat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  btnBeliObatText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  laporItemBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  laporItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  orderSection: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  emptyOrderBox: {
    backgroundColor: '#F8FAF9',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  emptyOrderText: {
    fontSize: 12,
    color: '#52695E',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderBuyerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B2E24',
  },
  orderItemName: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  orderStatusPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.primary,
  },
  orderNoteText: {
    fontSize: 11,
    color: '#52695E',
  },
  apotekerActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F9F4',
    paddingTop: 8,
  },
  btnProsesOrder: {
    flex: 1,
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnProsesOrderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B2E24',
  },
  modalMedicineBox: {
    gap: 6,
  },
  modalMedName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B2E24',
  },
  modalFaskesSub: {
    fontSize: 12,
    color: '#52695E',
  },
  modalPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  stepperLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B2E24',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F9F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 12,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B2E24',
    minWidth: 20,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 12,
    padding: 10,
    fontSize: 12.5,
    color: '#1B2E24',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2ECE5',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#52695E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  btnSubmitOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  btnSubmitOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
