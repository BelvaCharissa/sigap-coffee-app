import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { JenisFaskes, SumberData } from '../contexts/direktori-faskes/domain/JenisFaskes';
import { direktoriFaskesService } from '../contexts/direktori-faskes/application/DirektoriFaskesService';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';

export default function ModalTambahFaskes({ visible, onClose, onSuccess }) {
  const { currentUser, tambahReputasi } = useAuth();
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState(JenisFaskes.APOTEK);
  const [alamat, setAlamat] = useState('');
  const [jamBuka, setJamBuka] = useState('08:00 - 21:00');
  const [telepon, setTelepon] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!nama.trim() || !alamat.trim()) {
      setErrorMessage('Nama faskes dan alamat lengkap wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const newFaskes = direktoriFaskesService.tambahFaskes({
        nama,
        jenis,
        alamat,
        jamBuka,
        telepon,
        latitude: -6.8940,
        longitude: 107.6110,
        sumberData: SumberData.MANUAL,
        isClaimed: currentUser.role === 'Mitra',
        ownerUserId: currentUser.role === 'Mitra' ? currentUser.id : null,
        jarakKm: 1.0,
      });

      tambahReputasi(5);

      Alert.alert(
        'Faskes Berhasil Ditambahkan!',
        `Faskes "${newFaskes.nama}" telah tercatat di direktori SIGAP dengan SumberData=Manual.`,
        [{ text: 'OK', onPress: () => {
          onSuccess && onSuccess(newFaskes);
          onClose();
          setNama('');
          setAlamat('');
          setTelepon('');
        }}]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan faskes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Tambah Fasilitas Kesehatan</Text>
              <Text style={styles.subTitle}>Daftarkan apotek, klinik, atau puskesmas baru di sekitarmu</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Jenis Faskes */}
            <Text style={styles.inputLabel}>Jenis Fasilitas Kesehatan:</Text>
            <View style={styles.chipsRow}>
              {Object.values(JenisFaskes).map(jf => {
                const active = jenis === jf;
                return (
                  <TouchableOpacity
                    key={jf}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setJenis(jf)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {jf}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nama Faskes */}
            <Text style={styles.inputLabel}>Nama Fasilitas:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Apotek Berkah Medika / Klinik Sehat"
              placeholderTextColor={colors.textTertiary}
              value={nama}
              onChangeText={setNama}
            />

            {/* Alamat */}
            <Text style={styles.inputLabel}>Alamat Lengkap:</Text>
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              placeholder="Contoh: Jl. Cisitu Lama No. 15, Dago, Bandung"
              placeholderTextColor={colors.textTertiary}
              multiline
              value={alamat}
              onChangeText={setAlamat}
            />

            {/* Jam Buka */}
            <Text style={styles.inputLabel}>Jam Operasional:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 08:00 - 22:00 atau 24 Jam"
              placeholderTextColor={colors.textTertiary}
              value={jamBuka}
              onChangeText={setJamBuka}
            />

            {/* Telepon */}
            <Text style={styles.inputLabel}>Nomor Telepon / Kontak:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 022-2501234 / 08123456789"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              value={telepon}
              onChangeText={setTelepon}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Simpan Faskes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.primaryPastel,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 11,
    fontSize: 13,
    color: colors.text,
    backgroundColor: '#FAFCFA',
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
