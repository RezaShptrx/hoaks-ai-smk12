import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

const { width: screenWidth } = Dimensions.get('window');

interface Article {
  id: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image: string;
  verified: boolean;
  status: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU';
  content: string;
}

// Retro Stamp Component
const RetroStamp = ({ status, size = 'normal' }: { status: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU', size?: 'normal' | 'small' }) => {
  let text = 'FAKTA';
  let color = '#15803d'; // Green
  if (status === 'HOAKS') {
    text = 'HOAKS';
    color = '#ba1a1a'; // Red
  } else if (status === 'RAGU-RAGU') {
    text = 'RAGU';
    color = '#d97706'; // Amber
  }

  const containerStyle = size === 'small' ? styles.stampContainerSmall : styles.stampContainer;
  const textStyle = size === 'small' ? styles.stampTextSmall : styles.stampText;

  return (
    <View style={[containerStyle, { borderColor: color }]}>
      <Text style={[textStyle, { color: color }]}>{text}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('Top News');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const categories = ['Top News', 'Politik', 'Olahraga', 'Teknologi', 'Kesehatan'];

  const breakingNews: Article = {
    id: 'b1',
    category: 'Breaking News',
    title: 'Perjanjian Perdagangan Hijau Global Disahkan di KTT Jenewa.',
    source: 'BBC Global',
    time: 'Baru saja',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
    verified: true,
    status: 'FAKTA',
    content: 'Para pemimpin dunia mencapai konsensus bersejarah mengenai protokol pajak karbon setelah negosiasi intensif selama tiga hari di Jenewa.'
  };

  const fallbackArticles: Article[] = [
    {
      id: 't1',
      category: 'Politik',
      title: 'Kebijakan baru di kota-kota besar menargetkan perluasan ruang hijau dua kali lipat pada tahun 2030.',
      source: 'BBC News',
      time: '2 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnqMY2PCX-LMxd8nCta-JgFntsxKM5F-HbjdA4OmhGpgdnFGRn0kVMECTjNLHPh1fHGVNTBFfzqwtCRuxsrBC8JORpK0Q-aXm-LVHhi2hhjfAAyeYMPBVAWeRUSe-M8OUc4O3avy3ukkr6dr8Ro4_zE7VBj9-jZQMmBZf7QNPUsUwbwoxk8EfGYs4x5IUnZV0bcnxULlPpjCkAEPZ_inQgjaS7y5r6Y8UNz7-NuNc-H1CzTBXjLC7ti0n3RE5uRyZtkGGQFjOQhIc',
      verified: true,
      status: 'FAKTA',
      content: 'Dewan kota menyetujui anggaran pendanaan infrastruktur hijau untuk mengurangi dampak pemanasan global di area perkotaan padat penduduk.'
    },
    {
      id: 't2',
      category: 'Kesehatan',
      title: 'Terobosan teknologi kesehatan dapat mendeteksi tingkat stres secara real-time via keringat.',
      source: 'HealthLine',
      time: '5 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxBqA6qdqcagQePgf0-SzNPLAvTLYmW_s8p7RwX__xYMtJDlYPIHwFVolPEZfkF0eJ8CKOHStvHO1OHd1LRX4kusirD4i5fqaqspyVBtC4amUYy3YodC4t6R_LplppNYx4Wud215c4O4FAIeY9G4GQcRl-d-YCwSOQEEOwE4908E06-SNOZnypCf6IRT3c49PIkA_WdowMah9BtL-LO2Qe-swi2oW9WBiGbOWCLCkL1BT2pDgF_WvZSwjvMkkr6MZxvSKE45EY8wE',
      verified: false,
      status: 'RAGU-RAGU',
      content: 'Sensor biometrik mini terbaru dapat diintegrasikan ke jam tangan pintar untuk melacak detak jantung mikro dan perubahan kortisol, namun klaim deteksi stres via keringat belum diuji klinis resmi.'
    },
    {
      id: 't3',
      category: 'Teknologi',
      title: 'Pembagian Subsidi Listrik Rp1.000.000 Lewat Akun Telegram Kementerian BUMN.',
      source: 'Grup WA Keluarga',
      time: '8 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzy_KoWzpkENrYHKFw5rGi8uU_Z4lvRoKMx4zpvh0jLVlZU13iqbWgHqT4DBOza1oj8tXM2sAvtl25i7en3OMJOKsm16DSgYRXJDsxUrUBoVOj0M4zuRH3VLihM0ooCT-ZHrhx7iBGd64KEG4K1e0hjx2XBkm-iHoKGNU8DKjYaqWGMv99M7ms_eyTqQWKCU8XIao8AKKBYUdbVr1zK6V2OZ4PyOPMQSlDbKVSJqblAfkOA-RV_0cpxrfs3J3xIj4fbvxIY-7wGJI',
      verified: false,
      status: 'HOAKS',
      content: 'Pesan berantai beredar mengeklaim adanya pembagian saldo subsidi token listrik Rp1 juta mengatasnamakan Kementerian BUMN via bot Telegram. Pihak PLN mengonfirmasi bahwa link ini adalah upaya penipuan phishing data nasabah.'
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedCategory, articles]);

  useEffect(() => {
    const loadNewsFromBackend = async () => {
      setIsLoadingNews(true);
      try {
        const result = await apiClient.fetchNews(1, 12);
        if (result && result.data && result.data.length > 0) {
          const mapped: Article[] = result.data.map((item: any) => {
            const src = item.sourceName || 'Berita';
            // Map sourceName to proper display label
            const sourceLabel = (() => {
              const s = src.toLowerCase();
              if (s.includes('cnbc')) return 'CNBC Indonesia';
              if (s.includes('cnn')) return 'CNN Indonesia';
              if (s.includes('tempo')) return 'Tempo.co';
              if (s.includes('kumparan')) return 'Kumparan';
              if (s.includes('republika')) return 'Republika';
              return src;
            })();
            return {
              id: item.link,
              category: sourceLabel,
              title: item.title,
              source: src, // keep raw for news-detail lookup
              time: item.isoDate ? new Date(item.isoDate).toLocaleDateString('id-ID') : 'Baru saja',
              image: item.image?.large || item.image?.small || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
              verified: true,
              status: 'FAKTA',
              content: item.contentSnippet || '',
            };
          });
          setArticles(mapped);
        } else {
          setArticles(fallbackArticles);
        }
      } catch (error) {
        console.warn('Gagal memuat berita dari backend. Memakai data statis.', error);
        setArticles(fallbackArticles);
      } finally {
        setIsLoadingNews(false);
      }
    };
    loadNewsFromBackend();
  }, []);

  const breakingNewsSlides = articles.length > 0
    ? articles.slice(0, 3)
    : [breakingNews];

  const filteredArticles = selectedCategory === 'Top News' 
    ? articles 
    : articles.filter(art => art.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="search" size={22} color="#4f378a" style={styles.searchIcon} />
            <Text style={[styles.brandText, { color: '#4f378a' }]}>Valid.</Text>
          </View>
          <View style={styles.headerRight}>
            <Link href="/report-hoax" asChild>
              <Pressable style={styles.headerMegaphoneBtn}>
                <Ionicons name="megaphone-outline" size={18} color="#4f378a" />
              </Pressable>
            </Link>
            <Link href="/profile" asChild>
              <Pressable style={styles.avatarWrapper}>
                <Image
                  style={styles.avatar}
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbhLLtMeXa1lE3ChTj8-dSYlq3AX5W9xMLZ95apEpF0_DcsBNgONALSC6mCl3Gnd7jzfTPD3v7qCyBxaEkGn0ii2Np1sR1g8w34pbuEbi0JennmtqieQC63SdYFA1vRAv-sI7vP8AgTbcVuT7G3rAQEHrhUnOhzz01-ERNTjd2Rlxeti-p1g_cwy47PuJIcvmhBH_bBdNKcfwXsV0gdRWpDraPAeRUjRUgaVVyoutyURrvmrZyBSN7-becXzmUQYV9UvEx4cZcc20',
                  }}
                  contentFit="cover"
                />
              </Pressable>
            </Link>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            {/* Welcome Greeting */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.greetingText, { color: theme.textSecondary }]}>Halo, Teman Valid</Text>
              <Text style={[styles.welcomeTitle, { color: theme.text }]}>Jelajahi Fakta Hari Ini</Text>
            </View>

            {/* Scrollable Categories Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
              style={styles.categoriesContainer}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isActive
                        ? { backgroundColor: '#4f378a', borderColor: '#4f378a' }
                        : { backgroundColor: theme.background === '#ffffff' ? '#f4f0f6' : '#232025', borderColor: theme.backgroundElement }
                    ]}>
                    <Text style={[
                      styles.categoryChipText,
                      isActive ? { color: '#ffffff', fontWeight: '700' } : { color: theme.textSecondary }
                    ]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedCategory === 'Top News' && (
              <>
                {/* Breaking News Slideshow Carousel */}
                <View style={{ marginBottom: Spacing.four }}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                      { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                  >
                    {breakingNewsSlides.map((slide, index) => (
                      <Pressable
                        key={slide.id || index}
                        onPress={() => router.push({
                          pathname: '/news-detail',
                          params: { id: slide.id, title: slide.title, content: slide.content, image: slide.image, source: slide.source, status: slide.status || 'FAKTA' }
                        })}
                        style={[
                          styles.breakingNewsCard, 
                          { 
                            width: screenWidth - Spacing.four * 2, 
                            marginHorizontal: 0,
                            borderColor: theme.backgroundElement, 
                            backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' 
                          }
                        ]}
                      >
                        <View style={styles.breakingImageContainer}>
                          <Image
                            style={styles.breakingImage}
                            source={{ uri: slide.image }}
                            contentFit="cover"
                          />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            style={styles.breakingGradient}
                          />
                          
                          {/* Retro Stamp Overlay */}
                          <RetroStamp status={slide.status || 'FAKTA'} size="normal" />

                          <View style={styles.breakingBadge}>
                            <Text style={styles.breakingBadgeText}>BREAKING NEWS</Text>
                          </View>
                          
                          <View style={styles.breakingTextOverlay}>
                            <View style={styles.verifiedRow}>
                              <Ionicons name="checkmark-circle" size={14} color="#e7c365" />
                              <Text style={styles.verifiedSourceText}>{slide.source}</Text>
                            </View>
                            <Text style={styles.breakingHeadline} numberOfLines={2}>
                              {slide.title}
                            </Text>
                            <Text style={styles.breakingDesc} numberOfLines={2}>
                              {slide.content}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Indicator Dots */}
                  <View style={styles.dotContainer}>
                    {breakingNewsSlides.map((_, index) => {
                      const width = scrollX.interpolate({
                        inputRange: [
                          (index - 1) * (screenWidth - Spacing.four * 2),
                          index * (screenWidth - Spacing.four * 2),
                          (index + 1) * (screenWidth - Spacing.four * 2),
                        ],
                        outputRange: [8, 16, 8],
                        extrapolate: 'clamp',
                      });
                      const opacity = scrollX.interpolate({
                        inputRange: [
                          (index - 1) * (screenWidth - Spacing.four * 2),
                          index * (screenWidth - Spacing.four * 2),
                          (index + 1) * (screenWidth - Spacing.four * 2),
                        ],
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: 'clamp',
                      });
                      return (
                        <Animated.View
                          key={index}
                          style={[
                            styles.dot,
                            {
                              width,
                              opacity,
                              backgroundColor: '#4f378a',
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>

                {/* Bento Statistics Grid Row */}
                <View style={styles.bentoRow}>
                  {/* Fact of Day */}
                  <LinearGradient
                    colors={['#4f378a', '#765b00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.factDayCard}>
                    <Text style={styles.factDaySub}>FAKTA HARI INI</Text>
                    <Text style={styles.factDayTitle}>Akurasi cek fakta AI kini tembus 98%.</Text>
                    <Text style={styles.factDayDesc}>Protokol validasi Valid. terbaru menurunkan laju hoaks hingga 40%.</Text>
                  </LinearGradient>

                  {/* Active Verifiers */}
                  <View style={[styles.verifiersCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#fcfaff' : '#1b191c' }]}>
                    <View style={styles.verifiersHeader}>
                      <Text style={[styles.verifiersSub, { color: theme.textSecondary }]}>Verifikator Aktif</Text>
                      <Ionicons name="shield" size={24} color="#765b00" />
                    </View>
                    <Text style={[styles.verifiersCount, { color: theme.text }]}>12.4k</Text>
                    <Text style={[styles.verifiersDesc, { color: theme.textSecondary }]}>Komunitas penegak fakta</Text>
                  </View>
                </View>
              </>
            )}

            {/* Trending / Articles Section */}
            <View style={styles.articlesSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {selectedCategory === 'Top News' ? 'Berita Terkini' : `Berita ${selectedCategory}`}
                </Text>
              </View>

              <View style={styles.articlesList}>
                {filteredArticles.map((art) => (
                  <Pressable
                    key={art.id}
                    onPress={() => router.push({
                      pathname: '/news-detail',
                      params: { id: art.id, title: art.title, content: art.content, image: art.image, source: art.source, status: art.status }
                    })}
                    style={[
                      styles.articleCard,
                      {
                        borderColor: theme.backgroundElement,
                        backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                      }
                    ]}>
                    <View style={{ position: 'relative' }}>
                      <Image
                        style={styles.articleImage}
                        source={{ uri: art.image }}
                        contentFit="cover"
                      />
                      {/* Retro Stamp Over Image */}
                      <RetroStamp status={art.status} size="small" />
                    </View>
                    <View style={styles.articleDetails}>
                      <Text style={[styles.articleHeadline, { color: theme.text }]} numberOfLines={2}>
                        {art.title}
                      </Text>
                      <View style={styles.articleFooter}>
                        <Ionicons name="globe-outline" size={12} color={theme.textSecondary} />
                        <Text style={[styles.articleMeta, { color: theme.textSecondary }]}>
                          {art.source} • {art.time}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

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
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    padding: 6,
    borderRadius: 20,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMegaphoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 55, 138, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  animatedContent: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  welcomeSection: {
    marginBottom: Spacing.four,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Be Vietnam Pro',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  categoriesContainer: {
    marginBottom: Spacing.four,
  },
  categoriesScroll: {
    gap: 8,
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  breakingNewsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  breakingImageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
  },
  breakingImage: {
    width: '100%',
    height: '100%',
  },
  breakingGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  breakingBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  breakingBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
  },
  breakingTextOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  verifiedSourceText: {
    color: '#e7c365',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  breakingHeadline: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 22,
    marginBottom: 4,
  },
  breakingDesc: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 16,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  factDayCard: {
    flex: 1.2,
    borderRadius: 24,
    padding: Spacing.four,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  factDaySub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
  },
  factDayTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
    marginTop: 4,
  },
  factDayDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 14,
    marginTop: 4,
  },
  verifiersCard: {
    flex: 1,
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  verifiersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiersSub: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  verifiersCount: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  verifiersDesc: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  articlesSection: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  articlesList: {
    gap: Spacing.three,
  },
  articleCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 10,
    gap: 12,
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  articleDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  articleHeadline: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
  },
  articleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleMeta: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  stampContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderWidth: 2.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 20,
  },
  stampText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stampContainerSmall: {
    position: 'absolute',
    bottom: 2,
    right: -4,
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    transform: [{ rotate: '-10deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 20,
  },
  stampTextSmall: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
