import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';

export default function FaskesCard({
  faskes,
  onPressDetail,
  onPressRoute,
}) {
  const isPuskesmas = faskes.jenis === 'Puskesmas';
  const isApotek = faskes.jenis === 'Apotek';
  const iconName = isPuskesmas ? 'business' : isApotek ? 'medkit' : 'fitness';

  // Ambil daftar stok obat riil dari apoteker
  const obatList = ketersediaanObatService.getSummaryObatTersedia(faskes.id);
  const isAnyHabis = obatList.some(o => o.status === 'Habis' || o.jumlah === 0);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressDetail}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        {/* Left Icon Square (Mint Green on White) */}
        <View style={styles.iconSquare}>
          <Ionicons name={iconName} size={22} color={colors.primary} />
        </View>

        {/* Faskes Name & Distance */}
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>{faskes.nama}</Text>
          <Text style={styles.subInfo} numberOfLines={1}>
            {faskes.alamat} • {faskes.jarakKm || faskes.distance || '0.8'} km
          </Text>
        </View>

        {/* Direct Route Action Icon */}
        {onPressRoute && (
          <TouchableOpacity
            style={styles.routeIconBtn}
            onPress={(e) => {
              e.stopPropagation();
              onPressRoute();
            }}
          >
            <Ionicons name="navigate-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Daftar Stok Obat Riil (Warga tahu apotek ini punya apa & berapa stoknya) */}
      <View style={styles.obatStockBox}>
        <View style={styles.obatStockTitleRow}>
          <Text style={styles.obatStockHeader}>Stok Obat Tersedia (Apoteker):</Text>
          <View style={styles.apotekerVerifiedPill}>
            <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
            <Text style={styles.apotekerVerifiedText}>Resmi</Text>
          </View>
        </View>

        <View style={styles.obatPillsRow}>
          {obatList.slice(0, 3).map((item, idx) => {
            const isHabis = item.status === 'Habis' || item.jumlah === 0;
            return (
              <View
                key={idx}
                style={[styles.obatPillItem, isHabis && styles.obatPillItemHabis]}
              >
                <Text style={[styles.obatPillName, isHabis && styles.textRed]}>
                  {item.nama.split(' ')[0]}:
                </Text>
                <Text style={[styles.obatPillQty, isHabis && styles.textRed]}>
                  {isHabis ? 'Habis' : `${item.jumlah} ${item.satuan}`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom Status Row */}
      <View style={styles.footerRow}>
        <View style={[styles.statusBadge, isAnyHabis && styles.statusBadgeWarning]}>
          <Ionicons
            name={isAnyHabis ? 'alert-circle' : 'checkmark-circle'}
            size={13}
            color={isAnyHabis ? colors.highlightRed : colors.primary}
          />
          <Text style={[styles.statusText, isAnyHabis && styles.statusTextWarning]}>
            {isAnyHabis ? 'Sebagian Stok Habis' : 'Stok Lengkap Siaga'}
          </Text>
        </View>

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#1B2E24" />
          <Text style={styles.ratingText}>{faskes.rating || '4.8'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconSquare: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1B2E24',
    marginBottom: 2,
  },
  subInfo: {
    fontSize: 11.5,
    color: '#52695E',
  },
  routeIconBtn: {
    padding: 2,
  },
  obatStockBox: {
    backgroundColor: '#F2F9F4',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2ECE5',
  },
  obatStockTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  obatStockHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#52695E',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  apotekerVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  apotekerVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  obatPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  obatPillItem: {
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
  obatPillItemHabis: {
    borderColor: colors.highlightRedBorder,
    backgroundColor: colors.highlightRedBg,
  },
  obatPillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1B2E24',
  },
  obatPillQty: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  textRed: {
    color: colors.highlightRed,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F9F4',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeWarning: {
    backgroundColor: colors.highlightRedBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  statusTextWarning: {
    color: colors.highlightRed,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1B2E24',
  },
});
