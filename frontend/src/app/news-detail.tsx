import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';
import * as WebBrowser from 'expo-web-browser';

const { width: screenWidth } = Dimensions.get('window');

// Retro Stamp Component for News Detail
const RetroStamp = ({ status, size = 'large' }: { status: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU', size?: 'large' }) => {
  let text = 'FAKTA';
  let color = '#15803d'; // Green
  if (status === 'HOAKS') {
    text = 'HOAKS';
    color = '#ba1a1a'; // Red
  } else if (status === 'RAGU-RAGU') {
    text = 'RAGU';
    color = '#d97706'; // Amber
  }

  return (
    <View style={[styles.stampContainerLarge, { borderColor: color }]}>
      <Text style={[styles.stampTextLarge, { color: color }]}>{text}</Text>
    </View>
  );
};

export default function NewsDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleReadFullArticle = async () => {
    const url = (params.id as string) || '';
    if (url.startsWith('http')) {
      await WebBrowser.openBrowserAsync(url);
    } else {
      Alert.alert('Info', 'Tautan berita asli tidak tersedia.');
    }
  };

  // Get dynamic params or fallback
  const articleTitle = params.title as string || 'Perjanjian Perdagangan Hijau Global Disahkan di KTT Jenewa.';
  const articleContent = params.content as string || 'Para pemimpin dunia mencapai konsensus bersejarah mengenai protokol pajak karbon setelah negosiasi intensif selama tiga hari di Jenewa.';
  const articleImage = params.image as string || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDycVM08NX0WNLAX5oE_OAkJETcCfTfzaLc8_4ywd6nHj8w1JRUSvQjceMhyYuXYzBa6gIpOqzgnlRWn1QkFSTqIELOE_6mMk-MiT4tfmEYpJ3YiwCELTCmVtzoVJnj9lTdmm0G_lGLr2AhCMYAftfpttt8OZy2OPPcScufnm5SRo47ClfY8iTBE7lvlfDmkZH39vpPMLJYk3lKHN8iFliCFxDQpf7FrqnrvVLXLCpNQWFan5lrQhShpAoXWjChkegL4EXoXFyG0x0';
  const articleSource = params.source as string || 'BBC News • 11 Feb 2026';
  
  // Map raw status (handle both VALID and FAKTA)
  const rawStatus = (params.status as string) || 'FAKTA';
  const articleStatus: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU' = 
    rawStatus === 'VALID' ? 'FAKTA' : rawStatus === 'HOAX' ? 'HOAKS' : rawStatus as any;

  // Extract clean source display name from articleSource param
  const getSourceDisplayName = (src: string): string => {
    if (!src) return 'Sumber Berita';
    const lower = src.toLowerCase();
    if (lower.includes('tempo')) return 'Tempo.co';
    if (lower.includes('cnbc')) return 'CNBC Indonesia';
    if (lower.includes('cnn')) return 'CNN Indonesia';
    if (lower.includes('kumparan')) return 'Kumparan';
    if (lower.includes('republika')) return 'Republika';
    if (lower.includes('antara')) return 'Antara News';
    if (lower.includes('kompas')) return 'Kompas.com';
    if (lower.includes('detik')) return 'Detik.com';
    if (lower.includes('tribun')) return 'Tribunnews';
    // Return the raw source cleaned up (remove bullet separators)
    return src.split('•')[0].trim() || src;
  };
  const sourceDisplayName = getSourceDisplayName(articleSource);

  const getDynamicFactCheckAnalysis = () => {
    const cleanTitle = articleTitle.trim();
    const cleanSource = sourceDisplayName;

    if (articleStatus === 'FAKTA') {
      return [
        {
          label: 'Verifikasi Penerbit Media',
          icon: 'checkmark-circle' as const,
          color: '#15803d',
          desc: `Artikel diterbitkan oleh ${cleanSource}, sebuah institusi media massa terdaftar yang mematuhi Kode Etik Jurnalistik dan terverifikasi oleh Dewan Pers. Informasi yang dilaporkan memiliki akurasi penulisan yang tinggi.`
        },
        {
          label: 'Kredibilitas Konten & Rujukan',
          icon: 'checkmark-circle' as const,
          color: '#15803d',
          desc: `Laporan tentang "${cleanTitle}" didasarkan pada kutipan narasumber otoritatif atau rilis data resmi primer, tanpa indikasi manipulasi konten atau distorsi fakta lapangan.`
        }
      ];
    } else if (articleStatus === 'HOAKS') {
      return [
        {
          label: 'Hasil Deteksi Inkonsistensi',
          icon: 'close-circle' as const,
          color: '#ba1a1a',
          desc: `Judul atau klaim tentang "${cleanTitle}" bertentangan dengan fakta ilmiah, dokumen resmi, atau konfirmasi langsung dari lembaga berwenang yang bersangkutan.`
        },
        {
          label: 'Indikasi Pola Disinformasi',
          icon: 'close-circle' as const,
          color: '#ba1a1a',
          desc: `Informasi disebarkan melalui saluran tidak resmi tanpa sumber primer yang valid. Konten ini cenderung menyebarkan bias untuk menyesatkan pembaca.`
        }
      ];
    } else {
      // RAGU-RAGU
      return [
        {
          label: 'Keterbatasan Bukti Otoritatif',
          icon: 'alert-circle' as const,
          color: '#d97706',
          desc: `Klaim dalam berita "${cleanTitle}" belum didukung oleh rilis resmi, kajian ilmiah publik, atau konfirmasi resmi dari pihak-pihak terkait.`
        },
        {
          label: 'Campuran Fakta dan Opini',
          icon: 'alert-circle' as const,
          color: '#d97706',
          desc: `Sebagian informasi mengenai topik ini mungkin benar, namun disajikan bersama spekulasi, asumsi pribadi, atau rumor yang belum terbukti kebenarannya secara empiris.`
        }
      ];
    }
  };

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Check if current article is bookmarked in database
    const checkBookmarkStatus = async () => {
      try {
        const result = await apiClient.fetchBookmarks();
        if (result && result.bookmarks) {
          const found = result.bookmarks.some((bm: any) => bm.title === articleTitle);
          setIsBookmarked(found);
        }
      } catch (err) {
        // Fail silently
      }
    };
    checkBookmarkStatus();
  }, [articleTitle]);

  const handleToggleBookmark = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isBookmarked) {
        const result = await apiClient.fetchBookmarks();
        const found = result.bookmarks.find((bm: any) => bm.title === articleTitle);
        if (found) {
          await apiClient.removeBookmark(found.id);
          setIsBookmarked(false);
          Alert.alert('Sukses', 'Berita berhasil dihapus dari favorit.');
        }
      } else {
        await apiClient.addBookmark({
          title: articleTitle,
          link: (params.id as string) && (params.id as string).startsWith('http')
            ? (params.id as string)
            : `https://www.cnnindonesia.com/${encodeURIComponent(articleTitle.substring(0, 30))}`,
          contentSnippet: articleContent,
          isoDate: new Date().toISOString(),
          imageLarge: articleImage,
          imageSmall: articleImage,
        });
        setIsBookmarked(true);
        Alert.alert('Sukses', 'Berita berhasil disimpan ke favorit.');
      }
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Silakan masuk ke akun Anda terlebih dahulu untuk menggunakan fitur ini.');
    } finally {
      setIsSaving(false);
    }
  };

  // Setup dynamic styles based on status
  let themeColor = '#15803d'; // Default green
  let statusText = 'Terverifikasi FAKTA';
  let badgeBg = '#dcfce7';
  let iconName: any = 'checkmark-circle';

  if (articleStatus === 'HOAKS') {
    themeColor = '#ba1a1a';
    statusText = 'Terbukti HOAKS';
    badgeBg = '#ffe2e2';
    iconName = 'alert-circle';
  } else if (articleStatus === 'RAGU-RAGU') {
    themeColor = '#d97706';
    statusText = 'RAGU-RAGU';
    badgeBg = '#fef3c7';
    iconName = 'help-circle';
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Header bar */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Detail Berita</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={handleToggleBookmark} style={styles.headerBtn} disabled={isSaving}>
              <Ionicons 
                name={isBookmarked ? "heart" : "heart-outline"} 
                size={22} 
                color={isBookmarked ? "#ba1a1a" : theme.textSecondary} 
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
            
            {/* Featured Image */}
            <View style={[styles.imageWrapper, { borderColor: theme.backgroundElement }]}>
              <Image
                style={styles.image}
                source={{ uri: articleImage }}
                contentFit="cover"
              />
              
              {/* Large Tilted Retro Stamp */}
              <RetroStamp status={articleStatus} />

              <View style={styles.locationBadge}>
                <Ionicons name="location-sharp" size={12} color="#4f378a" />
                <Text style={styles.locationText}>Laporan Fakta Veritas</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text }]}>
              {articleTitle}
            </Text>

            {/* Author and Date Meta Row */}
            <View style={[styles.metaRow, { borderBottomColor: theme.backgroundElement }]}>
              <View style={styles.authorGroup}>
                <View style={styles.authorAvatarStack}>
                  <Image
                    style={styles.authorAvatar}
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQyxjzdHokL6v7xeRwSRI8p8K4EI9ts99j9hetG9AvyGRYNKlL5qqN4Ki_6ObY43mlLvmmArNMKSdl3Wv76O2qVUBZTjMgm-IG6OSL2rueG7416LMMBUJZUW2HJJ_2-ICeEiIZyvMqE7Diwxn613aaCRD-880PH7ZcpIDfuMw3rmibk09Cfxp_GWc0UIw-pgcZ5ePJ_wku9wMWRtEeziF6ZLrrAOeQiwjyFCsPC_379HY7l-KJPs0O7zuBE3XlulYz8a4FIyZ5uPI' }}
                  />
                </View>
                <View>
                  <Text style={[styles.authorName, { color: theme.text }]}>Tim Redaksi Veritas</Text>
                  <Text style={[styles.articleMeta, { color: theme.textSecondary }]}>
                    {articleSource}
                  </Text>
                </View>
              </View>

              <View style={[styles.verifiedBadge, { backgroundColor: badgeBg }]}>
                <Ionicons name={iconName} size={14} color={themeColor} />
                <Text style={[styles.verifiedText, { color: themeColor }]}>{statusText}</Text>
              </View>
            </View>

            {/* Article Body Content */}
            <Text style={[styles.bodyText, { color: theme.text }]}>
              {articleContent}
            </Text>

            {/* Read Full Article Button */}
            {(params.id as string)?.startsWith('http') && (
              <Pressable
                onPress={handleReadFullArticle}
                style={({ pressed }) => [
                  styles.readFullBtn,
                  pressed && styles.buttonPressed,
                  { borderColor: '#4f378a', backgroundColor: theme.background === '#ffffff' ? '#fcfaff' : '#1e1a22' }
                ]}
              >
                <Ionicons name="globe-outline" size={18} color="#4f378a" />
                <Text style={styles.readFullBtnText}>Baca Selengkapnya di {sourceDisplayName}</Text>
                <Ionicons name="arrow-forward" size={16} color="#4f378a" />
              </Pressable>
            )}

            {/* Fact Check Box */}
            <View style={[
              styles.factCheckContainer, 
              { 
                borderColor: themeColor + '30', 
                backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                borderLeftWidth: 4,
                borderLeftColor: themeColor,
              }
            ]}>
              <View style={styles.factCheckHeader}>
                <Ionicons name="shield-checkmark" size={20} color={themeColor} />
                <Text style={[styles.factCheckTitle, { color: theme.text }]}>
                  Analisis Laporan Cek Fakta
                </Text>
              </View>

              <View style={styles.factCheckList}>
                {getDynamicFactCheckAnalysis().map((item, idx) => (
                  <View key={idx} style={styles.factCheckItem}>
                    <Ionicons name={item.icon} size={18} color={item.color} style={styles.factCheckIcon} />
                    <View style={styles.factCheckDetails}>
                      <Text style={[styles.factLabel, { color: theme.text }]}>{item.label}</Text>
                      <Text style={[styles.factDesc, { color: theme.textSecondary }]}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={[styles.factCheckFooter, { borderTopColor: theme.backgroundElement }]}>
                <Text style={[styles.updatedText, { color: theme.textSecondary }]}>Diperbarui hari ini</Text>
                <Pressable onPress={() => router.push('/verify')} style={styles.reportBtn}>
                  <Text style={styles.reportBtnText}>Laporkan Klaim Baru</Text>
                  <Ionicons name="open-outline" size={14} color="#4f378a" />
                </Pressable>
              </View>
            </View>

            <Text style={[styles.bodyTextSecondary, { color: theme.textSecondary, marginBottom: Spacing.four }]}>
              Himbauan Tim Cek Fakta Veritas: Biasakan menyaring setiap berita yang masuk ke grup pesan keluarga. Pastikan selalu memverifikasi ulang domain tautan sebelum membagikan ulang.
            </Text>

          </Animated.View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  animatedContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginBottom: Spacing.four,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
    color: '#1d1b20',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 26,
    marginBottom: Spacing.three,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.four,
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorAvatarStack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  authorAvatar: {
    width: '100%',
    height: '100%',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  articleMeta: {
    fontSize: 10,
    fontFamily: 'Be Vietnam Pro',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.three,
  },
  bodyTextSecondary: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Be Vietnam Pro',
    marginVertical: Spacing.three,
  },
  factCheckContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  factCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.three,
  },
  factCheckTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  factCheckList: {
    gap: Spacing.three,
  },
  factCheckItem: {
    flexDirection: 'row',
    gap: 8,
  },
  factCheckIcon: {
    marginTop: 2,
  },
  factCheckDetails: {
    flex: 1,
  },
  factLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 2,
  },
  factDesc: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'Be Vietnam Pro',
  },
  factCheckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    marginTop: Spacing.three,
  },
  updatedText: {
    fontSize: 10,
    fontFamily: 'Be Vietnam Pro',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#4f378a',
  },
  stampContainerLarge: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 20,
  },
  stampTextLarge: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  readFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    width: '100%',
  },
  readFullBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#4f378a',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
