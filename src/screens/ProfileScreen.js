import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { direktoriFaskesService } from '../contexts/direktori-faskes/application/DirektoriFaskesService';
import { ApiService } from '../services/ApiService';
import Badge from '../components/Badge';

export default function ProfileScreen({ navigation }) {
  const {
    currentUser,
    switchRole,
    semuaKlaim,
    setujuiKlaim,
    tolakKlaim,
    ajukanKlaim,
  } = useAuth();

  const [testingPeer, setTestingPeer] = useState(false);
  const [peerTestResult, setPeerTestResult] = useState(null);

  const handleTestPeerIntegrations = async () => {
    setTestingPeer(true);
    setPeerTestResult(null);

    const [jalanAmanRes, sehatDekatRes] = await Promise.all([
      ApiService.fetchPeerJalanAmanReports(),
      ApiService.fetchPeerSehatDekatQueues(),
    ]);

    setPeerTestResult({
      jalanAman: jalanAmanRes,
      sehatDekat: sehatDekatRes,
    });
    setTestingPeer(false);
  };

  const handleAjukanKlaimDemo = () => {
    const unclaimed = direktoriFaskesService.getAll().find(f => !f.isClaimed);
    if (!unclaimed) {
      Alert.alert('Info', 'Semua faskes saat ini sudah diklaim.');
      return;
    }

    try {
      ajukanKlaim(unclaimed.id, unclaimed.nama);
      Alert.alert(
        'Pengajuan Klaim Terkirim!',
        `Klaim untuk faskes "${unclaimed.nama}" telah diajukan dan menunggu persetujuan Admin.`
      );
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Akun & Manajemen Mitra</Text>
          <Text style={styles.subTitle}>
            Domain Akun & Mitra (Open Host Service DDD Bab IV & V)
          </Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name={
                currentUser.role === 'Mitra'
                  ? 'shield-checkmark'
                  : currentUser.role === 'Admin'
                  ? 'settings'
                  : 'person'
              }
              size={36}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{currentUser.nama}</Text>
            </View>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
            <Text style={styles.profileNim}>NIM: {currentUser.nim}</Text>

            <View style={styles.badgeRow}>
              <Badge label={`Peran: ${currentUser.role}`} type={currentUser.role} size="small" />
              <View style={styles.repBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.repText}>Reputasi: {currentUser.reputasi}/100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Role Switcher Demo Box */}
        <View style={styles.cardBox}>
          <View style={styles.cardBoxHeader}>
            <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
            <Text style={styles.cardBoxTitle}>Simulasi Ganti Peran (Role Switcher)</Text>
          </View>
          <Text style={styles.cardBoxSub}>
            Gunakan tombol di bawah untuk menguji alur hak akses Warga, Mitra Terverifikasi, dan Admin saat demo:
          </Text>
          <View style={styles.roleBtnRow}>
            {['warga', 'mitra', 'admin'].map(rKey => {
              const active = currentUser.role.toLowerCase() === rKey;
              return (
                <TouchableOpacity
                  key={rKey}
                  style={[styles.roleSelectBtn, active && styles.roleSelectBtnActive]}
                  onPress={() => switchRole(rKey)}
                >
                  <Text style={[styles.roleSelectText, active && styles.roleSelectTextActive]}>
                    {rKey.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section Klaim Faskes */}
        <View style={styles.cardBox}>
          <View style={styles.cardBoxHeader}>
            <Ionicons name="business-outline" size={18} color={colors.primary} />
            <Text style={styles.cardBoxTitle}>Status Klaim Faskes Mitra</Text>
          </View>

          {currentUser.role === 'Warga' && (
            <View>
              <Text style={styles.cardBoxSub}>
                Sebagai pemilik atau penanggung jawab faskes, Anda dapat mengklaim faskes untuk mengelola stok secara resmi.
              </Text>
              <TouchableOpacity
                style={styles.claimActionBtn}
                onPress={handleAjukanKlaimDemo}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.claimActionBtnText}>Ajukan Klaim Faskes</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentUser.role === 'Mitra' && (
            <View style={styles.mitraInfoBox}>
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mitraInfoTitle}>Faskes yang Dikelola:</Text>
                <Text style={styles.mitraInfoDesc}>{currentUser.namaFaskesKlaim}</Text>
                <Text style={styles.mitraInfoBadge}>
                  ✓ Hak istimewa: Laporan stok Mitra otomatis terverifikasi & mengesampingkan laporan biasa.
                </Text>
              </View>
            </View>
          )}

          {/* Daftar Klaim & Aksi Admin */}
          <Text style={[styles.cardBoxSub, { marginTop: 12, fontWeight: '700' }]}>
            Daftar Pengajuan Klaim ({semuaKlaim.length}):
          </Text>
          {semuaKlaim.map(k => (
            <View key={k.id} style={styles.claimItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.claimItemFaskes}>{k.namaFaskes}</Text>
                <Text style={styles.claimItemPemohon}>
                  Pemohon: {k.pemohonNama} • {k.tanggal}
                </Text>
                <Badge
                  label={k.status}
                  type={k.status === 'Disetujui' ? 'success' : k.status === 'Ditolak' ? 'danger' : 'warning'}
                  size="small"
                />
              </View>

              {currentUser.role === 'Admin' && k.status === 'Menunggu Verifikasi Admin' && (
                <View style={styles.adminActionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => setujuiKlaim(k.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => tolakKlaim(k.id)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Hub Integrasi API Lintas Kelompok (TST x PWAM Deliverable #3) */}
        <View style={styles.cardBox}>
          <View style={styles.cardBoxHeader}>
            <Ionicons name="git-network-outline" size={18} color={colors.primary} />
            <Text style={styles.cardBoxTitle}>Hub Integrasi API (TST × PWAM)</Text>
          </View>
          <Text style={styles.cardBoxSub}>
            Memanggil API microservice sendiri + API ≥ 2 kelompok lain dengan circuit breaker & fallback tahan gangguan (Slide 14 & 22).
          </Text>

          <TouchableOpacity
            style={styles.testApiBtn}
            onPress={handleTestPeerIntegrations}
            disabled={testingPeer}
            activeOpacity={0.8}
          >
            {testingPeer ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.testApiBtnText}>Uji Koneksi API Kelompok Lain</Text>
              </>
            )}
          </TouchableOpacity>

          {peerTestResult && (
            <View style={styles.peerResultBox}>
              <Text style={styles.peerResultHeading}>Hasil Uji Integrasi Lintas Kelompok:</Text>

              {/* Kelompok 1: JalanAman */}
              <View style={styles.peerItem}>
                <View style={styles.peerHeader}>
                  <Text style={styles.peerName}>1. JalanAman (Smart City - K01)</Text>
                  <Badge label={peerTestResult.jalanAman.status} type="info" size="small" />
                </View>
                <Text style={styles.peerUrl}>Endpoint: https://jalanaman.stei.fun/api</Text>
                <Text style={styles.peerDataText}>
                  Data Banjir: {peerTestResult.jalanAman.data?.length || 0} laporan terintegrasi
                </Text>
              </View>

              {/* Kelompok 2: SehatDekat */}
              <View style={styles.peerItem}>
                <View style={styles.peerHeader}>
                  <Text style={styles.peerName}>2. SehatDekat (Health - K02)</Text>
                  <Badge label={peerTestResult.sehatDekat.status} type="info" size="small" />
                </View>
                <Text style={styles.peerUrl}>Endpoint: https://sehatdekat.stei.site/api</Text>
                <Text style={styles.peerDataText}>
                  Data Antrean: {peerTestResult.sehatDekat.data?.length || 0} faskes terhubung
                </Text>
              </View>

              <Text style={styles.peerNote}>
                ✓ Ketahanan gangguan terverifikasi: saat jaringan lambat atau offline, sistem otomatis memakai fallback cache sehingga aplikasi tidak crash.
              </Text>
            </View>
          )}
        </View>

        {/* Tim Penyusun */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>SIGAP (Sehat, Informasi, Gerak, Akses, Pertolongan)</Text>
          <Text style={styles.aboutDesc}>
            Tugas Besar Terintegrasi II3160 TST & II3140 PWAM STEI ITB 2026{'\n'}
            • Indah Ramadhani (18224037) - Backend & Bisnis{'\n'}
            • Belva Charissa P H (18224051) - Mobile Developer
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
    backgroundColor: colors.background,
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
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileNim: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  repBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  repText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardBoxSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  roleBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleSelectBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  roleSelectTextActive: {
    color: '#FFFFFF',
  },
  claimActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  claimActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mitraInfoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primarySubtle,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
  },
  mitraInfoTitle: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mitraInfoDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  mitraInfoBadge: {
    fontSize: 11,
    color: colors.primaryLight,
    marginTop: 3,
  },
  claimItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  claimItemFaskes: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  claimItemPemohon: {
    fontSize: 11,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  approveBtn: {
    backgroundColor: colors.stockAda,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: colors.stockHabis,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testApiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
  },
  testApiBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  peerResultBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  peerResultHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  peerItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  peerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  peerUrl: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  peerDataText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  peerNote: {
    fontSize: 11,
    color: colors.stockAda,
    lineHeight: 15,
    marginTop: 4,
  },
  aboutCard: {
    marginHorizontal: 16,
    padding: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  aboutDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
