import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { ruteAmanService } from '../contexts/rute-aman/application/RuteAmanService';
import { kondisiJalanService } from '../contexts/kondisi-jalan/application/KondisiJalanService';
import { direktoriFaskesService } from '../contexts/direktori-faskes/application/DirektoriFaskesService';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import Badge from '../components/Badge';
import ModalLaporBahaya from '../components/ModalLaporBahaya';

export default function SafeRouteScreen({ route, navigation }) {
  const { currentUser, tambahReputasi } = useAuth();
  const allFaskes = direktoriFaskesService.getAll();
  const targetFaskesFromParam = route?.params?.targetFaskes || allFaskes[0];

  const [selectedFaskes, setSelectedFaskes] = useState(targetFaskesFromParam);
  const [rencanaRute, setRencanaRute] = useState(null);
  const [bahayaList, setBahayaList] = useState([]);
  const [modalBahayaVisible, setModalBahayaVisible] = useState(false);

  const refreshRouteData = () => {
    if (selectedFaskes) {
      const rencana = ruteAmanService.hitungRuteKeFaskes(selectedFaskes);
      setRencanaRute(rencana);
    }
    const hazards = kondisiJalanService.getAllBahaya();
    setBahayaList(hazards);
  };

  useEffect(() => {
    refreshRouteData();
  }, [selectedFaskes]);

  const handleKonfirmasiBahaya = (bahayaId) => {
    try {
      kondisiJalanService.konfirmasiBahaya(bahayaId, currentUser);
      tambahReputasi(1);
      refreshRouteData();
      Alert.alert(
        'Konfirmasi Tercatat!',
        'Terima kasih telah memverifikasi kondisi jalan di lapangan untuk keselamatan sesama pengguna jalan.'
      );
    } catch (err) {
      Alert.alert('Info', err.message);
    }
  };

  const handleCallFaskes = () => {
    if (selectedFaskes?.telepon) {
      Linking.openURL(`tel:${selectedFaskes.telepon}`);
    } else {
      Alert.alert('Kontak', `Hubungi pusat informasi faskes ${selectedFaskes.nama}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rute Aman ke Faskes</Text>
            <Text style={styles.subTitle}>
              Menghitung rute yang bebas banjir & risiko cuaca ekstrem
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reportHazardBtn}
            onPress={() => setModalBahayaVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
            <Text style={styles.reportHazardBtnText}>Lapor Bahaya</Text>
          </TouchableOpacity>
        </View>

        {/* Faskes Selector Dropdown/Cards */}
        <View style={styles.destinationCard}>
          <Text style={styles.destLabel}>Tujuan Faskes:</Text>
          <View style={styles.destPickerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.destName}>{selectedFaskes.nama}</Text>
              <Text style={styles.destAddress}>{selectedFaskes.alamat}</Text>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCallFaskes}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Cuaca di Perjalanan */}
        {rencanaRute?.cuaca && (
          <View style={styles.weatherStrip}>
            <Ionicons
              name={rencanaRute.cuaca.curahHujanMm > 5 ? 'rainy' : 'cloudy'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.weatherStripText}>
              Cuaca saat ini: <Text style={{ fontWeight: '700' }}>{rencanaRute.cuaca.kondisi}</Text> ({rencanaRute.cuaca.suhu}°C, Hujan {rencanaRute.cuaca.curahHujanMm} mm/jam)
            </Text>
          </View>
        )}

        {/* Warning Banner bila Rute Tercepat melewati Bahaya (FR-RA-05) */}
        {rencanaRute?.opsiTercepat?.hasHazard && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-triangle" size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertBannerTitle}>Peringatan Titik Rawan di Rute Tercepat!</Text>
              <Text style={styles.alertBannerDesc}>
                Jalur utama melewati {rencanaRute.opsiTercepat.hazardsOnPath.map(h => `${h.jenis} di ${h.lokasiNama}`).join(', ')}. Disarankan memakai Rute Teraman.
              </Text>
            </View>
          </View>
        )}

        {/* Perbandingan Dua Opsi Rute (FR-RA-02 & FR-RA-03) */}
        <Text style={styles.sectionHeading}>Pilihan Opsi Rute:</Text>

        {/* 1. Opsi Rute Teraman (Rekomendasi SIGAP) */}
        {rencanaRute?.opsiTeraman && (
          <View style={[styles.routeCard, styles.routeCardRecommended]}>
            <View style={styles.badgeCorner}>
              <Text style={styles.badgeCornerText}>★ REKOMENDASI TERAMAN</Text>
            </View>
            <View style={styles.routeHeader}>
              <View>
                <Text style={styles.routeName}>{rencanaRute.opsiTeraman.nama}</Text>
                <Text style={styles.routeVia}>{rencanaRute.opsiTeraman.via}</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>{rencanaRute.opsiTeraman.skorAman}</Text>
                <Text style={styles.scoreLabel}>Skor Aman</Text>
              </View>
            </View>

            <View style={styles.routeStatsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={styles.statVal}>{rencanaRute.opsiTeraman.estimasiMenit} Menit</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={14} color={colors.primary} />
                <Text style={styles.statVal}>{rencanaRute.opsiTeraman.jarakKm} km</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark" size={14} color={colors.stockAda} />
                <Text style={[styles.statVal, { color: colors.stockAda }]}>
                  {rencanaRute.opsiTeraman.tingkatKeamanan}
                </Text>
              </View>
            </View>

            <View style={styles.safetyGuaranteeRow}>
              <Ionicons name="checkmark-done-circle" size={16} color={colors.primary} />
              <Text style={styles.safetyGuaranteeText}>
                Jalur bebas titik genangan air aktif & minim risiko tersendat.
              </Text>
            </View>
          </View>
        )}

        {/* 2. Opsi Rute Tercepat (Jalur Biasa) */}
        {rencanaRute?.opsiTercepat && (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View>
                <Text style={styles.routeName}>{rencanaRute.opsiTercepat.nama}</Text>
                <Text style={styles.routeVia}>{rencanaRute.opsiTercepat.via}</Text>
              </View>
              <View style={[styles.scoreBox, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.scoreNum, { color: '#B45309' }]}>
                  {rencanaRute.opsiTercepat.skorAman}
                </Text>
                <Text style={styles.scoreLabel}>Skor Aman</Text>
              </View>
            </View>

            <View style={styles.routeStatsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.statVal}>{rencanaRute.opsiTercepat.estimasiMenit} Menit</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.statVal}>{rencanaRute.opsiTercepat.jarakKm} km</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="alert-circle" size={14} color="#B45309" />
                <Text style={[styles.statVal, { color: '#B45309' }]}>
                  {rencanaRute.opsiTercepat.tingkatKeamanan}
                </Text>
              </View>
            </View>

            {rencanaRute.opsiTercepat.hazardsOnPath.length > 0 && (
              <View style={styles.hazardWarningList}>
                {rencanaRute.opsiTercepat.hazardsOnPath.map((hz, idx) => (
                  <Text key={idx} style={styles.hazardWarningItem}>
                    ⚠️ Terdeteksi {hz.jenis} di {hz.lokasiNama} (-{hz.pengurangan} poin aman)
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Titik Bahaya Jalan Terpantau Komunitas */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Titik Hambatan & Bahaya Aktif</Text>
            <Text style={styles.sectionSub}>Data terverifikasi komunitas warga & mitra di lapangan</Text>
          </View>
        </View>

        <View style={styles.hazardsContainer}>
          {bahayaList.map((bahaya) => (
            <View key={bahaya.id} style={styles.hazardCard}>
              <View style={styles.hazardTop}>
                <Badge
                  label={bahaya.jenis}
                  type={bahaya.jenis === 'Banjir' ? 'Banjir' : 'warning'}
                  size="small"
                />
                <Badge
                  label={bahaya.status}
                  type={bahaya.status === 'Aktif' ? 'danger' : 'warning'}
                  size="small"
                />
              </View>
              <Text style={styles.hazardLocation}>{bahaya.lokasiNama}</Text>
              {bahaya.ketinggianAirCm && (
                <Text style={styles.hazardWaterLevel}>
                  🌊 Genangan Air: ±{bahaya.ketinggianAirCm} cm
                </Text>
              )}
              <Text style={styles.hazardDesc}>{bahaya.deskripsi}</Text>

              <View style={styles.hazardFooter}>
                <Text style={styles.hazardReporter}>
                  Pelapor: {bahaya.pelaporName} ({bahaya.pelaporRole}) • {bahaya.jumlahKonfirmasi} konfirmasi
                </Text>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleKonfirmasiBahaya(bahaya.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="thumbs-up-outline" size={13} color={colors.primary} />
                  <Text style={styles.confirmBtnText}>Konfirmasi</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Modal Lapor Bahaya */}
      <ModalLaporBahaya
        visible={modalBahayaVisible}
        onClose={() => setModalBahayaVisible(false)}
        onSuccess={refreshRouteData}
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
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reportHazardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  reportHazardBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  destLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  destPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  destName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  destAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  weatherStripText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  alertBannerDesc: {
    fontSize: 11.5,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  routeCardRecommended: {
    borderColor: colors.primary,
    borderWidth: 1.8,
    backgroundColor: '#FCFFFD',
  },
  badgeCorner: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeCornerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  routeVia: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBox: {
    backgroundColor: colors.primaryPastel,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.primary,
  },
  routeStatsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  safetyGuaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: colors.primarySubtle,
    padding: 8,
    borderRadius: 8,
  },
  safetyGuaranteeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  hazardWarningList: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  hazardWarningItem: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  hazardsContainer: {
    paddingHorizontal: 16,
  },
  hazardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hazardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hazardLocation: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  hazardWaterLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.hazardBanjir,
    marginBottom: 4,
  },
  hazardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  hazardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  hazardReporter: {
    fontSize: 10.5,
    color: colors.textTertiary,
    flex: 1,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPastel,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  confirmBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
