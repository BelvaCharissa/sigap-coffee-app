import React, { createContext, useContext, useState } from 'react';
import { Peran } from '../domain/Peran';
import { eventBus } from '../../../shared/EventBus';
import ApiService from '../../../services/ApiService';

const defaultUsers = {
  warga: {
    id: 'user_warga_demo',
    nama: 'Belva Charissa (Warga)',
    nim: '18224051',
    email: 'belva.warga@stei.itb.ac.id',
    role: Peran.WARGA,
    reputasi: 85, // Bobot reputasi pelapor
    laporanDiterima: 12,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    faskesKlaimId: null,
  },
  mitra: {
    id: 'user_mitra_demo',
    nama: 'Apoteker Indah Ramadhani, S.Farm',
    nim: '18224037',
    email: 'indah.mitra@kimiafarma.co.id',
    role: Peran.MITRA,
    reputasi: 99,
    laporanDiterima: 48,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    faskesKlaimId: 'faskes_1',
    namaFaskesKlaim: 'Apotek Kimia Farma Dago',
  },
  admin: {
    id: 'user_admin_demo',
    nama: 'Admin SIGAP STEI ITB',
    nim: 'Admin-PWAM',
    email: 'admin.sigap@stei.itb.ac.id',
    role: Peran.ADMIN,
    reputasi: 100,
    laporanDiterima: 150,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    faskesKlaimId: null,
  },
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(defaultUsers.warga);
  const [authToken, setAuthToken] = useState('sigap_mock_jwt_token_2026');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [semuaKlaim, setSemuaKlaim] = useState([
    {
      id: 'klaim_1',
      faskesId: 'faskes_1',
      namaFaskes: 'Apotek Kimia Farma Dago',
      pemohonNama: 'Indah Ramadhani, S.Farm',
      status: 'Disetujui',
      tanggal: '14 Nov 2026',
    },
    {
      id: 'klaim_2',
      faskesId: 'faskes_3',
      namaFaskes: 'Klinik Pratama Salman ITB',
      pemohonNama: 'dr. Ahmad Zaki',
      status: 'Disetujui',
      tanggal: '15 Nov 2026',
    },
  ]);

  const login = async (email, password) => {
    // Coba via ApiService
    const res = await ApiService.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthToken(res.token || 'sigap_jwt_token');
      setIsAuthenticated(true);
      return res.user;
    }
    throw new Error(res.message || 'Login gagal.');
  };

  const register = async (userData) => {
    const res = await ApiService.register(userData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthToken(res.token || 'sigap_jwt_token');
      setIsAuthenticated(true);
      return res.user;
    }
    throw new Error(res.message || 'Registrasi gagal.');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(defaultUsers.warga);
    setAuthToken(null);
  };

  const loginAsDemo = (roleKey = 'warga') => {
    const user = defaultUsers[roleKey] || defaultUsers.warga;
    setCurrentUser(user);
    setAuthToken('demo_token_' + roleKey);
    setIsAuthenticated(true);
  };

  const switchRole = (newRoleKey) => {
    if (defaultUsers[newRoleKey]) {
      setCurrentUser(defaultUsers[newRoleKey]);
    }
  };

  const ajukanKlaim = (faskesId, namaFaskes) => {
    const existing = semuaKlaim.find(k => k.faskesId === faskesId && k.status === 'Disetujui');
    if (existing) {
      throw new Error('Faskes ini sudah memiliki pemilik aktif.');
    }

    const newKlaim = {
      id: 'klaim_' + Date.now(),
      faskesId,
      namaFaskes,
      pemohonNama: currentUser.nama,
      status: 'Menunggu Verifikasi Admin',
      tanggal: new Date().toLocaleDateString('id-ID'),
    };

    setSemuaKlaim(prev => [newKlaim, ...prev]);

    eventBus.publish('KlaimDiajukan', {
      klaimId: newKlaim.id,
      faskesId,
      userId: currentUser.id,
    });

    return newKlaim;
  };

  const setujuiKlaim = (klaimId) => {
    setSemuaKlaim(prev =>
      prev.map(k => (k.id === klaimId ? { ...k, status: 'Disetujui' } : k))
    );
    eventBus.publish('KlaimDisetujui', { klaimId });
  };

  const tolakKlaim = (klaimId) => {
    setSemuaKlaim(prev =>
      prev.map(k => (k.id === klaimId ? { ...k, status: 'Ditolak' } : k))
    );
    eventBus.publish('KlaimDitolak', { klaimId });
  };

  const tambahReputasi = (poin) => {
    setCurrentUser(prev => {
      const newScore = Math.min(100, Math.max(0, (prev.reputasi || 50) + poin));
      eventBus.publish('ReputasiBerubah', {
        userId: prev.id,
        reputasiBaru: newScore,
      });
      return { ...prev, reputasi: newScore };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authToken,
        isAuthenticated,
        login,
        register,
        logout,
        loginAsDemo,
        switchRole,
        ajukanKlaim,
        setujuiKlaim,
        tolakKlaim,
        tambahReputasi,
        semuaKlaim,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
