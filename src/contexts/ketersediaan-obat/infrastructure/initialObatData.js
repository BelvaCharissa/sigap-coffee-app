export const initialKatalogObat = [
  {
    id: 'obat_1',
    nama: 'Paracetamol Sirup 120mg/5ml',
    kategori: 'Demam & Nyeri Anak',
    deskripsi: 'Pereda demam dan pereda nyeri untuk anak usia 1-12 tahun.',
    bentuk: 'Sirup 60ml',
    keluhanTerkait: ['demam anak', 'panas tinggi', 'nyeri gigi'],
  },
  {
    id: 'obat_2',
    nama: 'Paracetamol Tablet 500mg',
    kategori: 'Demam & Nyeri Dewasa',
    deskripsi: 'Meredakan sakit kepala, sakit gigi, dan demam.',
    bentuk: 'Strip 10 Tablet',
    keluhanTerkait: ['demam', 'pusing', 'sakit kepala'],
  },
  {
    id: 'obat_3',
    nama: 'Oralit Sachet 200ml',
    kategori: 'Dehidrasi & Diare',
    deskripsi: 'Mencegah dan mengobati dehidrasi akibat diare atau muntaber.',
    bentuk: 'Sachet Serbuk',
    keluhanTerkait: ['diare', 'muntah', 'lemas', 'dehidrasi'],
  },
  {
    id: 'obat_4',
    nama: 'Ibuprofen Sirup 100mg/5ml',
    kategori: 'Anti-inflamasi & Nyeri',
    deskripsi: 'Meredakan demam dan peradangan pada anak.',
    bentuk: 'Sirup 60ml',
    keluhanTerkait: ['demam tinggi', 'radang tenggorokan'],
  },
  {
    id: 'obat_5',
    nama: 'Cetirizine 10mg',
    kategori: 'Alergi & Gatal',
    deskripsi: 'Antihistamin untuk alergi, gatal biduran, dan bersin cuaca dingin.',
    bentuk: 'Strip 10 Tablet',
    keluhanTerkait: ['alergi', 'bersin', 'gatal', 'flu dingin'],
  },
  {
    id: 'obat_6',
    nama: 'Antasida Doen Tablet Kunyah',
    kategori: 'Lambung & Maag',
    deskripsi: 'Menetralkan asam lambung berlebih, mual dan perih ulu hati.',
    bentuk: 'Strip 10 Tablet',
    keluhanTerkait: ['maag', 'nyeri lambung', 'asam lambung', 'mual'],
  },
];

// Stok per faskes dan obat
export const initialStokList = [
  {
    faskesId: 'faskes_1', // Kimia Farma Dago
    obatId: 'obat_1',     // Paracetamol Sirup
    laporan: [
      {
        id: 'rep_1',
        userId: 'user_mitra_1',
        userName: 'Apoteker KF Dago',
        role: 'Mitra',
        status: 'Ada',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 jam lalu (Segar)
        catatan: 'Stok tersedia banyak di rak obat anak.',
      },
    ],
  },
  {
    faskesId: 'faskes_1',
    obatId: 'obat_3',     // Oralit
    laporan: [
      {
        id: 'rep_2',
        userId: 'user_warga_1',
        userName: 'Budi Warga',
        role: 'Warga',
        status: 'Ada',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        catatan: 'Tadi siang beli 5 sachet masih ada.',
      },
    ],
  },
  {
    faskesId: 'faskes_2', // Puskesmas Dago Girang
    obatId: 'obat_1',     // Paracetamol Sirup
    laporan: [
      {
        id: 'rep_3',
        userId: 'user_warga_2',
        userName: 'Siti Rahma',
        role: 'Warga',
        status: 'Habis',
        timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 jam lalu (Memudar)
        catatan: 'Stok sirup habis, hanya ada tablet.',
      },
    ],
  },
  {
    faskesId: 'faskes_3', // Klinik Salman ITB
    obatId: 'obat_1',
    laporan: [
      {
        id: 'rep_4',
        userId: 'user_mitra_2',
        userName: 'Petugas Farmasi Salman',
        role: 'Mitra',
        status: 'Ada',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 jam lalu
        catatan: 'Tersedia dengan resep maupun bebas.',
      },
    ],
  },
  {
    faskesId: 'faskes_4', // RS Santo Borromeus
    obatId: 'obat_1',
    laporan: [
      {
        id: 'rep_5',
        userId: 'user_mitra_3',
        userName: 'Farmasi IGD Borromeus',
        role: 'Mitra',
        status: 'Ada',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        catatan: 'Instalasi farmasi buka 24 jam.',
      },
    ],
  },
  {
    faskesId: 'faskes_5', // Apotek K-24 Dipatiukur
    obatId: 'obat_1',
    laporan: [
      {
        id: 'rep_6',
        userId: 'user_warga_3',
        userName: 'Andi Santoso',
        role: 'Warga',
        status: 'Ada',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        catatan: 'Masih ada beberapa botol.',
      },
    ],
  },
];
