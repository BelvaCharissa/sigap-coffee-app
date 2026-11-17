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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';
import { ketersediaanObatService } from '../contexts/ketersediaan-obat/application/KetersediaanObatService';

export default function ModalLaporStok({
  visible,
  onClose,
  faskes,
  obat,
  onSuccess,
}) {
  const { currentUser, tambahReputasi } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('Ada');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    setErrorMessage('');
    if (!faskes || !obat) return;

    setLoading(true);
    try {
      ketersediaanObatService.laporkanStok({
        faskesId: faskes.id,
        obatId: obat.id,
        userId: currentUser.id,
        userName: currentUser.nama,
        role: currentUser.role,
        status: selectedStatus,
        catatan,
      });

      // Berikan reward reputasi bagi pelapor yang berpartisipasi (DDD ReputasiPelapor)
      tambahReputasi(2);

      Alert.alert(
        'Laporan Berhasil!',
        `Terima kasih telah memperbarui stok obat ${obat.nama} di ${faskes.nama}. Status telah diperbarui secara realtime.`,
        [{ text: 'OK', onPress: () => {
          onSuccess && onSuccess();
          onClose();
        }}]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengirimkan laporan stok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Lapor Status Stok Obat</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {faskes?.nama}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Info Obat */}
          <View style={styles.medicineBanner}>
            <Ionicons name="medical" size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>{obat?.nama}</Text>
              <Text style={styles.medCat}>{obat?.kategori}</Text>
            </View>
          </View>

          {/* User Role Indicator */}
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              Melapor sebagai: <Text style={{ fontWeight: '700' }}>{currentUser.nama} ({currentUser.role})</Text>
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Status Selection */}
          <Text style={styles.inputLabel}>Pilih Ketersediaan Obat Saat Ini:</Text>
          <View style={styles.statusRow}>
            {['Ada', 'Habis', 'Tidak Yakin'].map(st => {
              const active = selectedStatus === st;
              let activeColor = colors.stockAda;
              let activeBg = colors.stockAdaBg;
              if (st === 'Habis') {
                activeColor = colors.stockHabis;
                activeBg = colors.stockHabisBg;
              } else if (st === 'Tidak Yakin') {
                activeColor = colors.stockTidakYakin;
                activeBg = colors.stockTidakYakinBg;
              }

              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusOption,
                    active && { backgroundColor: activeBg, borderColor: activeColor, borderWidth: 1.5 },
                  ]}
                  onPress={() => setSelectedStatus(st)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      active && { color: activeColor, fontWeight: '700' },
                    ]}
                  >
                    {st === 'Ada' ? '✓ ' : st === 'Habis' ? '✕ ' : '? '}
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Catatan / Keterangan */}
          <Text style={styles.inputLabel}>Catatan Tambahan (Opsional):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Tersedia 10 botol di rak, batas pembelian 2 per orang"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            value={catatan}
            onChangeText={setCatatan}
          />

          <View style={styles.rateLimitNote}>
            <Ionicons name="shield-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.rateLimitText}>
              Aturan Invariant: Maksimal 1 laporan per obat per jam untuk akun Warga guna mencegah spam.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
              )}
            </TouchableOpacity>
          </View>
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
    maxHeight: '88%',
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
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  medicineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 10,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  medCat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  roleTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  roleTagText: {
    fontSize: 12,
    color: '#334155',
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
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: 'top',
    backgroundColor: '#FAFCFA',
    marginBottom: 10,
  },
  rateLimitNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  rateLimitText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
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
