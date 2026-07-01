import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';
import UserAvatar from 'react-native-user-avatar';

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

const classifyCategory = (title: string, content: string, isIndonesian = true): string => {
  const text = `${title} ${content}`.toLowerCase();

  // 1. Business / Bisnis
  if (
    text.includes('saham') || text.includes('ekonomi') || text.includes('bisnis') ||
    text.includes('keuangan') || text.includes('investasi') || text.includes('bsi') ||
    text.includes('bank') || text.includes('rupiah') || text.includes('inflasi') ||
    text.includes('ihsg') || text.includes('ojk') || text.includes('obligasi') ||
    text.includes('anggaran') || text.includes('fintech') || text.includes('perusahaan') ||
    text.includes('pasar modal') || text.includes('bumn') || text.includes('bunga bank') ||
    text.includes('tarif') || text.includes('pajak') || text.includes('subsidi') ||
    text.includes('rupiah') || text.includes('transaksi') || text.includes('perdagangan') ||
    text.includes('emiten') || text.includes('reksadana') || text.includes('investor') ||
    text.includes('finansial') || text.includes('deflasi') || text.includes('crypto') ||
    text.includes('kripto') || text.includes('bitcoin') || text.includes('neraca') ||
    text.includes('fiskal') || text.includes('moneter') || text.includes('pendapatan') ||
    text.includes('laba') || text.includes('rugi') || text.includes('omzet') ||
    text.includes('korporasi') || text.includes('startup') || text.includes('kuliner') ||
    text.includes('umkm') || text.includes('ritel') || text.includes('waralaba') ||
    text.includes('komoditas') || text.includes('minyak bumi') || text.includes('emas') ||
    text.includes('cukai') || text.includes('perbankan') || text.includes('utang') ||
    text.includes('kredit') || text.includes('pinjol') || text.includes('pinjaman online')
  ) {
    return isIndonesian ? 'Bisnis' : 'Business';
  }

  // 2. Technology / Teknologi
  if (
    text.includes('teknologi') || text.includes('gadget') || text.includes('smartphone') ||
    text.includes('android') || text.includes('ios') || text.includes('aplikasi') ||
    text.includes('ai ') || text.includes('artificial intelligence') || text.includes('chip') ||
    text.includes('komputer') || text.includes('internet') || text.includes('hacker') ||
    text.includes('siber') || text.includes('antariksa') || text.includes('nasa') ||
    text.includes('software') || text.includes('game') || text.includes('gaming') ||
    text.includes('robot') || text.includes('inovasi') || text.includes('digital') ||
    text.includes('science') || text.includes('sains') || text.includes('samsung') ||
    text.includes('apple') || text.includes('google') || text.includes('microsoft') ||
    text.includes('chatgpt') || text.includes('metaverse') || text.includes('blockchain') ||
    text.includes('cyber') || text.includes('malware') || text.includes('ransomware') ||
    text.includes('hardware') || text.includes('telekomunikasi') || text.includes('jaringan') ||
    text.includes('5g') || text.includes('starlink') || text.includes('satelit') ||
    text.includes('coding') || text.includes('programming') || text.includes('programmer') ||
    text.includes('data science') || text.includes('cloud') || text.includes('server') ||
    text.includes('semikonduktor') || text.includes('elektronik') || text.includes('luar angkasa') ||
    text.includes('astronomi') || text.includes('fisika') || text.includes('kimia') ||
    text.includes('matematika') || text.includes('kloning') || text.includes('dna') ||
    text.includes('bioteknologi') || text.includes('teleskop')
  ) {
    return isIndonesian ? 'Teknologi' : 'Technology';
  }

  // 3. Politics / Politik
  if (
    text.includes('politik') || text.includes('pemilu') || text.includes('pilkada') ||
    text.includes('dpr') || text.includes('kpu') || text.includes('presiden') ||
    text.includes('mentri') || text.includes('menteri') || text.includes('koalisi') ||
    text.includes('partai') || text.includes('kabinet') || text.includes('gubernur') ||
    text.includes('walikota') || text.includes('bupati') || text.includes('kebijakan') ||
    text.includes('uu ') || text.includes('undang-undang') || text.includes('kpk') ||
    text.includes('hukum') || text.includes('sidang') || text.includes('diplomasi') ||
    text.includes('negara') || text.includes('pemerintah') || text.includes('senat') ||
    text.includes('demokrasi') || text.includes('oposisi') || text.includes('caleg') ||
    text.includes('capres') || text.includes('cawapres') || text.includes('koalisi') ||
    text.includes('parlemen') || text.includes('konstitusi') || text.includes('mk ') ||
    text.includes('mahkamah') || text.includes('jaksa') || text.includes('hakim') ||
    text.includes('tni') || text.includes('polri') || text.includes('kapolri') ||
    text.includes('korupsi') || text.includes('suap') || text.includes('gratifikasi') ||
    text.includes('demonstrasi') || text.includes('unjuk rasa') || text.includes('birokrasi') ||
    text.includes('asn') || text.includes('pns') || text.includes('diplomatik') ||
    text.includes('luar negeri') || text.includes('perdana menteri') || text.includes('dprd') ||
    text.includes('dpd') || text.includes('gerindra') || text.includes('pdi-p') ||
    text.includes('golkar') || text.includes('nasdem') || text.includes('pkb') ||
    text.includes('pks') || text.includes('demokrat') || text.includes('pan') ||
    text.includes('ppp')
  ) {
    return isIndonesian ? 'Politik' : 'Politics';
  }

  // 4. Sports / Olahraga
  if (
    text.includes('olahraga') || text.includes('sepak bola') || text.includes('sepakbola') ||
    text.includes('liga') || text.includes('klub') || text.includes('pemain') ||
    text.includes('timnas') || text.includes('pertandingan') || text.includes('juara') ||
    text.includes('atlet') || text.includes('bulu tangkis') || text.includes('badminton') ||
    text.includes('motogp') || text.includes('formula 1') || text.includes('f1') ||
    text.includes('piala dunia') || text.includes('olimpiade') || text.includes('medali') ||
    text.includes('skor') || text.includes('kemenangan') || text.includes('turnamen') ||
    text.includes('pelatih') || text.includes('pssi') || text.includes('fifa') ||
    text.includes('gelar') || text.includes('sirkuit') || text.includes('balapan') ||
    text.includes('klasemen') || text.includes('stadion') || text.includes('transfer') ||
    text.includes('kontrak') || text.includes('semifinal') || text.includes('final') ||
    text.includes('perempat final') || text.includes('bola basket') || text.includes('nba') ||
    text.includes('tenis') || text.includes('tinju') || text.includes('ufc') ||
    text.includes('mma') || text.includes('bulutangkis') || text.includes('atletik') ||
    text.includes('maraton') || text.includes('renang')
  ) {
    return isIndonesian ? 'Olahraga' : 'Sports';
  }

  // 5. Health / Kesehatan
  if (
    text.includes('kesehatan') || text.includes('sehat') || text.includes('penyakit') ||
    text.includes('dokter') || text.includes('rumah sakit') || text.includes('klinis') ||
    text.includes('obat') || text.includes('vaksin') || text.includes('virus') ||
    text.includes('pandemi') || text.includes('gejala') || text.includes('stres') ||
    text.includes('diet') || text.includes('nutrisi') || text.includes('bpjs') ||
    text.includes('kanker') || text.includes('jantung') || text.includes('medis') ||
    text.includes('gizi') || text.includes('terapi') || text.includes('mental') ||
    text.includes('klinik') || text.includes('puskesmas') || text.includes('farmasi') ||
    text.includes('apotek') || text.includes('idi') || text.includes('kemenkes') ||
    text.includes('who') || text.includes('wabah') || text.includes('kolesterol') ||
    text.includes('diabetes') || text.includes('tensi') || text.includes('darah tinggi') ||
    text.includes('imunitas') || text.includes('suplemen') || text.includes('vitamin') ||
    text.includes('psikolog') || text.includes('depresi') || text.includes('terapis') ||
    text.includes('obesitas') || text.includes('gaya hidup sehat') || text.includes('olahraga sehat') ||
    text.includes('nutrisional')
  ) {
    return isIndonesian ? 'Kesehatan' : 'Health';
  }

  // 6. Entertainment / Hiburan
  if (
    text.includes('hiburan') || text.includes('film') || text.includes('musik') ||
    text.includes('lagu') || text.includes('konser') || text.includes('artis') ||
    text.includes('selebriti') || text.includes('aktor') || text.includes('aktris') ||
    text.includes('cinema') || text.includes('bioskop') || text.includes('sutradara') ||
    text.includes('drama') || text.includes('k-pop') || text.includes('kpop') ||
    text.includes('anime') || text.includes('manga') || text.includes('showbiz') ||
    text.includes('festival') || text.includes('netflix') || text.includes('streaming') ||
    text.includes('singel') || text.includes('album') || text.includes('band') ||
    text.includes('penyanyi') || text.includes('selebgram') || text.includes('influencer') ||
    text.includes('gosip') || text.includes('infotainment') || text.includes('komedi') ||
    text.includes('stand-up') || text.includes('tontonan') || text.includes('teater') ||
    text.includes('fashion') || text.includes('model') || text.includes('glamor') ||
    text.includes('karpet merah')
  ) {
    return isIndonesian ? 'Hiburan' : 'Entertainment';
  }

  const demoCats = isIndonesian 
    ? ['Politik', 'Teknologi', 'Kesehatan', 'Olahraga', 'Hiburan', 'Bisnis']
    : ['Politics', 'Technology', 'Health', 'Sports', 'Entertainment', 'Business'];
  return demoCats[title.length % demoCats.length];
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState('Top News');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [totalNews, setTotalNews] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [topCategory, setTopCategory] = useState('-');
  const [topCategoryPercent, setTopCategoryPercent] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  const isAdmin = apiClient.getUser().role === 'ADMIN';
  const categories = ['Top News', 'Politik', 'Olahraga', 'Teknologi', 'Kesehatan', 'Bisnis', 'Hiburan'];

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
        // Fetch 100 items for rich real-time statistics analysis
        const result = await apiClient.fetchNews(1, 100);
        if (result && result.data && result.data.length > 0) {
          const mapped: Article[] = result.data.map((item: any) => {
            const src = item.sourceName || 'Berita';
            const sourceLabel = (() => {
              const s = src.toLowerCase();
              if (s.includes('cnbc')) return 'CNBC Indonesia';
              if (s.includes('cnn')) return 'CNN Indonesia';
              if (s.includes('tempo')) return 'Tempo.co';
              if (s.includes('kumparan')) return 'Kumparan';
              if (s.includes('republika')) return 'Republika';
              return src;
            })();
            const sourceNameLabel = sourceLabel;
            return {
              id: item.link,
              category: classifyCategory(item.title || '', item.contentSnippet || '', true),
              title: item.title,
              source: sourceNameLabel,
              time: item.isoDate ? new Date(item.isoDate).toLocaleDateString('id-ID') : 'Baru saja',
              image: item.image?.large || item.image?.small || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
              verified: true,
              status: 'FAKTA',
              content: item.contentSnippet || '',
            };
          });

          // Calculate category distribution dynamically from the 100 fetched articles
          const catCounts: Record<string, number> = {};
          mapped.forEach((art) => {
            catCounts[art.category] = (catCounts[art.category] || 0) + 1;
          });

          let maxCat = '-';
          let maxCount = 0;
          Object.entries(catCounts).forEach(([cat, count]) => {
            if (count > maxCount) {
              maxCount = count;
              maxCat = cat;
            }
          });

          const percent = mapped.length > 0 ? Math.round((maxCount / mapped.length) * 100) : 0;
          setTopCategory(maxCat);
          setTopCategoryPercent(percent);
          setTotalNews(result.totalItems || mapped.length);
          setArticles(mapped.slice(0, 12));
        } else {
          setArticles(fallbackArticles);
        }

        // Fetch real database bookmarks count if logged in
        if (apiClient.getToken()) {
          const bookmarkResult = await apiClient.fetchBookmarks();
          if (bookmarkResult && bookmarkResult.bookmarks) {
            setBookmarkCount(bookmarkResult.bookmarks.length);
          }
        } else {
          setBookmarkCount(0);
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
            <Ionicons name="search" size={22} color="#00ca92" style={styles.searchIcon} />
            <Text style={[styles.brandText, { color: '#00ca92' }]}>Veros</Text>
          </View>
          <View style={styles.headerRight}>
            <Link href="/report-hoax" asChild>
              <Pressable style={({ pressed }) => [styles.headerReportBtn, pressed && { opacity: 0.85 }]}>
                <Ionicons name="megaphone-outline" size={14} color="#00ca92" style={{ marginRight: 6 }} />
                <Text style={styles.headerReportText}>Laporkan Hoaks</Text>
              </Pressable>
            </Link>
            <Link href="/profile" asChild>
              <Pressable style={styles.avatarWrapper}>
                {apiClient.getUser().id ? (
                  <UserAvatar
                    size={36}
                    name={apiClient.getUser().fullName || apiClient.getUser().email || 'User'}
                    bgColor="#00ca92"
                    textColor="#ffffff"
                  />
                ) : (
                  <View style={styles.emptyAvatar}>
                    <Ionicons name="person" size={18} color="#00ca92" />
                  </View>
                )}
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
              <Text style={[styles.greetingText, { color: theme.textSecondary }]}>Halo, Teman Veros</Text>
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
                        ? { backgroundColor: '#00ca92', borderColor: '#00ca92' }
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
                              backgroundColor: '#00ca92',
                            },
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>

                {/* Bento Grid: Aduan Resmi & Cek Mandiri */}
                <View style={styles.bentoRow}>
                  {/* Aduan Resmi Card */}
                  <Pressable 
                    onPress={() => router.push('/guide-detail?type=aduan')}
                    style={({ pressed }) => [
                      styles.factDayCard,
                      pressed && { opacity: 0.85 }
                    ]}
                  >
                    <LinearGradient
                      colors={['#1a73e8', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.cardHeaderWithIcon}>
                      <Text style={styles.factDaySub}>PANDUAN INSTANSI</Text>
                      <Ionicons name="megaphone-outline" size={15} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.factDayTitle}>Aduan Resmi</Text>
                      <Text style={styles.factDayDesc}>Cara melaporkan hoaks ke Komdigi & instansi berwenang.</Text>
                    </View>
                  </Pressable>

                  {/* Cek Mandiri Card */}
                  <Pressable 
                    onPress={() => router.push('/guide-detail?type=edukasi')}
                    style={({ pressed }) => [
                      styles.factDayCard,
                      pressed && { opacity: 0.85 }
                    ]}
                  >
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.cardHeaderWithIcon}>
                      <Text style={styles.factDaySub}>METODE VERIFIKASI</Text>
                      <Ionicons name="shield-checkmark-outline" size={15} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.factDayTitle}>Cek Mandiri</Text>
                      <Text style={styles.factDayDesc}>3 langkah mudah memverifikasi kebenaran informasi mandiri.</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Admin Moderation Entry Banner */}
                {isAdmin && (
                  <Pressable
                    onPress={() => router.push('/admin-moderation')}
                    style={({ pressed }) => [
                      styles.adminBanner,
                      { 
                        backgroundColor: theme.background === '#ffffff' ? 'rgba(79, 55, 138, 0.05)' : 'rgba(255, 255, 255, 0.04)',
                        borderColor: theme.background === '#ffffff' ? 'rgba(79, 55, 138, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                      },
                      pressed && { opacity: 0.85 }
                    ]}
                  >
                    <View style={styles.adminBannerContent}>
                      <View style={styles.adminBannerTextCol}>
                        <View style={[styles.adminBadgeRow, { backgroundColor: theme.background === '#ffffff' ? 'rgba(79, 55, 138, 0.1)' : 'rgba(255, 255, 255, 0.1)' }]}>
                          <Ionicons name="shield-half" size={12} color="#00ca92" style={{ marginRight: 4 }} />
                          <Text style={[styles.adminBadgeText, { color: '#00ca92' }]}>ADMIN ACCESS</Text>
                        </View>
                        <Text style={[styles.adminBannerTitle, { color: theme.text }]}>Verifikasi Laporan Hoaks</Text>
                        <Text style={[styles.adminBannerSub, { color: theme.textSecondary }]}>Tinjau aduan terbaru yang dikirimkan oleh pengguna aplikasi.</Text>
                      </View>
                      <View style={[styles.adminBannerArrow, { backgroundColor: '#00ca92' }]}>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                      </View>
                    </View>
                  </Pressable>
                )}
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
    gap: 16,
  },
  headerReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79, 55, 138, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ca92',
  },
  headerReportText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#00ca92',
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
  emptyAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(79, 55, 138, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    borderRadius: 12,
    padding: Spacing.four,
    justifyContent: 'space-between',
    minHeight: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  factDaySub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
    marginRight: 8,
    flexShrink: 1,
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
  adminBanner: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: Spacing.five,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  adminBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  adminBannerTextCol: {
    flex: 1,
    gap: 4,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  adminBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  adminBannerSub: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 16,
  },
  adminBannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
