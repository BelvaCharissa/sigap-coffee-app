// Theme colors strictly adhering to Health Green + Clean White + Gradient Green-White + Red for Critical Alerts only
export const colors = {
  primary: '#2D6A4F',        // Deep forest green for main actions and title text
  primaryLight: '#40916C',   // Lush foliage green
  primaryMuted: '#52B788',   // Soft mint green
  primaryPastel: '#D8F3DC',  // Pastel mint pill/card background
  primarySubtle: '#F2F9F4',  // Subtle green tint for screens

  secondary: '#74C69D',
  secondaryLight: '#B7E4C7',

  background: '#FFFFFF',     // Clean white screen background
  backgroundSubtle: '#F7FAF7',
  card: '#FFFFFF',           // Card surface
  cardBorder: '#E2ECE5',     // Soft border for cards

  text: '#1B2E24',           // High contrast readable dark green-slate
  textSecondary: '#52695E',  // Muted body text
  textTertiary: '#889C91',   // Subtext & caption
  textLight: '#FFFFFF',

  // Merah KHUSUS untuk Highlight Hal Penting (Peringatan Banjir, Stok Habis, IGD 24 Jam)
  highlightRed: '#DC2626',
  highlightRedBg: '#FEF2F2',
  highlightRedBorder: '#FCA5A5',

  // Status & Urgency Badges
  stockAda: '#2E7D32',       // Green
  stockAdaBg: '#E8F5E9',
  stockHabis: '#DC2626',     // Red highlight
  stockHabisBg: '#FEF2F2',
  stockTidakYakin: '#2D6A4F',

  // Urgensi Kartu Siaga
  urgensiRumah: '#2E7D32',
  urgensiRumahBg: '#E8F5E9',
  urgensiPuskesmas: '#2D6A4F',
  urgensiPuskesmasBg: '#F2F9F4',
  urgensiIGD: '#DC2626',     // Red highlight
  urgensiIGDBg: '#FEF2F2',

  // Smart City Bahaya Jalan
  hazardBanjir: '#DC2626',   // Red highlight for active flood
  hazardBanjirBg: '#FEF2F2',
  hazardAman: '#2D6A4F',
  hazardAmanBg: '#E8F5E9',

  border: '#E2ECE5',
  divider: '#F2F9F4',
  shadow: '#1B2E24',
};

export default colors;
