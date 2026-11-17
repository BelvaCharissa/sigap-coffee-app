import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function Badge({ label, type = 'default', size = 'medium', icon = null }) {
  let bg = colors.primaryPastel;
  let textCol = colors.primary;

  switch (type) {
    case 'Ada':
    case 'success':
    case 'Segar':
      bg = colors.stockAdaBg;
      textCol = colors.stockAda;
      break;
    case 'Habis':
    case 'danger':
    case 'IGD':
    case 'Banjir':
      bg = colors.stockHabisBg;
      textCol = colors.stockHabis;
      break;
    case 'Tidak Yakin':
    case 'warning':
    case 'Memudar':
    case 'Puskesmas':
      bg = colors.stockTidakYakinBg;
      textCol = colors.stockTidakYakin;
      break;
    case 'Rumah':
      bg = '#E8F5E9';
      textCol = '#2E7D32';
      break;
    case 'Mitra':
      bg = '#E0F2F1';
      textCol = '#00796B';
      break;
    case 'info':
    case 'blue':
      bg = '#E1F5FE';
      textCol = '#0288D1';
      break;
    default:
      bg = colors.primaryPastel;
      textCol = colors.primary;
  }

  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSmall]}>
      {icon}
      <Text style={[styles.text, { color: textCol }, isSmall && styles.textSmall]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '600',
  },
});
