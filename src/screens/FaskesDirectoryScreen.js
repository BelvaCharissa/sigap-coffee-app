import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { direktoriFaskesService } from '../contexts/direktori-faskes/application/DirektoriFaskesService';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';
import FaskesCard from '../components/FaskesCard';
import ModalLaporStok from '../components/ModalLaporStok';
import ModalTambahFaskes from '../components/ModalTambahFaskes';

const categories = ['Semua', 'Apotek', 'Klinik', 'Puskesmas', 'Rumah Sakit'];

export default function FaskesDirectoryScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [katalogObat, setKatalogObat] = useState(ketersediaanObatService.getKatalog());
  const [selectedObat, setSelectedObat] = useState(katalogObat[0]); // Default Paracetamol Sirup
  const [faskesData, setFaskesData] = useState([]);

  // Modals
  const [modalLaporVisible, setModalLaporVisible] = useState(false);
  const [selectedFaskesForLapor, setSelectedFaskesForLapor] = useState(null);
  const [modalTambahVisible, setModalTambahVisible] = useState(false);

  const refreshFaskesList = () => {
    const list = direktoriFaskesService.search(searchQuery, selectedCategory);
    setFaskesData(list);
  };

  useEffect(() => {
    refreshFaskesList();
  }, [searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Direktori & Stok Faskes</Text>
          <Text style={styles.subTitle}>Cari apotek & faskes yang sedia obatmu</Text>
        </View>
        {currentUser?.role === 'Admin' ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalTambahVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Tambah Faskes</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama faskes atau alamat..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Medicine Selector Carousel (Pilih obat yang ingin dipantau ketersediaannya) */}
      <View style={styles.obatFilterSection}>
        <Text style={styles.filterSectionTitle}>Pilih Obat yang Dicari:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={katalogObat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.obatListContainer}
          renderItem={({ item }) => {
            const isSelected = selectedObat?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.obatPill, isSelected && styles.obatPillActive]}
                onPress={() => setSelectedObat(item)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'medkit-outline'}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.primary}
                />
                <Text style={[styles.obatPillText, isSelected && styles.obatPillTextActive]}>
                  {item.nama}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoryFilterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryListContainer}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Faskes List */}
      <FlatList
        data={faskesData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>Tidak ada faskes ditemukan</Text>
            <Text style={styles.emptySub}>
              Coba gunakan kata kunci lain atau tambahkan faskes baru secara manual.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const stokInfo = ketersediaanObatService.getStokFaskes(item.id, selectedObat.id);
          return (
            <FaskesCard
              faskes={item}
              stokInfo={stokInfo}
              selectedObatName={selectedObat?.nama}
              onPressDetail={() => {
                navigation.navigate('FaskesDetail', { faskes: item });
              }}
              onPressRoute={() => {
                navigation.navigate('Rute', { targetFaskes: item });
              }}
            />
          );
        }}
      />

      {/* Modal Lapor Stok */}
      <ModalLaporStok
        visible={modalLaporVisible}
        onClose={() => setModalLaporVisible(false)}
        faskes={selectedFaskesForLapor}
        obat={selectedObat}
        onSuccess={refreshFaskesList}
      />

      {/* Modal Tambah Faskes */}
      <ModalTambahFaskes
        visible={modalTambahVisible}
        onClose={() => setModalTambahVisible(false)}
        onSuccess={refreshFaskesList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  obatFilterSection: {
    paddingVertical: 4,
  },
  filterSectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 16,
    marginBottom: 6,
  },
  obatListContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  obatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.primaryPastel,
  },
  obatPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  obatPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  obatPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryFilterSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  categoryListContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  categoryChipActive: {
    backgroundColor: colors.primaryPastel,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
