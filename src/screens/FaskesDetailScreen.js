import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';
import Badge from '../components/Badge';
import FreshnessTag from '../components/FreshnessTag';
import ModalLaporStok from '../components/ModalLaporStok';

export default function FaskesDetailScreen({ route, navigation }) {
  const { faskes } = route.params;
  const { currentUser, ajukanKlaim } = useAuth();
  const [modalLaporVisible, setModalLaporVisible] = useState(false);
  const [selectedObatForLapor, setSelectedObatForLapor] = useState(null);

  const katalog = ketersediaanObatService.getKatalog();

  const handleCall = () => {
    if (faskes.telepon && faskes.telepon !== '-') {
      Linking.openURL(`tel:${faskes.telepon}`);
    } else {
      Alert.alert('Kontak', `Nomor telepon untuk ${faskes.nama} belum terdaftar.`);
    }
  };

  const handleOpenRoute = () => {
    navigation.navigate('MainTabs', {
      screen: 'Rute',
      params: { targetFaskes: faskes },
    });
  };

  const handleKlaim = () => {
    try {
      ajukanKlaim(faskes.id, faskes.nama);
      Alert.alert(
        'Klaim Diajukan!',
        `Pengajuan klaim kepemilikan untuk ${faskes.nama} berhasil dikirim dan menunggu verifikasi admin.`
      );
    } catch (err) {
      Alert.alert('Info', err.message);
    }
  };

  const handleLaporObat = (obat) => {
    setSelectedObatForLapor(obat);
    setModalLaporVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Detail Fasilitas Kesehatan</Text>
          <TouchableOpacity onPress={handleOpenRoute} style={styles.routeHeaderBtn}>
            <Ionicons name="navigate-circle" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Faskes Main Card */}
        <View style={styles.faskesHeaderCard}>
          <View style={styles.faskesTypeRow}>
            <Badge type="info" label={faskes.jenis} />
            {faskes.isClaimed ? (
              <Badge type="verified" label="Mitra Terverifikasi" icon="shield-checkmark" />
            ) : (
              <Badge type="neutral" label="Belum Diklaim" />
            )}
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
              <Text style={styles.metaText}>{faskes.telepon || '-'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={15} color="#F59E0B" />
              <Text style={styles.metaText}>Rating: {faskes.rating || 4.7}/5.0</Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Telepon Faskes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.routeButton} onPress={handleOpenRoute} activeOpacity={0.8}>
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.routeButtonText}>Cari Rute Aman</Text>
            </TouchableOpacity>
          </View>

          {/* Mitra Claim Box */}
          {!faskes.isClaimed && currentUser.role === 'Mitra' ? (
            <TouchableOpacity style={styles.claimBanner} onPress={handleKlaim}>
              <Ionicons name="ribbon-outline" size={20} color="#15803D" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.claimTitle}>Apakah Anda pemilik faskes ini?</Text>
                <Text style={styles.claimSub}>Ajukan klaim untuk mengelola stok resmi secara prioritas.</Text>
              </View>
              <Text style={styles.claimActionText}>Klaim</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Medicine Inventory Section */}
        <View style={styles.inventorySection}>
          <View style={styles.inventoryHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Ketersediaan Obat di Sini</Text>
              <Text style={styles.sectionSubtitle}>Status stok dihitung dari laporan mitra dan warga</Text>
            </View>
          </View>

          {katalog.map((obat) => {
            const stokInfo = ketersediaanObatService.getStok(faskes.id, obat.id);
            const statusKey = stokInfo.status === 'Ada' ? 'success' : stokInfo.status === 'Habis' ? 'danger' : 'warning';

            return (
              <View key={obat.id} style={styles.obatCard}>
                <View style={styles.obatCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.obatName}>{obat.nama}</Text>
                    <Text style={styles.obatCategory}>{obat.kategori} • {obat.satuan}</Text>
                  </View>
                  <Badge type={statusKey} label={`Stok ${stokInfo.status}`} />
                </View>

                <View style={styles.obatMetaRow}>
                  <FreshnessTag kesegaran={stokInfo.kesegaran} />
                  <View style={styles.trustScorePill}>
                    <Text style={styles.trustScoreText}>Kepercayaan: {stokInfo.skorKepercayaan}%</Text>
                  </View>
                </View>

                {stokInfo.adaKonflik ? (
                  <View style={styles.conflictNotice}>
                    <Ionicons name="alert" size={13} color="#D97706" />
                    <Text style={styles.conflictNoticeText}>Ada laporan stok berbeda dalam 24 jam terakhir</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.laporItemBtn}
                  onPress={() => handleLaporObat(obat)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={14} color={colors.primary} />
                  <Text style={styles.laporItemBtnText}>Perbarui / Laporkan Stok Ini</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal Lapor Stok */}
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
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  routeHeaderBtn: {
    padding: 2,
  },
  faskesHeaderCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  faskesTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  faskesTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
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
    backgroundColor: '#0288D1',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
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
    borderRadius: 10,
    gap: 6,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  claimBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  claimTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  claimSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  claimActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 6,
  },
  inventorySection: {
    paddingHorizontal: 16,
  },
  inventoryHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  obatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  obatCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  obatName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  obatCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  obatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trustScorePill: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  conflictNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  conflictNoticeText: {
    fontSize: 11,
    color: '#B45309',
  },
  laporItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryPastel,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  laporItemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
