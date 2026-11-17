import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function FreshnessTag({ kesegaran, hasConflict = false }) {
  let dotColor = colors.freshSegar;
  let label = 'Data Segar (<24 jam)';
  let bg = colors.freshSegarBg;

  if (kesegaran?.includes('Memudar')) {
    dotColor = colors.freshMemudar;
    label = 'Data Memudar (24-72 jam)';
    bg = colors.freshMemudarBg;
  } else if (kesegaran?.includes('Kedaluwarsa')) {
    dotColor = colors.freshKedaluwarsa;
    label = 'Perlu Verifikasi (>72 jam)';
    bg = colors.freshKedaluwarsaBg;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.tag, { backgroundColor: bg }]}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={[styles.label, { color: dotColor }]}>{label}</Text>
      </View>
      {hasConflict && (
        <View style={styles.conflictTag}>
          <Text style={styles.conflictText}>⚠️ Ada laporan berbeda</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  conflictTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  conflictText: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: '600',
  },
});
