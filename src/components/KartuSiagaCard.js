import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Badge from './Badge';

export default function KartuSiagaCard({ kartu, isCompact = false }) {
  const [expanded, setExpanded] = useState(!isCompact);

  let urgencyType = 'Rumah';
  let urgencyBg = colors.urgensiRumahBg;
  let urgencyColor = colors.urgensiRumah;
  let urgencyLabel = 'Perawatan di Rumah';

  if (kartu.tingkatUrgensi === 'IGD') {
    urgencyType = 'IGD';
    urgencyBg = colors.urgensiIGDBg;
    urgencyColor = colors.urgensiIGD;
    urgencyLabel = 'SEGERA KE IGD / RS';
  } else if (kartu.tingkatUrgensi === 'PUSKESMAS') {
    urgencyType = 'Puskesmas';
    urgencyBg = colors.urgensiPuskesmasBg;
    urgencyColor = colors.urgensiPuskesmas;
    urgencyLabel = 'Kunjungi Puskesmas / Klinik';
  }

  return (
    <View style={[styles.card, { borderLeftColor: urgencyColor, borderLeftWidth: 4 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Badge label={urgencyLabel} type={urgencyType} size="small" />
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          <Ionicons
            name={expanded ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{kartu.judul}</Text>

      {/* Tanda Bahaya Singkat */}
      <View style={styles.warningBox}>
        <View style={styles.warningHeader}>
          <Ionicons name="alert-circle" size={15} color={urgencyColor} />
          <Text style={[styles.warningTitle, { color: urgencyColor }]}>
            Tanda Bahaya yang Perlu Diwaspadai:
          </Text>
        </View>
        {(expanded ? kartu.tandaBahaya : kartu.tandaBahaya.slice(0, 2)).map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: urgencyColor }]}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {expanded && (
        <>
          {/* Tindakan Awal */}
          <View style={styles.actionBox}>
            <View style={styles.actionHeader}>
              <Ionicons name="medkit-outline" size={15} color={colors.primary} />
              <Text style={styles.actionTitle}>Pertolongan Awal Mandiri:</Text>
            </View>
            {kartu.tindakanAwal.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.greenBullet}>✓</Text>
                <Text style={styles.actionText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Kapan ke Faskes */}
          <View style={styles.callout}>
            <Ionicons name="information-circle" size={16} color={colors.primary} />
            <Text style={styles.calloutText}>{kartu.kapanKeFaskes}</Text>
          </View>

          {/* Rujukan & Tanggal Tinjau (DDD Invariant Bab V.5) */}
          <View style={styles.footer}>
            <View style={styles.metaRow}>
              <Ionicons name="book-outline" size={12} color={colors.textTertiary} />
              <Text style={styles.footerText} numberOfLines={1}>
                {kartu.sumberRujukan}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
              <Text style={styles.footerText}>Ditinjau: {kartu.tanggalTinjau}</Text>
            </View>
            <Text style={styles.disclaimerText}>⚠️ {kartu.disclaimer}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: '#FFF9F7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  greenBullet: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 6,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12,
    color: '#4A2A20',
    lineHeight: 18,
    flex: 1,
  },
  actionBox: {
    backgroundColor: colors.primarySubtle,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    flex: 1,
  },
  callout: {
    flexDirection: 'row',
    backgroundColor: '#EBF6EE',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  calloutText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    lineHeight: 17,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 10.5,
    color: colors.textTertiary,
    flex: 1,
  },
  disclaimerText: {
    fontSize: 9.5,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 3,
    lineHeight: 14,
  },
});
