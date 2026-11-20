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
  const [nama, setNama] = useState('Indah Ramadhani');
  const [email, setEmail] = useState('indah@sigap.id');
  const [peran, setPeran] = useState('Warga Siaga');
  const [password, setPassword] = useState('sigap123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    if (!nama.trim() || !email.trim()) {
      setErrorMessage('Nama dan email wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nama: nama.trim(),
        email: email.trim(),
        password: password || 'sigap123',
        role: peran.includes('Mitra') ? 'Mitra' : 'Warga',
      });
      Alert.alert('Registrasi Berhasil', `Selamat datang, ${nama}!`, [
        { text: 'Lanjut', onPress: () => navigation.replace('MainTabs') },
      ]);
    } catch (err) {
      console.warn('Register fallback:', err.message);
      navigation.replace('MainTabs');
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
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Title Header matching Screenshot */}
          <View style={styles.header}>
            <Text style={styles.title}>Daftar Akun Baru</Text>
            <Text style={styles.subtitle}>Bergabung menjaga siaga kesehatan</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#C62828" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputPill}>
                <TextInput
                  style={styles.textInput}
                  value={nama}
                  onChangeText={setNama}
                  placeholder="Contoh: Indah Ramadhani"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputPill}>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="nama@sigap.id"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peran</Text>
              <View style={styles.rolePickerRow}>
                <TouchableOpacity
                  style={[styles.roleChip, peran === 'Warga Siaga' && styles.roleChipActive]}
                  onPress={() => setPeran('Warga Siaga')}
                >
                  <Ionicons
                    name="person"
                    size={16}
                    color={peran === 'Warga Siaga' ? '#FFFFFF' : colors.primary}
                  />
                  <Text style={[styles.roleChipText, peran === 'Warga Siaga' && styles.roleChipTextActive]}>
                    Warga Siaga
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleChip, peran === 'Mitra Faskes' && styles.roleChipActive]}
                  onPress={() => setPeran('Mitra Faskes')}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={peran === 'Mitra Faskes' ? '#FFFFFF' : colors.primary}
                  />
                  <Text style={[styles.roleChipText, peran === 'Mitra Faskes' && styles.roleChipTextActive]}>
                    Mitra Faskes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.btnRegister}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnRegisterText}>Daftar Akun</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.loginPromptRow}>
              <Text style={styles.promptText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: colors.primarySubtle,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F9F4',
    borderWidth: 1,
    borderColor: '#E2ECE5',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  roleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  btnRegister: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 10,
  },
  btnRegisterText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  promptText: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.primary,
  },
});
