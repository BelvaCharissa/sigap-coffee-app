import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('indah@sigap.itb.ac.id');
  const [password, setPassword] = useState('sigap123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Validation
  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Alamat email wajib diisi.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Format email tidak valid (contoh: nama@domain.com).');
      return false;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.replace('MainTabs');
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali email dan kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleKey) => {
    loginAsDemo(roleKey);
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Branding Banner */}
          <View style={styles.brandingSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="medical" size={38} color={colors.primary} />
            </View>
            <Text style={styles.appName}>SIGAP</Text>
            <Text style={styles.appTagline}>Sehat, Informasi, Gerak, Akses, Pertolongan</Text>
            <Text style={styles.subSubtitle}>
              Tugas Besar II3160 TST & II3140 PWAM • STEI ITB 2026
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>
            <Text style={styles.cardSubtitle}>
              Akses informasi ketersediaan obat, rute aman banjir, dan verifikasi faskes
            </Text>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#C62828" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Alamat Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="nama@sigap.itb.ac.id"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Masuk (JWT Auth)</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Daftar Baru</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Demo Access Buttons (Evaluasi Dosen & Pengujian Cepat) */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>⚡ Pengujian Cepat Demo (1-Click Login):</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={styles.demoBtnWarga}
                onPress={() => handleQuickDemo('warga')}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={16} color={colors.primary} />
                <Text style={styles.demoBtnText}>Warga (Indah)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoBtnMitra}
                onPress={() => handleQuickDemo('mitra')}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark" size={16} color="#15803D" />
                <Text style={styles.demoBtnMitraText}>Mitra Faskes (Belva)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => navigation.replace('MainTabs')}
            >
              <Text style={styles.guestLinkText}>Lanjutkan Langsung sebagai Tamu →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryPastel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C7EBD1',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  subSubtitle: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtnWarga: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryPastel,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B7E4C7',
    gap: 6,
  },
  demoBtnMitra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 6,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  demoBtnMitraText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  guestLink: {
    marginTop: 16,
    padding: 6,
  },
  guestLinkText: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
