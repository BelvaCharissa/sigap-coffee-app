import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { direktoriFaskesService } from '../contexts/direktori-faskes/application/DirektoriFaskesService';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';
import { kondisiJalanService } from '../contexts/kondisi-jalan/application/KondisiJalanService';
import { pemilihKartuService } from '../contexts/panduan-siaga/domain/PemilihKartu';
import { ApiService } from '../services/ApiService';
import FaskesCard from '../components/FaskesCard';
import KartuSiagaCard from '../components/KartuSiagaCard';
import ModalLaporStok from '../components/ModalLaporStok';

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [weather, setWeather] = useState(kondisiJalanService.getCuacaSnapshot());
  const [faskesList, setFaskesList] = useState([]);
  const [kartuRekomendasi, setKartuRekomendasi] = useState([]);
  const [selectedObat, setSelectedObat] = useState(ketersediaanObatService.getObatById('obat_1')); // Paracetamol
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalLaporVisible, setModalLaporVisible] = useState(false);
  const [selectedFaskesForLapor, setSelectedFaskesForLapor] = useState(null);

  const loadData = async () => {
    // 1. Fetch live weather or cache
    const liveWeather = await ApiService.fetchLiveWeather(-6.89, 107.61);
    if (liveWeather) {
      kondisiJalanService.setCuacaSnapshot(liveWeather);
      setWeather(liveWeather);
    }

    // 2. Load faskes list
    const faskes = direktoriFaskesService.getAll();
    setFaskesList(faskes);

    // 3. Load recommended cards based on weather/complaint
    const cards = pemilihKartuService.pilihKartuCuaca(liveWeather?.kondisi || 'Hujan');
    setKartuRekomendasi(cards);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Skenario Demo Instan (PRD Bab 5 & Bab 12.3)
  const triggerDemoScenario = () => {
    setSearchQuery('demam anak');
    const paracetamol = ketersediaanObatService.getObatById('obat_1');
    setSelectedObat(paracetamol);
    const relatedCards = pemilihKartuService.pilihBerdasarkanKeluhan('demam anak');
    setKartuRekomendasi(relatedCards);
  };

  const handleOpenLapor = (faskes) => {
    setSelectedFaskesForLapor(faskes);
    setModalLaporVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EBF6EE" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Top Header Card */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Halo, {currentUser.nama.split(' ')[0]} 👋</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color={colors.primary} />
                <Text style={styles.locationText}>Dago & Coblong, Bandung</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => navigation.navigate('Profil')}
              activeOpacity={0.8}
            >
              <Text style={styles.profileRoleText}>{currentUser.role}</Text>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Weather & Hazard Alert Banner (PRD 7.4 / Open-Meteo) */}
          <TouchableOpacity
            style={styles.weatherBanner}
            onPress={() => navigation.navigate('Rute')}
            activeOpacity={0.85}
          >
            <View style={styles.weatherIconContainer}>
              <Ionicons
                name={weather.curahHujanMm > 5 ? 'rainy' : 'partly-sunny'}
                size={26}
                color={colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.weatherTitleRow}>
                <Text style={styles.weatherCondition}>{weather.kondisi}</Text>
                <Text style={styles.weatherTemp}>{weather.suhu}°C</Text>
              </View>
              <Text style={styles.weatherSub}>
                Hujan: {weather.curahHujanMm} mm/jam • Kelembaban: {weather.kelembaban}%
              </Text>
              <Text style={styles.weatherRouteHint}>
                🛡️ Ada 2 titik genangan air aktif di jalur utama. Ketuk untuk cek rute aman.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primaryMuted} />
          </TouchableOpacity>

          {/* Quick Demo Scenario Pill */}
          <TouchableOpacity
            style={styles.demoScenarioPill}
            onPress={triggerDemoScenario}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={15} color="#D97706" />
            <Text style={styles.demoScenarioText}>
              Skenario Demo PRD: "Hujan Deras + Anak Demam"
            </Text>
          </TouchableOpacity>

          {/* Search Box */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari obat (paracetamol, oralit) atau keluhan..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={(txt) => {
                setSearchQuery(txt);
                if (txt.trim()) {
                  const matched = pemilihKartuService.pilihBerdasarkanKeluhan(txt);
                  if (matched.length > 0) setKartuRekomendasi(matched);
                }
              }}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Quick Menu Icons (CareSync / Reference Inspiration) */}
        <View style={styles.quickNavSection}>
          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Faskes')}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="medkit" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickNavLabel}>Cari Obat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Faskes')}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#E0F2F1' }]}>
              <Ionicons name="business" size={22} color="#00796B" />
            </View>
            <Text style={styles.quickNavLabel}>Faskes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Rute')}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="navigate" size={22} color="#0288D1" />
            </View>
            <Text style={styles.quickNavLabel}>Rute Aman</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavItem}
            onPress={() => navigation.navigate('Edukasi')}
          >
            <View style={[styles.quickNavIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="shield-half" size={22} color="#E65100" />
            </View>
            <Text style={styles.quickNavLabel}>Kartu Siaga</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Strip (Matches Reference Mockup) */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Kategori Faskes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {[
              { id: 'Semua', label: 'Semua', icon: 'apps' },
              { id: 'Puskesmas', label: 'Puskesmas', icon: 'business' },
              { id: 'Apotek', label: 'Apotek', icon: 'medkit' },
              { id: 'Rumah Sakit', label: 'Rumah Sakit', icon: 'fitness' },
              { id: 'Klinik', label: 'Klinik', icon: 'bandage' },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
                    <Ionicons name={cat.icon} size={18} color={active ? '#FFFFFF' : colors.primary} />
                  </View>
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section: Kartu Siaga Penting (Triage Edukasi Sesuai Keluhan) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Kartu Siaga Edukasi</Text>
            <Text style={styles.sectionSub}>Kapan cukup di rumah, ke puskesmas, atau ke IGD</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Edukasi')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardListContainer}>
          {kartuRekomendasi.slice(0, 2).map((k) => (
            <KartuSiagaCard
              key={k.id}
              kartu={k}
              isCompact={false}
              onPress={() => navigation.navigate('KartuDetail', { kartu: k })}
            />
          ))}
        </View>

        {/* Section: Ketersediaan Obat Terdekat (PRD Bab 5.3) */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Ketersediaan {selectedObat?.nama || 'Obat'}</Text>
            <Text style={styles.sectionSub}>Status stok faskes terdekat dengan label kesegaran</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Faskes')}>
            <Text style={styles.seeAllText}>Semua Faskes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardListContainer}>
          {(selectedCategory === 'Semua' ? faskesList : faskesList.filter(f => f.jenis === selectedCategory)).slice(0, 4).map((f) => {
            const stokInfo = ketersediaanObatService.getStokFaskes(f.id, selectedObat?.id || 'obat_1');
            return (
              <FaskesCard
                key={f.id}
                faskes={f}
                stokInfo={stokInfo}
                selectedObatName={selectedObat?.nama}
                onPressDetail={() => navigation.navigate('FaskesDetail', { faskes: f })}
                onPressRoute={() => {
                  navigation.navigate('Rute', { targetFaskes: f });
                }}
              />
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Lapor Stok */}
      <ModalLaporStok
        visible={modalLaporVisible}
        onClose={() => setModalLaporVisible(false)}
        faskes={selectedFaskesForLapor}
        obat={selectedObat}
        onSuccess={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF6EE',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#EBF6EE',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primaryPastel,
    gap: 6,
  },
  profileRoleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  weatherIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  weatherTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  weatherCondition: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  weatherSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weatherRouteHint: {
    fontSize: 10.5,
    color: colors.primaryLight,
    fontWeight: '600',
    marginTop: 4,
  },
  demoScenarioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  demoScenarioText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  quickNavSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickNavItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickNavIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickNavLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
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
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cardListContainer: {
    paddingHorizontal: 16,
  },
  categoriesSection: {
    paddingVertical: 10,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minWidth: 70,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryPastel,
    borderColor: colors.primary,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIconWrapActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.primary,
  },
});
