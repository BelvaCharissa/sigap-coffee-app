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
import ModalLaporBahaya from '../components/ModalLaporBahaya';

export default function SafeRouteScreen({ route, navigation }) {
  const { currentUser, tambahReputasi } = useAuth();
  const allFaskes = direktoriFaskesService.getAll();
  const targetFaskesFromParam = route?.params?.targetFaskes || allFaskes[0];

  const [selectedFaskes, setSelectedFaskes] = useState(targetFaskesFromParam);
  const [selectedRouteType, setSelectedRouteType] = useState('teraman'); // 'teraman' | 'tercepat'
  const [rencanaRute, setRencanaRute] = useState(null);
  const [bahayaList, setBahayaList] = useState([]);
  const [showHambatan, setShowHambatan] = useState(false); // Hidden by default, expands on tap!
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

  const handleCallFaskes = () => {
    if (selectedFaskes?.telepon) {
      Linking.openURL(`tel:${selectedFaskes.telepon}`);
    } else {
      Alert.alert('Kontak Apotek', `Nomor telepon: 022-2505678 (${selectedFaskes.nama})`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Floating Bar matching reference */}
      <View style={styles.topMapBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topIconBtn}>
          <Ionicons name="chevron-back" size={20} color="#1B2E24" />
        </TouchableOpacity>
        <View style={styles.routeHeaderPill}>
          <Text style={styles.routeHeaderPillText}>Rute Bebas Bahaya</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Bagikan Rute', 'Tautan navigasi rute aman SIGAP berhasil disalin.')}
          style={styles.topIconBtn}
        >
          <Ionicons name="share-social-outline" size={18} color="#1B2E24" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Smart City Live Hub Pill */}
        <View style={styles.smartCityPillBox}>
          <View style={styles.smartCityTag}>
            <Ionicons name="hardware-chip-outline" size={12} color={colors.primary} />
            <Text style={styles.smartCityTagText}>SMART CITY IOT LALU LINTAS & BANJIR</Text>
          </View>
          <Text style={styles.smartCitySub}>
            Sensor ketinggian air &amp; CCTV kota aktif memandu rute bebas genangan.
          </Text>
        </View>

        {/* Clean Map Visual Container */}
        <View style={styles.mapContainer}>
          <View style={styles.mapCanvas}>
            {/* Roads */}
            <View style={styles.roadDiagonal1} />
            <View style={styles.roadDiagonal2} />

            {/* Polyline Route */}
            <View style={[styles.routeLine, selectedRouteType === 'tercepat' && styles.routeLineRed]} />

            {/* Origin Pin (Warga) */}
            <View style={styles.originMarker}>
              <View style={styles.originMarkerCenter} />
            </View>

            {/* Avoided Flood Alert Marker */}
            <View style={styles.floodAvoidMarker}>
              <Text style={{ fontSize: 13 }}>⚠️</Text>
            </View>

            {/* Destination Pin (Apotek) */}
            <View style={styles.destMarker}>
              <Ionicons name="business" size={13} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Floating ETA & Pharmacy Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaHeaderRow}>
            <View>
              <Text style={styles.etaMinutes}>
                {selectedRouteType === 'teraman'
                  ? `${rencanaRute?.opsiTeraman?.estimasiMenit || 12} Menit`
                  : `${rencanaRute?.opsiTercepat?.estimasiMenit || 8} Menit`}
              </Text>
              <Text style={styles.etaKm}>
                Jarak{' '}
                {selectedRouteType === 'teraman'
                  ? rencanaRute?.opsiTeraman?.jarakKm || 2.8
                  : rencanaRute?.opsiTercepat?.jarakKm || 2.1}{' '}
                km • Skor Keamanan:{' '}
                <Text
                  style={{
                    color:
                      selectedRouteType === 'teraman' ? colors.primary : colors.highlightRed,
                    fontWeight: '800',
                  }}
                >
                  {selectedRouteType === 'teraman'
                    ? `${rencanaRute?.opsiTeraman?.skorAman || 94}/100 (Aman)`
                    : `${rencanaRute?.opsiTercepat?.skorAman || 45}/100 (Rentan)`}
                </Text>
              </Text>
            </View>
            <View
              style={[
                styles.badgeStatusPill,
                selectedRouteType === 'tercepat' && styles.badgeStatusPillRed,
              ]}
            >
              <Text
                style={[
                  styles.badgeStatusPillText,
                  selectedRouteType === 'tercepat' && styles.textRed,
                ]}
              >
                {selectedRouteType === 'teraman' ? 'Bebas Banjir' : 'Lewat Genangan'}
              </Text>
            </View>
          </View>

          <View style={styles.faskesMiniBar}>
            <View style={styles.faskesSquareIcon}>
              <Ionicons name="business" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.faskesMiniTitle}>{selectedFaskes.nama}</Text>
              <Text style={styles.faskesMiniSub} numberOfLines={1}>
                {selectedFaskes.alamat}
              </Text>
            </View>
            <TouchableOpacity style={styles.callGreenBtn} onPress={handleCallFaskes}>
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Perbandingan Opsi Rute (Rapi & Terstruktur) */}
        <View style={styles.routeOptionsSection}>
          <Text style={styles.sectionTitle}>Pilihan Opsi Rute Navigasi</Text>
          <Text style={styles.sectionSub}>
            Pilih rute teraman rekomendasi SIGAP atau rute tercepat biasa
          </Text>

          {/* Opsi 1: Rute Teraman */}
          <TouchableOpacity
            style={[
              styles.routeSelectCard,
              selectedRouteType === 'teraman' && styles.routeSelectCardActive,
            ]}
            onPress={() => setSelectedRouteType('teraman')}
            activeOpacity={0.85}
          >
            <View style={styles.routeCardTop}>
              <View style={styles.routeHeaderLeft}>
                <View style={styles.recommendTag}>
                  <Text style={styles.recommendTagText}>★ REKOMENDASI TERAMAN</Text>
                </View>
                <Text style={styles.routeNameText}>
                  {rencanaRute?.opsiTeraman?.nama || 'Rute Teraman (Via Cisitu Atas)'}
                </Text>
                <Text style={styles.routeViaText}>
                  {rencanaRute?.opsiTeraman?.via || 'Jalur alternatif barat bebas genangan air'}
                </Text>
              </View>

              <View style={styles.scorePillWrap}>
                <Text style={styles.scorePillBig}>
                  {rencanaRute?.opsiTeraman?.skorAman || 94}
                </Text>
                <Text style={styles.scorePillLabel}>Skor Aman</Text>
              </View>
            </View>

            <View style={styles.routeCardBottom}>
              <View style={styles.statChip}>
                <Ionicons name="time-outline" size={13} color={colors.primary} />
                <Text style={styles.statChipText}>
                  {rencanaRute?.opsiTeraman?.estimasiMenit || 12} Menit
                </Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="speedometer-outline" size={13} color={colors.primary} />
                <Text style={styles.statChipText}>
                  {rencanaRute?.opsiTeraman?.jarakKm || 2.8} km
                </Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                <Text style={[styles.statChipText, { color: colors.primary }]}>
                  Risiko Rendah
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Opsi 2: Rute Tercepat */}
          <TouchableOpacity
            style={[
              styles.routeSelectCard,
              selectedRouteType === 'tercepat' && styles.routeSelectCardActiveRed,
            ]}
            onPress={() => setSelectedRouteType('tercepat')}
            activeOpacity={0.85}
          >
            <View style={styles.routeCardTop}>
              <View style={styles.routeHeaderLeft}>
                <View style={[styles.recommendTag, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.recommendTagText, { color: colors.highlightRed }]}>
                    JALUR UTAMA CEPAT
                  </Text>
                </View>
                <Text style={styles.routeNameText}>
                  {rencanaRute?.opsiTercepat?.nama || 'Rute Tercepat (Via Simpang Dago)'}
                </Text>
                <Text style={styles.routeViaText}>
                  Melewati Jl. Ir. H. Juanda (Rawan genangan air hujan)
                </Text>
              </View>

              <View style={[styles.scorePillWrap, { backgroundColor: colors.highlightRedBg }]}>
                <Text style={[styles.scorePillBig, { color: colors.highlightRed }]}>
                  {rencanaRute?.opsiTercepat?.skorAman || 45}
                </Text>
                <Text style={styles.scorePillLabel}>Skor Aman</Text>
              </View>
            </View>

            <View style={styles.routeCardBottom}>
              <View style={styles.statChip}>
                <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.statChipText}>
                  {rencanaRute?.opsiTercepat?.estimasiMenit || 8} Menit
                </Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="speedometer-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.statChipText}>
                  {rencanaRute?.opsiTercepat?.jarakKm || 2.1} km
                </Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: colors.highlightRedBg }]}>
                <Ionicons name="alert-circle" size={13} color={colors.highlightRed} />
                <Text style={[styles.statChipText, { color: colors.highlightRed }]}>
                  Ada Genangan Air
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: Titik Hambatan (COLLAPSIBLE / TIDAK GAMBLANG, HANYA MUNCUL JIKA DIPENCET) */}
        <View style={styles.hambatanSection}>
          <TouchableOpacity
            style={styles.hambatanAccordionHeader}
            onPress={() => setShowHambatan(!showHambatan)}
            activeOpacity={0.8}
          >
            <View style={styles.hambatanHeaderLeft}>
              <Ionicons
                name="warning-outline"
                size={17}
                color={showHambatan ? colors.highlightRed : colors.primary}
              />
              <Text style={styles.hambatanAccordionTitle}>
                {showHambatan
                  ? 'Sembunyikan Titik Hambatan & Genangan'
                  : 'Lihat Titik Hambatan Jalan (Ketuk untuk Menampilkan)'}
              </Text>
            </View>
            <Ionicons
              name={showHambatan ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showHambatan ? (
            <View style={styles.hambatanExpandedContent}>
              <Text style={styles.hambatanDesc}>
                Data live bersumber dari sensor IoT Smart City &amp; konfirmasi warga:
              </Text>
              {bahayaList.map((b) => (
                <View key={b.id} style={styles.hazardItemCard}>
                  <View style={styles.hazardItemTop}>
                    <Text style={styles.hazardName}>{b.lokasiDeskripsi}</Text>
                    <View style={styles.hazardTagRed}>
                      <Text style={styles.hazardTagRedText}>{b.jenis} 28cm</Text>
                    </View>
                  </View>
                  <Text style={styles.hazardSub}>
                    Tingkat Risiko: {b.tingkatKeparahan} • Radius dampak {b.radiusMeter} meter. Jalur alternatif aktif.
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.btnLaporBaru}
                onPress={() => setModalBahayaVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={15} color="#FFFFFF" />
                <Text style={styles.btnLaporBaruText}>Laporkan Titik Hambatan Baru</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
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
    backgroundColor: '#FFFFFF',
  },
  topMapBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeHeaderPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#1B2E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  routeHeaderPillText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1B2E24',
  },
  smartCityPillBox: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: '#F2F9F4',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  smartCityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  smartCityTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  smartCitySub: {
    fontSize: 11,
    color: '#52695E',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 22,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#E5ECE7',
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadDiagonal1: {
    position: 'absolute',
    width: '120%',
    height: 18,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '35deg' }],
  },
  roadDiagonal2: {
    position: 'absolute',
    width: '120%',
    height: 14,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '-45deg' }],
  },
  routeLine: {
    position: 'absolute',
    width: '80%',
    height: 6,
    backgroundColor: '#2D6A4F',
    borderRadius: 3,
    transform: [{ rotate: '40deg' }],
  },
  routeLineRed: {
    backgroundColor: colors.highlightRed,
  },
  originMarker: {
    position: 'absolute',
    top: 35,
    left: 45,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarkerCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  floodAvoidMarker: {
    position: 'absolute',
    top: 90,
    right: 110,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.highlightRedBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.highlightRedBorder,
  },
  destMarker: {
    position: 'absolute',
    bottom: 35,
    right: 50,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  etaCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    marginBottom: 16,
    shadowColor: '#1B2E24',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  etaMinutes: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B2E24',
  },
  etaKm: {
    fontSize: 11.5,
    color: '#52695E',
    marginTop: 2,
  },
  badgeStatusPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeStatusPillRed: {
    backgroundColor: colors.highlightRedBg,
  },
  badgeStatusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  textRed: {
    color: colors.highlightRed,
  },
  faskesMiniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F9F4',
    paddingTop: 10,
  },
  faskesSquareIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faskesMiniTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1B2E24',
  },
  faskesMiniSub: {
    fontSize: 11,
    color: '#52695E',
    marginTop: 1,
  },
  callGreenBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeOptionsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B2E24',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#52695E',
    marginTop: 2,
    marginBottom: 10,
  },
  routeSelectCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  routeSelectCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F2F9F4',
  },
  routeSelectCardActiveRed: {
    borderColor: colors.highlightRed,
    backgroundColor: colors.highlightRedBg,
  },
  routeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  recommendTag: {
    backgroundColor: '#D8F3DC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  recommendTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primary,
  },
  routeNameText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1B2E24',
  },
  routeViaText: {
    fontSize: 11,
    color: '#52695E',
    marginTop: 2,
  },
  scorePillWrap: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  scorePillBig: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  scorePillLabel: {
    fontSize: 9.5,
    color: '#52695E',
    fontWeight: '600',
  },
  routeCardBottom: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2ECE5',
    paddingTop: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    gap: 4,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B2E24',
  },
  hambatanSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  hambatanAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hambatanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  hambatanAccordionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B2E24',
    flex: 1,
  },
  hambatanExpandedContent: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E2ECE5',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
  },
  hambatanDesc: {
    fontSize: 11,
    color: '#52695E',
    marginBottom: 8,
  },
  hazardItemCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  hazardItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hazardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B2E24',
  },
  hazardTagRed: {
    backgroundColor: colors.highlightRedBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hazardTagRedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.highlightRed,
  },
  hazardSub: {
    fontSize: 11,
    color: '#52695E',
    lineHeight: 15,
  },
  btnLaporBaru: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  btnLaporBaruText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
