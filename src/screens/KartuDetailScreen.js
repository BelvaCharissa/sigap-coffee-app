import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function KartuDetailScreen({ route, navigation }) {
  const { kartu } = route.params;

  let urgencyBg = colors.urgensiRumahBg;
  let urgencyColor = colors.urgensiRumah;
  let urgencyIcon = 'home';

  if (kartu.tingkatUrgensi === 'IGD') {
    urgencyBg = colors.urgensiIGDBg;
    urgencyColor = colors.urgensiIGD;
    urgencyIcon = 'alert-circle';
  } else if (kartu.tingkatUrgensi === 'PUSKESMAS') {
    urgencyBg = colors.urgensiPuskesmasBg;
    urgencyColor = colors.urgensiPuskesmas;
    urgencyIcon = 'medical';
  }

  const handleCallEmergency = () => {
    Linking.openURL('tel:119'); // Nomor darurat medis Indonesia
  };

  const handleCariFaskes = () => {
    navigation.navigate('MainTabs', { screen: 'Faskes' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Detail Kartu Siaga</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Urgency Header Banner */}
        <View style={[styles.urgencyBanner, { backgroundColor: urgencyBg, borderColor: urgencyColor }]}>
          <Ionicons name={urgencyIcon} size={22} color={urgencyColor} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.urgencyLabel, { color: urgencyColor }]}>
              {kartu.urgensiLabel || `Tingkat Urgensi: ${kartu.tingkatUrgensi}`}
            </Text>
            <Text style={styles.urgencySub}>
              {kartu.tingkatUrgensi === 'IGD'
                ? 'Kondisi gawat darurat yang membutuhkan intervensi medis langsung.'
                : kartu.tingkatUrgensi === 'PUSKESMAS'
                ? 'Disarankan konsultasi dan periksa lab di fasilitas kesehatan terdekat.'
                : 'Dapat dilakukan observasi dan perawatan awal mandiri di rumah.'}
            </Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>{kartu.judul}</Text>

          {/* Trigger Tags */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Pemicu Keluhan: </Text>
            {(kartu.keluhanPemicu || []).map((keluhan, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{keluhan}</Text>
              </View>
            ))}
          </View>

          {/* Isi Panduan Singkat */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionBoxHeader}>
              <Ionicons name="bulb-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionBoxTitle}>Tindakan Pertolongan Pertama</Text>
            </View>
            <Text style={styles.sectionBoxContent}>{kartu.isiSingkat}</Text>
          </View>

          {/* Tanda Bahaya (Critical Box) */}
          <View style={styles.dangerBox}>
            <View style={styles.dangerBoxHeader}>
              <Ionicons name="warning" size={18} color="#B71C1C" />
              <Text style={styles.dangerBoxTitle}>Tanda Bahaya (Red Flags) Wajib Diwaspadai</Text>
            </View>
            <Text style={styles.dangerBoxContent}>{kartu.tandaBahaya}</Text>
          </View>

          {/* Kapan Harus ke Faskes */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionBoxHeader}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionBoxTitle}>Kapan Harus Membawa ke Faskes?</Text>
            </View>
            <Text style={styles.sectionBoxContent}>{kartu.kapanHarusKeFaskes}</Text>
          </View>

          {/* Citation & Review Date (DDD Invariant Bab V.5) */}
          <View style={styles.citationBox}>
            <View style={styles.citationRow}>
              <Ionicons name="library-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.citationText}>
                <Text style={{ fontWeight: '700' }}>Rujukan Resmi: </Text>
                {kartu.sumberRujukan}
              </Text>
            </View>
            <View style={styles.citationRow}>
              <Ionicons name="calendar-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.citationText}>
                <Text style={{ fontWeight: '700' }}>Tanggal Tinjau Klinis: </Text>
                {kartu.tanggalTinjau}
              </Text>
            </View>
          </View>

          {/* Disclaimer Wajib Medis */}
          <View style={styles.disclaimerBox}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.disclaimerText}>
              <Text style={{ fontWeight: '700' }}>Disclaimer: </Text>
              {kartu.disclaimer}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {kartu.tingkatUrgensi === 'IGD' ? (
            <TouchableOpacity style={styles.emergencyBtn} onPress={handleCallEmergency} activeOpacity={0.85}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
              <Text style={styles.emergencyBtnText}>Panggil Ambulans Darurat (119)</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.faskesBtn} onPress={handleCariFaskes} activeOpacity={0.85}>
            <Ionicons name="medkit" size={18} color="#FFFFFF" />
            <Text style={styles.faskesBtnText}>Cari Faskes Terdekat yang Sedia Obat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: 36,
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
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  urgencySub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
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
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 25,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tagPill: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionBoxContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  dangerBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  dangerBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dangerBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B71C1C',
  },
  dangerBoxContent: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 19,
    fontWeight: '600',
  },
  citationBox: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 12,
    gap: 6,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  citationText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAF8',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionSection: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  emergencyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  faskesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  faskesBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
