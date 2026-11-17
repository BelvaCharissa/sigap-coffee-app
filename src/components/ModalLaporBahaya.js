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
import { JenisBahaya } from '../contexts/kondisi-jalan/domain/JenisBahaya';
import { kondisiJalanService } from '../contexts/kondisi-jalan/application/KondisiJalanService';
import { useAuth } from '../contexts/akun-mitra/application/AuthContext';

export default function ModalLaporBahaya({ visible, onClose, onSuccess }) {
  const { currentUser, tambahReputasi } = useAuth();
  const [jenis, setJenis] = useState(JenisBahaya.BANJIR);
  const [lokasiNama, setLokasiNama] = useState('');
  const [ketinggianAirCm, setKetinggianAirCm] = useState('30');
  const [deskripsi, setDeskripsi] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!lokasiNama.trim()) {
      setErrorMessage('Nama lokasi atau jalan wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      kondisiJalanService.laporkanBahaya({
        jenis,
        lokasiNama,
        latitude: -6.8950,
        longitude: 107.6100,
        deskripsi,
        ketinggianAirCm: jenis === JenisBahaya.BANJIR ? ketinggianAirCm : null,
        user: currentUser,
      });

      tambahReputasi(3);

      Alert.alert(
        'Laporan Bahaya Terkirim!',
        `Laporan "${jenis}" di ${lokasiNama} berhasil dipublikasikan. Sesuai invariant sistem, status akan Aktif jika dikonfirmasi 2 warga atau 1 mitra.`,
        [{ text: 'OK', onPress: () => {
          onSuccess && onSuccess();
          onClose();
          setLokasiNama('');
          setDeskripsi('');
        }}]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan laporan.');
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
              <Text style={styles.headerTitle}>Lapor Titik Bahaya Jalan</Text>
              <Text style={styles.subTitle}>Peringatkan warga yang menuju faskes saat hujan/banjir</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning" size={16} color="#D32F2F" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Jenis Bahaya Chips */}
          <Text style={styles.inputLabel}>Jenis Hambatan / Bahaya:</Text>
          <View style={styles.chipsRow}>
            {Object.values(JenisBahaya).map(jb => {
              const active = jenis === jb;
              return (
                <TouchableOpacity
                  key={jb}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                  ]}
                  onPress={() => setJenis(jb)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {jb === JenisBahaya.BANJIR ? '🌊 ' : jb === JenisBahaya.LONGSOR ? '⛰️ ' : '🚧 '}
                    {jb}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Nama Lokasi */}
          <Text style={styles.inputLabel}>Nama Jalan / Titik Rawan:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Jl. Pasteur depan BTC / Jl. Dago Cikapayang"
            placeholderTextColor={colors.textTertiary}
            value={lokasiNama}
            onChangeText={setLokasiNama}
          />

          {/* Ketinggian Air (jika Banjir) */}
          {jenis === JenisBahaya.BANJIR && (
            <>
              <Text style={styles.inputLabel}>Estimasi Ketinggian Air (cm):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: 30"
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
                value={ketinggianAirCm}
                onChangeText={setKetinggianAirCm}
              />
            </>
          )}

          {/* Deskripsi */}
          <Text style={styles.inputLabel}>Deskripsi Kondisi:</Text>
          <TextInput
            style={[styles.textInput, { height: 70 }]}
            placeholder="Kondisi arus air, apakah kendaraan roda 2 masih bisa melintas, dll."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            value={deskripsi}
            onChangeText={setDeskripsi}
          />

          <View style={styles.ruleNotice}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={styles.ruleNoticeText}>
              Bahaya aktif otomatis kedaluwarsa setelah 3 jam tanpa konfirmasi baru demi menjaga kesegaran rute.
            </Text>
          </View>

          {/* Button Row */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Publikasikan Bahaya</Text>
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
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: colors.hazardBanjirBg,
    borderColor: colors.hazardBanjir,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.hazardBanjir,
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
    marginBottom: 12,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySubtle,
    padding: 9,
    borderRadius: 10,
    marginBottom: 14,
  },
  ruleNoticeText: {
    fontSize: 11,
    color: colors.primary,
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
