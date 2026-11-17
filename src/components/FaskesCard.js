import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Badge from './Badge';
import FreshnessTag from './FreshnessTag';

export default function FaskesCard({
  faskes,
  stokInfo,
  selectedObatName,
  onPressDetail,
  onPressRoute,
}) {
  const isAvailable = stokInfo?.status === 'Ada';
  const isOutOfStock = stokInfo?.status === 'Habis';

  return (
    <View style={styles.card}>
      {/* Header bar: Jenis & Jarak */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{faskes.jenis}</Text>
        </View>
        <View style={styles.distanceRow}>
          <Ionicons name="navigate-outline" size={14} color={colors.primary} />
          <Text style={styles.distanceText}>{faskes.jarakKm} km</Text>
        </View>
      </View>

      {/* Nama Faskes & Verifikasi */}
      <View style={styles.titleRow}>
        <Text style={styles.name}>{faskes.nama}</Text>
        {faskes.isClaimed && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.verifiedText}>Mitra</Text>
          </View>
        )}
      </View>

      <Text style={styles.address} numberOfLines={1}>
        {faskes.alamat}
      </Text>

      {/* Info Jam Buka */}
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
        <Text style={styles.metaText}>{faskes.jamBuka}</Text>
        {faskes.telepon ? (
          <>
            <Text style={styles.metaDot}>•</Text>
            <Ionicons name="call-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.metaText}>{faskes.telepon}</Text>
          </>
        ) : null}
      </View>

      {/* Status Stok Obat */}
      <View style={styles.stockSection}>
        <View style={styles.stockStatusHeader}>
          <Text style={styles.stockLabel}>
            Stok {selectedObatName ? selectedObatName : 'Obat'}:
          </Text>
          <Badge
            label={stokInfo?.status || 'Tersedia'}
            type={stokInfo?.status || 'Ada'}
            size="small"
          />
        </View>

        {stokInfo?.kesegaran && (
          <FreshnessTag
            kesegaran={stokInfo.kesegaran}
            hasConflict={stokInfo.hasConflict}
          />
        )}
      </View>

      {/* Actions */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={onPressDetail}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={styles.detailButtonText}>Detail & Lapor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.routeButton}
          onPress={onPressRoute}
          activeOpacity={0.8}
        >
          <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.routeButtonText}>Cek Rute Aman</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.primaryPastel,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF6EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  address: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  stockSection: {
    backgroundColor: colors.primarySubtle,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  stockStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.primaryPastel,
    gap: 5,
  },
  detailButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  routeButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 5,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
