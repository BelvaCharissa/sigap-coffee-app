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
import { ApiService } from '../services/ApiService';

export default function ProfileScreen({ navigation }) {
  const { currentUser, switchRole, logout } = useAuth();
  const [testingPeer, setTestingPeer] = useState(false);

  const handleTestPeer = async () => {
    setTestingPeer(true);
    const [ja, sd] = await Promise.all([
      ApiService.fetchPeerJalanAmanReports(),
      ApiService.fetchPeerSehatDekatQueues(),
    ]);
    setTestingPeer(false);
    Alert.alert(
      'Integrasi Peer Kelompok (TST × PWAM)',
      `1. JalanAman (K01): ${ja.status}\n2. SehatDekat (K02): ${sd.status}\n\nFallback offline & circuit-breaker aktif!`
    );
  };

  const handleCheckSTB = async () => {
    const res = await ApiService.checkHealth();
    Alert.alert(
      res.isLive ? 'Server STB Online!' : 'Mode Siaga Mandiri',
      `URL: ${ApiService.getBaseUrl()}\nStatus: ${res.isLive ? 'HTTP 200 OK (JWT Aktif)' : 'Offline Cache Aktif'}`
    );
  };

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Landing' }],
          });
        },
      },
    ]);
  };

  const handleSwitchRoleModal = () => {
    const newRole = currentUser.role === 'Warga' ? 'Mitra' : 'Warga';
    switchRole(newRole.toLowerCase());
    Alert.alert('Peran Berubah', `Peran Anda sekarang: ${newRole}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero Card (Exact match with screenshot) */}
        <View style={styles.heroCard}>
          <View style={styles.avatarCircleBig}>
            <Text style={styles.avatarInitials}>
              {currentUser?.nama
                ? currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('')
                : 'IR'}
            </Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{currentUser?.nama || 'Indah Ramadhani'}</Text>
            <Text style={styles.heroEmail}>
              {currentUser?.email || 'indah@sigap.id'} • NIM {currentUser?.nim || '18224037'}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                {currentUser?.role === 'Mitra' ? 'Mitra Faskes Terverifikasi' : 'Warga Siaga Terverifikasi'}
              </Text>
            </View>
          </View>
        </View>

        {/* Clean Menu List (Matches screenshot) */}
        <View style={styles.menuContainer}>
          {/* Menu 1: Kelola Profil Akun */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSwitchRoleModal}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="person-circle-outline" size={19} color="#2E7D32" />
              </View>
              <Text style={styles.menuTitle}>Kelola Profil Akun (Ganti Role)</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#889C91" />
          </TouchableOpacity>

          {/* Menu 2: Riwayat Laporan Stok */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Riwayat Laporan', 'Semua riwayat laporan stok Anda telah terverifikasi secara realtime.')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#E1F5FE' }]}>
                <Ionicons name="time-outline" size={19} color="#0288D1" />
              </View>
              <Text style={styles.menuTitle}>Riwayat Laporan Stok</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#889C91" />
          </TouchableOpacity>

          {/* Menu 3: Server STB & Cloudflare */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleCheckSTB}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="server-outline" size={19} color="#7E22CE" />
              </View>
              <Text style={styles.menuTitle}>Server STB & Cloudflare</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#889C91" />
          </TouchableOpacity>

          {/* Menu 4: Uji Integrasi Peer Kelompok */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTestPeer}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="git-network-outline" size={19} color="#D97706" />
              </View>
              <Text style={styles.menuTitle}>Integrasi Kelompok 1 & 2</Text>
            </View>
            {testingPeer ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={17} color="#889C91" />
            )}
          </TouchableOpacity>

          {/* Menu 5: Keluar / Ganti Akun */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="log-out-outline" size={19} color="#C62828" />
              </View>
              <Text style={[styles.menuTitle, { color: '#C62828' }]}>Keluar / Ganti Akun</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#C62828" />
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFFFFF',
  },
  heroCard: {
    margin: 20,
    backgroundColor: '#2D6A4F',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircleBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D6A4F',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroEmail: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F9F4',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B2E24',
  },
});
