import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

interface FavoriteArticle {
  id: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image: string;
  verified: boolean;
  content: string;
}

export default function FavoriteScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fallbackFavorites: FavoriteArticle[] = [
    {
      id: 't1',
      category: 'Politik',
      title: 'Kebijakan baru di kota-kota besar menargetkan perluasan ruang hijau dua kali lipat pada tahun 2030.',
      source: 'BBC News',
      time: '2 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnqMY2PCX-LMxd8nCta-JgFntsxKM5F-HbjdA4OmhGpgdnFGRn0kVMECTjNLHPh1fHGVNTBFfzqwtCRuxsrBC8JORpK0Q-aXm-LVHhi2hhjfAAyeYMPBVAWeRUSe-M8OUc4O3avy3ukkr6dr8Ro4_zE7VBj9-jZQMmBZf7QNPUsUwbwoxk8EfGYs4x5IUnZV0bcnxULlPpjCkAEPZ_inQgjaS7y5r6Y8UNz7-NuNc-H1CzTBXjLC7ti0n3RE5uRyZtkGGQFjOQhIc',
      verified: true,
      content: 'Dewan kota menyetujui anggaran pendanaan infrastruktur hijau untuk mengurangi dampak pemanasan global di area perkotaan padat penduduk.'
    },
    {
      id: 't3',
      category: 'Teknologi',
      title: 'Investasi energi terbarukan melonjak seiring stabilnya harga bahan bakar fosil dunia.',
      source: 'Re-Wire',
      time: '8 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzy_KoWzpkENrYHKFw5rGi8uU_Z4lvRoKMx4zpvh0jLVlZU13iqbWgHqT4DBOza1oj8tXM2sAvtl25i7en3OMJOKsm16DSgYRXJDsxUrUBoVOj0M4zuRH3VLihM0ooCT-ZHrhx7iBGd64KEG4K1e0hjx2XBkm-iHoKGNU8DKjYaqWGMv99M7ms_eyTqQWKCU8XIao8AKKBYUdbVr1zK6V2OZ4PyOPMQSlDbKVSJqblAfkOA-RV_0cpxrfs3J3xIj4fbvxIY-7wGJI',
      verified: true,
      content: 'Proyek turbin angin lepas pantai dan ladang sel surya skala besar mendapatkan suntikan dana segar dari konsorsium bank global.'
    }
  ];

  const loadBookmarks = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.fetchBookmarks();
      if (result && result.bookmarks) {
        const mapped = result.bookmarks.map((bm: any) => ({
          id: String(bm.id),
          category: 'Berita',
          title: bm.title,
          source: 'CNN Indonesia',
          time: bm.isoDate ? new Date(bm.isoDate).toLocaleDateString('id-ID') : 'Baru saja',
          image: bm.imageLarge || bm.imageSmall || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
          verified: true,
          content: bm.contentSnippet || '',
        }));
        setFavorites(mapped);
      } else {
        setFavorites(fallbackFavorites);
      }
    } catch (error) {
      console.warn('Failed to load bookmarks from backend. Using static fallback.', error);
      setFavorites(fallbackFavorites);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    loadBookmarks();
  }, []);

  const totalPages = Math.ceil(favorites.length / itemsPerPage) || 1;
  const paginatedFavorites = favorites.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRemoveFavorite = async (id: string) => {
    try {
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        await apiClient.removeBookmark(numericId);
      }
    } catch (error) {
      console.warn('Failed to delete bookmark on backend. Removing locally.', error);
    }
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    
    // Adjust page if current page has no more items
    const newTotalPages = Math.ceil(updated.length / itemsPerPage) || 1;
    if (page > newTotalPages) {
      setPage(newTotalPages);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/profile');
            }
          }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.brandText, { color: '#4f378a' }]}>Favorit</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Artikel dan berita cek fakta yang Anda simpan untuk dibaca nanti.
            </Text>

            {favorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-dislike-outline" size={64} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Belum ada berita favorit.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.listContainer}>
                  {paginatedFavorites.map((art) => (
                    <View
                      key={art.id}
                      style={[
                        styles.card,
                        {
                          borderColor: theme.backgroundElement,
                          backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                        }
                      ]}>
                      <Pressable
                        style={styles.cardPressable}
                        onPress={() => router.push({
                          pathname: '/news-detail',
                          params: { id: art.id, title: art.title, content: art.content, image: art.image, source: art.source }
                        })}>
                        <Image
                          style={styles.cardImage}
                          source={{ uri: art.image }}
                          contentFit="cover"
                        />
                        <View style={styles.cardDetails}>
                          <Text style={[styles.cardHeadline, { color: theme.text }]} numberOfLines={2}>
                            {art.title}
                          </Text>
                          <View style={styles.cardFooter}>
                            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
                              {art.source}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                      <Pressable 
                        onPress={() => handleRemoveFavorite(art.id)}
                        style={styles.removeBtn}>
                        <Ionicons name="heart" size={22} color="#ba1a1a" />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {/* Pagination Controls */}
                <View style={styles.paginationRow}>
                  <Pressable
                    disabled={page === 1}
                    onPress={() => setPage(prev => Math.max(1, prev - 1))}
                    style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled, { borderColor: theme.backgroundElement }]}
                  >
                    <Ionicons name="chevron-back" size={16} color={page === 1 ? '#ccc' : theme.text} />
                    <Text style={[styles.pageBtnText, { color: page === 1 ? '#ccc' : theme.text }]}>Sebelumnya</Text>
                  </Pressable>
                  
                  <Text style={[styles.pageIndicatorText, { color: theme.textSecondary }]}>
                    Halaman {page} dari {totalPages}
                  </Text>
                  
                  <Pressable
                    disabled={page === totalPages}
                    onPress={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled, { borderColor: theme.backgroundElement }]}
                  >
                    <Text style={[styles.pageBtnText, { color: page === totalPages ? '#ccc' : theme.text }]}>Selanjutnya</Text>
                    <Ionicons name="chevron-forward" size={16} color={page === totalPages ? '#ccc' : theme.text} />
                  </Pressable>
                </View>
              </View>
            )}
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
    paddingHorizontal: Spacing.four,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  animatedContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.four,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  listContainer: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  cardPressable: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingRight: 32,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cardHeadline: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMeta: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  removeBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 6,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.five,
    paddingHorizontal: 4,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
});
