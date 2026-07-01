import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function GuideDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'aduan' | 'edukasi' }>();

  // Cek Mandiri Checkbox States
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const totalItems = 5;

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const isAllChecked = completedCount === totalItems;

  const handleCopyTemplate = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Berhasil', 'Template laporan telah disalin ke papan klip.');
  };

  const reportTemplateText = 
    `Halo Tim Aduan Konten,\n\nSaya ingin melaporkan temuan konten yang diduga memuat disinformasi/hoaks dengan detail sebagai berikut:\n- Tautan Bukti: [Masukkan URL Berita/Postingan]\n- Catatan Tambahan: Konten ini memicu keresahan masyarakat dan terindikasi sebagai manipulasi fakta.\n\nMohon untuk ditinjau lebih lanjut. Terima kasih.`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/explore');
            }
          }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {type === 'aduan' ? 'Panduan Laporan Resmi' : 'Metode Cek Mandiri'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={styles.scrollContent}
        >
          {type === 'aduan' ? (
            // --- VIEW: ADUAN RESMI TUTORIAL ---
            <View>
              {/* Hero Banner */}
              <LinearGradient
                colors={['#00ca92', '#00a87a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBanner}
              >
                <Ionicons name="megaphone" size={48} color="#ffffff" style={styles.heroIcon} />
                <Text style={styles.heroTitle}>Cara Laporkan Hoaks ke Instansi Resmi</Text>
                <Text style={styles.heroDesc}>
                  Langkah taktis melaporkan penyebaran disinformasi langsung ke Kementerian Komdigi dan organisasi pemeriksa fakta independen (Mafindo).
                </Text>
              </LinearGradient>

              {/* Step 1 */}
              <View style={styles.cardSection}>
                <Text style={[styles.stepNumberText, { color: '#00ca92' }]}>LANGKAH 1</Text>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Kumpulkan Bukti Valid</Text>
                <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                  Sebelum melapor, pastikan Anda telah menyiapkan tangkapan layar (screenshot) dari postingan hoaks tersebut beserta tautan (URL) langsung menuju postingan asli. Jangan menyebarkan ulang konten tersebut kecuali untuk tujuan pelaporan.
                </Text>
              </View>

              {/* Step 2 */}
              <View style={styles.cardSection}>
                <Text style={[styles.stepNumberText, { color: '#00ca92' }]}>LANGKAH 2</Text>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Saluran Laporan Resmi Komdigi</Text>
                
                <View style={styles.subCard}>
                  <View style={styles.subCardHeader}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                    <Text style={[styles.subCardTitle, { color: theme.text }]}>WhatsApp AduanKonten</Text>
                  </View>
                  <Text style={[styles.subCardBody, { color: theme.textSecondary }]}>
                    Kirim pesan ke nomor resmi Kementerian Kominfo/Komdigi di <Text style={{ fontWeight: '800', color: theme.text }}>0811-922-4545</Text> dengan format menyertakan tautan hoaks dan gambar tangkapan layar.
                  </Text>
                </View>

                <View style={styles.subCard}>
                  <View style={styles.subCardHeader}>
                    <Ionicons name="mail" size={20} color="#ba1a1a" />
                    <Text style={[styles.subCardTitle, { color: theme.text }]}>Email Kementerian</Text>
                  </View>
                  <Text style={[styles.subCardBody, { color: theme.textSecondary }]}>
                    Anda juga dapat mengirimkan laporan email ke <Text style={{ fontWeight: '800', color: theme.text }}>aduan@mail.kominfo.go.id</Text> dengan melampirkan file tangkapan layar hoaks.
                  </Text>
                </View>
              </View>

              {/* Template Copy Box */}
              <View style={[styles.copyBox, { backgroundColor: theme.background === '#ffffff' ? '#fcf8ff' : '#211e24', borderColor: theme.backgroundElement }]}>
                <View style={styles.copyBoxHeader}>
                  <Text style={[styles.copyBoxTitle, { color: theme.text }]}>Gunakan Template Laporan Ini:</Text>
                  <Pressable onPress={() => handleCopyTemplate(reportTemplateText)} style={styles.copyBtn}>
                    <Ionicons name="copy-outline" size={16} color="#00ca92" />
                    <Text style={styles.copyBtnText}>Salin</Text>
                  </Pressable>
                </View>
                <Text style={[styles.copyBoxBody, { color: theme.textSecondary }]}>
                  {reportTemplateText}
                </Text>
              </View>

              {/* Step 3 */}
              <View style={styles.cardSection}>
                <Text style={[styles.stepNumberText, { color: '#00ca92' }]}>LANGKAH 3</Text>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Laporkan Melalui Mafindo</Text>
                <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>
                  Masyarakat Anti Fitnah Indonesia (Mafindo) juga menyediakan saluran bot pemeriksaan fakta WhatsApp di nomor <Text style={{ fontWeight: '800', color: theme.text }}>0818-380-848</Text>. Kirimkan kata kunci informasi mencurigakan untuk mencocokkannya dengan database klarifikasi fakta nasional.
                </Text>
              </View>
            </View>
          ) : (
            // --- VIEW: CEK MANDIRI / EDUKASI TUTORIAL ---
            <View>
              {/* Hero Banner */}
              <LinearGradient
                colors={['#d97706', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroBanner}
              >
                <Ionicons name="shield-checkmark" size={48} color="#ffffff" style={styles.heroIcon} />
                <Text style={styles.heroTitle}>Metode Deteksi Hoaks Mandiri</Text>
                <Text style={styles.heroDesc}>
                  Gunakan checklist praktis di bawah ini untuk menilai keabsahan suatu berita sebelum Anda menyebarkannya.
                </Text>
              </LinearGradient>

              {/* Progress Indicator */}
              <View style={[styles.progressBox, { backgroundColor: theme.background === '#ffffff' ? '#fffbeb' : '#24201a', borderColor: theme.backgroundElement }]}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressTitle, { color: theme.text }]}>Checklist Kesiapan Berita</Text>
                  <Text style={[styles.progressCount, { color: '#d97706' }]}>{completedCount} / {totalItems}</Text>
                </View>
                
                {/* Visual bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(completedCount / totalItems) * 100}%`, backgroundColor: '#d97706' }]} />
                </View>
              </View>

              {/* Checklist Items */}
              <View style={styles.checklistContainer}>
                {[
                  {
                    id: 1,
                    title: '1. Periksa Kredibilitas Domain Web',
                    desc: 'Apakah website tersebut terdaftar di Dewan Pers? Domain aneh seperti .blogspot, .wp, atau nama domain mirip media asli (.co.id diganti .co) patut dicurigai.'
                  },
                  {
                    id: 2,
                    title: '2. Analisis Judul Provokatif / Sensasional',
                    desc: 'Judul berita palsu sering kali menggunakan huruf besar (CAPS LOCK), kalimat ancaman, atau memicu kemarahan publik.'
                  },
                  {
                    id: 3,
                    title: '3. Verifikasi Foto (Reverse Image Search)',
                    desc: 'Lakukan pencarian terbalik gambar berita di mesin pencari. Sering kali hoaks menggunakan foto kejadian tahun lalu di tempat lain untuk isu hari ini.'
                  },
                  {
                    id: 4,
                    title: '4. Bandingkan dengan Media Resmi',
                    desc: 'Cari isu serupa di Google. Jika berita nasional yang sangat penting hanya diberitakan oleh satu blog tidak dikenal, itu hampir pasti hoaks.'
                  },
                  {
                    id: 5,
                    title: '5. Cek Tanggal Kejadian',
                    desc: 'Berita lama yang benar di masa lalu sering kali diunggah kembali tanpa keterangan tanggal terkini untuk memanipulasi opini publik hari ini.'
                  }
                ].map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleCheck(item.id)}
                      style={[
                        styles.checkCard,
                        { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1b18' }
                      ]}
                    >
                      <View style={[
                        styles.checkbox,
                        isChecked ? { backgroundColor: '#d97706', borderColor: '#d97706' } : { borderColor: theme.textSecondary }
                      ]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                      </View>
                      <View style={styles.checkCardText}>
                        <Text style={[styles.checkCardTitle, { color: theme.text }, isChecked && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.checkCardDesc, { color: theme.textSecondary }]}>
                          {item.desc}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Completion Banner */}
              {isAllChecked && (
                <View style={styles.celebrationCard}>
                  <Ionicons name="ribbon-outline" size={32} color="#ffffff" />
                  <Text style={styles.celebrationTitle}>Anda Hebat!</Text>
                  <Text style={styles.celebrationDesc}>
                    Dengan menyelesaikan checklist di atas, Anda telah mempraktikkan langkah-langkah literasi media dasar untuk melindungi diri dan keluarga dari sebaran hoaks digital.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  heroBanner: {
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.five,
  },
  heroIcon: {
    marginBottom: 10,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 6,
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  cardSection: {
    marginBottom: Spacing.five,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Be Vietnam Pro',
  },
  subCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  subCardBody: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Be Vietnam Pro',
  },
  copyBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: Spacing.five,
  },
  copyBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f2ecf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#00ca92',
  },
  copyBoxBody: {
    fontSize: 11.5,
    fontStyle: 'italic',
    lineHeight: 17,
    fontFamily: 'Be Vietnam Pro',
  },
  progressBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: Spacing.five,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistContainer: {
    gap: 12,
    marginBottom: Spacing.five,
  },
  checkCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkCardText: {
    flex: 1,
    gap: 4,
  },
  checkCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  checkCardDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Be Vietnam Pro',
  },
  celebrationCard: {
    backgroundColor: '#15803d',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  celebrationTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  celebrationDesc: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
  },
});
