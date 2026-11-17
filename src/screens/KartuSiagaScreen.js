import React, { useState } from 'react';
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
import { pemilihKartuService } from '../contexts/panduan-siaga/domain/PemilihKartu';
import KartuSiagaCard from '../components/KartuSiagaCard';

const urgencyTabs = [
  { key: 'Semua', label: 'Semua' },
  { key: 'RUMAH', label: '🏠 Mandiri Rumah' },
  { key: 'PUSKESMAS', label: '🏥 Puskesmas' },
  { key: 'IGD', label: '🚨 Gawat Darurat (IGD)' },
];

export default function KartuSiagaScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('Semua');

  const kartuList = pemilihKartuService.pilihBerdasarkanKeluhan(
    searchQuery,
    selectedUrgency
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Kartu Siaga Kesehatan</Text>
        <Text style={styles.subTitle}>
          Edukasi & Triage Cepat: Kapan cukup di rumah, faskes, atau harus ke IGD
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari keluhan (demam, diare, sesak, DBD)..."
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

      {/* Urgency Filter Tabs */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={urgencyTabs}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterListContainer}
          renderItem={({ item }) => {
            const isSelected = selectedUrgency === item.key;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedUrgency(item.key)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Mandatory Medical Disclaimer Banner (DDD Invariant Bab V.5) */}
      <View style={styles.disclaimerBanner}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={styles.disclaimerText}>
          Semua kartu bersumber dari rujukan resmi Kemenkes RI, WHO, dan Organisasi Profesi Dokter Indonesia.
        </Text>
      </View>

      {/* Kartu Siaga Cards List */}
      <FlatList
        data={kartuList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <KartuSiagaCard
            kartu={item}
            isCompact={false}
            onPress={() => navigation.navigate('KartuDetail', { kartu: item })}
          />
        )}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
    lineHeight: 16,
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
    marginVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    padding: 0,
  },
  filterSection: {
    paddingBottom: 6,
  },
  filterListContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primaryPastel,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 8,
    borderRadius: 10,
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.primary,
    flex: 1,
    lineHeight: 15,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },
});
