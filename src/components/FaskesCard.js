import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function FaskesCard({
  faskes,
  stokInfo,
  onPressDetail,
  onPressRoute,
}) {
  const isAvailable = stokInfo?.status !== 'Habis';
  const isPuskesmas = faskes.jenis === 'Puskesmas';
  const isApotek = faskes.jenis === 'Apotek';

  // Icon and icon background based on faskes type
  const iconName = isPuskesmas ? 'business' : isApotek ? 'medkit' : 'fitness';
  const iconBg = isApotek ? '#E1F5FE' : '#D8F3DC';
  const iconColor = isApotek ? '#0288D1' : '#2D6A4F';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressDetail}
      activeOpacity={0.85}
    >
      {/* Left Icon Square */}
      <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      {/* Right Details (Clean, no unnecessary text) */}
      <View style={styles.infoCol}>
        <Text style={styles.name} numberOfLines={1}>{faskes.nama}</Text>
        <Text style={styles.address} numberOfLines={1}>
          {faskes.alamat} • {faskes.jarakKm || faskes.distance || '0.8'} km
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.stockPill, !isAvailable && styles.stockPillHabis]}>
            <Ionicons
              name={isAvailable ? 'checkmark-sharp' : 'close-sharp'}
              size={12}
              color={isAvailable ? '#2E7D32' : '#C62828'}
            />
            <Text style={[styles.stockText, !isAvailable && styles.stockTextHabis]}>
              {isAvailable ? 'Stok Ada' : 'Stok Habis'}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{faskes.rating || '4.8'}</Text>
          </View>

          {onPressRoute ? (
            <TouchableOpacity
              style={styles.quickRouteBtn}
              onPress={(e) => {
                e.stopPropagation();
                onPressRoute();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="navigate-circle" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#1B2E24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconSquare: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#1B2E24',
    marginBottom: 3,
  },
  address: {
    fontSize: 11.5,
    color: '#52695E',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  stockPillHabis: {
    backgroundColor: '#FFEBEE',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  stockTextHabis: {
    color: '#C62828',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F59E0B',
  },
  quickRouteBtn: {
    marginLeft: 'auto',
    padding: 2,
  },
});
