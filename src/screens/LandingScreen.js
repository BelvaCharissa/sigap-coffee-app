import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(false);

  // If user wants to view the dark splash screen style, they can tap or it can be toggled
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.splashGlassCard}>
          <Ionicons name="medical" size={46} color="#FFFFFF" />
        </View>
        <Text style={styles.splashTitle}>SIGAP</Text>
        <Text style={styles.splashSub}>
          Akses Cepat Kebutuhan Obat & Rute Aman Faskes Siaga Bencana
        </Text>
        <TouchableOpacity
          style={styles.splashDismissBtn}
          onPress={() => setShowSplash(false)}
        >
          <Text style={styles.splashDismissText}>Lanjut ke Aplikasi ➔</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        {/* Top Header Row with Logo Icon */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setShowSplash(true)} style={styles.miniLogo}>
            <Ionicons name="medical" size={16} color={colors.primary} />
            <Text style={styles.miniLogoText}>SIGAP</Text>
          </TouchableOpacity>
        </View>

        {/* Center Illustration Circle (Exact match with reference image) */}
        <View style={styles.centerSection}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="car" size={68} color={colors.primary} />
          </View>

          <Text style={styles.mainTitle}>Kebutuhan Faskes Mudah</Text>
          <Text style={styles.mainDescription}>
            Cek ketersediaan stok obat akurat dan temukan rute bebas banjir terdekat dalam satu ketukan.
          </Text>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.btnGetStarted}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Mulai Sekarang</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestLink}
            onPress={() => navigation.replace('MainTabs')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestText}>Masuk langsung sebagai Tamu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  miniLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryPastel,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  miniLogoText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  illustrationCircle: {
    width: width * 0.46,
    height: width * 0.46,
    borderRadius: (width * 0.46) / 2,
    backgroundColor: '#D8F3DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  mainDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingBottom: 24,
  },
  btnGetStarted: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  guestLink: {
    alignItems: 'center',
    marginTop: 14,
    padding: 6,
  },
  guestText: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#1B4332',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  splashGlassCard: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  splashSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
  splashDismissBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  splashDismissText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
