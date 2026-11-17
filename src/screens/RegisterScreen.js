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

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nim, setNim] = useState('');
  const [selectedRole, setSelectedRole] = useState('Warga');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!nama.trim() || nama.trim().length < 3) {
      setErrorMessage('Nama lengkap minimal 3 karakter.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Format email tidak valid (contoh: nama@domain.com).');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        nama: nama.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        nim: nim.trim() || 'Warga-Umum',
      });

      Alert.alert(
        'Pendaftaran Berhasil!',
        `Selamat bergabung di SIGAP sebagai ${selectedRole}. Akun Anda telah siap digunakan.`,
        [{ text: 'Lanjut ke Aplikasi', onPress: () => navigation.replace('MainTabs') }]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Daftar Akun SIGAP</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Buat Akun Baru</Text>
            <Text style={styles.cardSubtitle}>
              Pilih peran Anda untuk membantu pelaporan stok faskes dan info bahaya jalan
            </Text>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#C62828" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Role Selector Pill */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Peran Pengguna</Text>
              <View style={styles.roleSelectorRow}>
                <TouchableOpacity
                  style={[styles.roleOption, selectedRole === 'Warga' && styles.roleOptionActive]}
                  onPress={() => setSelectedRole('Warga')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={selectedRole === 'Warga' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.roleOptionText, selectedRole === 'Warga' && styles.roleOptionTextActive]}>
                    Warga (Pencari Obat)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleOption, selectedRole === 'Mitra' && styles.roleOptionActive]}
                  onPress={() => setSelectedRole('Mitra')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={selectedRole === 'Mitra' ? colors.primary : colors.textSecondary}
                  />
                  <Text style={[styles.roleOptionText, selectedRole === 'Mitra' && styles.roleOptionTextActive]}>
                    Mitra (Pemilik Faskes)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nama Lengkap */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Belva Charissa"
                  placeholderTextColor={colors.textTertiary}
                  value={nama}
                  onChangeText={(val) => {
                    setNama(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </View>
            </View>

            {/* Email */}
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

            {/* NIM / Identitas */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NIM Mahasiswa / Nomor Anggota</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: 18224051"
                  placeholderTextColor={colors.textTertiary}
                  value={nim}
                  onChangeText={setNim}
                />
              </View>
            </View>

            {/* Password */}
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
                  secureTextEntry
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
              )}
            </TouchableOpacity>

            {/* Already have account */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Masuk di sini</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
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
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.primarySubtle,
    gap: 6,
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryPastel,
  },
  roleOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
