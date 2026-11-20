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
import { ApiService } from '../services/ApiService';
import FaskesCard from '../components/FaskesCard';
import ModalLaporStok from '../components/ModalLaporStok';

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [weather, setWeather] = useState(kondisiJalanService.getCuacaSnapshot());
  const [faskesList, setFaskesList] = useState([]);
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
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenLapor = (faskes) => {
    setSelectedFaskesForLapor(faskes);
    setModalLaporVisible(true);
  };

  // Filter faskes based on Category and Search Query
  const filteredFaskes = faskesList.filter((f) => {
    const matchCat =
      selectedCategory === 'Semua' ||
      f.jenis === selectedCategory ||
      (selectedCategory === 'Rumah Sakit' && (f.jenis === 'Rumah Sakit' || f.nama.includes('IGD')));
    const matchSearch =
      !searchQuery.trim() ||
      f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header Row matching Reference Screenshot */}
        <View style={styles.topHeader}>
          <View style={styles.userLocationRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {currentUser?.nama ? currentUser.nama.charAt(0) : 'I'}
              </Text>
            </View>
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationSubText}>LOKASI ANDA</Text>
              <View style={styles.locationMainRow}>
                <Ionicons name="location-sharp" size={13} color={colors.primary} />
                <Text style={styles.locationMainText}>Dago, Bandung</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Profil')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={19} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Clean Pill Search Bar with Filter Icon */}
        <View style={styles.searchSection}>
          <View style={styles.searchPill}>
            <Ionicons name="search" size={17} color={colors.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Paracetamol"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => navigation.navigate('Faskes')}
              style={styles.filterBtn}
            >
              <Ionicons name="options-outline" size={17} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Iklan Edukatif Siaga (Sisi Edukasi Kesehatan & Bencana) */}
        <TouchableOpacity
          style={styles.eduBannerCard}
          onPress={() => navigation.navigate('Edukasi')}
          activeOpacity={0.9}
        >
          <View style={styles.eduBadgeRow}>
            <View style={styles.eduBadge}>
              <Ionicons name="bulb-outline" size={12} color={colors.primary} />
              <Text style={styles.eduBadgeText}>EDUKASI SIAGA KESEHATAN</Text>
            </View>
            <Ionicons name="book-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.eduTitle}>
            Kapan Cukup Rawat di Rumah vs Kapan Harus ke IGD?
          </Text>
          <Text style={styles.eduDesc}>
            Demam anak &lt; 38.5°C cukup kompres &amp; paracetamol. Kenali tanda bahaya darurat cuaca ekstrem sebelum panik.
          </Text>
          <View style={styles.eduActionRow}>
            <Text style={styles.eduActionText}>Buka Panduan Kartu Siaga</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Horizontal Category Chips */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {[
              { id: 'Semua', label: 'Semua', icon: 'apps' },
              { id: 'Puskesmas', label: 'Puskesmas', icon: 'business' },
              { id: 'Apotek', label: 'Apotek', icon: 'medkit' },
              { id: 'Rumah Sakit', label: 'IGD 24 Jam', icon: 'shield-half' },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catChip}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIconCircle, active && styles.catIconCircleActive]}>
                    <Ionicons
                      name={cat.icon}
                      size={18}
                      color={active ? '#FFFFFF' : colors.primary}
                    />
                  </View>
                  <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Weather Alert Banner Card (Open-Meteo Live) */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherBadge}>
            <Ionicons name="cloud-outline" size={11} color="#FFFFFF" />
            <Text style={styles.weatherBadgeText}>OPEN-METEO LIVE</Text>
          </View>

          <Text style={styles.weatherTitle}>
            {weather.kondisi || 'Hujan Sedang'} ({weather.curahHujanMm || 12.5} mm)
          </Text>

          <Text style={styles.weatherSubtitle}>
            Waspada 2 titik genangan di Simpang Dago. Jalur alternatif aktif.
          </Text>

          <TouchableOpacity
            style={styles.btnRouteWhite}
            onPress={() => navigation.navigate('Rute')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnRouteWhiteText}>Cari Rute Aman</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Section: Fasilitas Terdekat (Clean & Concise) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fasilitas Terdekat</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Faskes')}>
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Faskes Clean Cards List */}
        <View style={styles.faskesListWrap}>
          {filteredFaskes.map((f) => {
            const stokInfo = ketersediaanObatService.getStokFaskes(f.id, 'obat_1');
            return (
              <FaskesCard
                key={f.id}
                faskes={f}
                stokInfo={stokInfo}
                onPressDetail={() => navigation.navigate('FaskesDetail', { faskes: f })}
                onPressRoute={() => navigation.navigate('Rute', { targetFaskes: f })}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Modal Lapor Stok */}
      <ModalLaporStok
        visible={modalLaporVisible}
        onClose={() => setModalLaporVisible(false)}
        faskes={selectedFaskesForLapor}
        obat={ketersediaanObatService.getObatById('obat_1')}
        onSuccess={loadData}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  userLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7EBD1',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  locationTextWrap: {
    justifyContent: 'center',
  },
  locationSubText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#889C91',
    letterSpacing: 0.6,
  },
  locationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  locationMainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B2E24',
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1B2E24',
    paddingVertical: 0,
  },
  filterBtn: {
    padding: 4,
    marginLeft: 6,
  },
  eduBannerCard: {
    marginHorizontal: 20,
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  eduBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eduBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eduBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  eduTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1B2E24',
    marginBottom: 4,
    lineHeight: 18,
  },
  eduDesc: {
    fontSize: 11.5,
    color: '#52695E',
    lineHeight: 16,
    marginBottom: 8,
  },
  eduActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eduActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  catChip: {
    alignItems: 'center',
    gap: 6,
  },
  catIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52695E',
  },
  catLabelActive: {
    color: colors.primary,
  },
  weatherCard: {
    marginHorizontal: 20,
    backgroundColor: '#2D6A4F',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 8,
  },
  weatherBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  weatherTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  weatherSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 16,
    marginBottom: 12,
  },
  btnRouteWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  btnRouteWhiteText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B2E24',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  faskesListWrap: {
    paddingHorizontal: 20,
  },
});
