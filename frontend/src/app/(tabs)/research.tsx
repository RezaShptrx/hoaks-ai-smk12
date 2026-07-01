import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  source: string;
  time: string;
  image: string;
  status: 'VALID' | 'HOAX' | 'RAGU-RAGU';
  color: string;
  content: string;
  description?: string;
  isFeatured?: boolean;
}

// Retro Stamp Component
const RetroStamp = ({ status, size = 'normal' }: { status: 'VALID' | 'HOAX' | 'RAGU-RAGU', size?: 'normal' | 'small' }) => {
  let text = 'FAKTA';
  let color = '#15803d'; // Green
  if (status === 'HOAX') {
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

const classifyCategory = (title: string, content: string): string => {
  const text = `${title} ${content}`.toLowerCase();

  // 1. Business
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
    return 'Business';
  }

  // 2. Technology
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
    return 'Technology';
  }

  // 3. Politics
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
    return 'Politics';
  }

  // 4. Sports
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
    return 'Sports';
  }

  // 5. Health
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
    return 'Health';
  }

  // 6. Entertainment
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
    return 'Entertainment';
  }

  const demoCats = ['Politics', 'Technology', 'Health', 'Sports', 'Entertainment', 'Business'];
  return demoCats[title.length % demoCats.length];
};

export default function ResearchScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = ['All', 'Politics', 'Sports', 'Health', 'Entertainment', 'Technology', 'Business'];
  const sources = ['All', 'CNN', 'CNBC', 'TEMPO', 'KUMPARAN', 'REPUBLIKA'];

  const newsDatabase: NewsItem[] = [
    {
      id: 'r1',
      category: 'Politics',
      title: 'Global Summit Outlines New Transparency Standards for Digital Information',
      source: 'Reuters',
      time: '2 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmzqeEvQRQrowcxxJ1hEqTiHf29qZZgOBe0cWOQzTt8nL5bl_i_lKaMjcTDFVDnATbq-hOrMiyo9p1VocTzqC4b_tzR62YBFVYCfmGeDOs0PWKCtNbeFtnnQNNpb677kkQTQyT2V545cKbAXHGIv7V3w7FLtiG1Pc3ky2jmDmSgMzjP5pssM8phh4CeBRJzBqw6Ph11Iw7fX1d2x4w_Ta2QWgK55ZqUYIWCWefr9GVEgWX0FSydPiIx_6zKQXazQL-shoEeHNlpeg',
      status: 'VALID',
      color: '#00ca92',
      content: 'A global summit of tech leaders and policy makers has agreed on a draft framework for info verification standards.',
    },
    {
      id: 'r2',
      category: 'Technology',
      title: 'AI-Generated Content: How New Verification Tools Are Fighting Misinformation',
      source: 'BBC News',
      time: '4 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3x1LXv2eiBOwPOf1zp8xdWhoitCBaaYm4BJ7SeMhLKKMhoxakaAeOxAzGKkJ-vqTFiQAFoLDyO0b-uVBEGw42ppyUAufRFlt0QZMbqIaiejKKKNP69_NcnZgJhAUav7a2E97tZT7f23Chr9HpYuNgUXe9ujX9_IuWLcb5UedWAymUnIIWBRf6uOZnjhRunk4EUj7tDtotMaD3qXwjmGyeDUzFpAHeKPxceUtkoWqpSD3UbMsq6lREmBZ2P7Ws33MtFk4oK7f3d1Y',
      status: 'RAGU-RAGU',
      color: '#00ca92',
      content: 'As artificial intelligence tools become widespread, researchers are building advanced classifiers to detect synthetic media, though complete accuracy is still in question.',
    },
    {
      id: 'r3',
      category: 'Politics',
      title: 'Bocor Rekaman Rahasia Senat AS Sepakat Potong Anggaran Bantuan Sosial.',
      source: 'Netizen Share',
      time: '6 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-dlVGnxrozhnU8cTIEBPtR8y5K2Gy-pdjfhw20rT8smLOwil1G0YYlIQgBYWsyegBQ1F_Vb0kO-8A6pezxUE2Fp3hgDGKIqC682OYukZaT3793KN5XR24U2aNPJV2aWyoGnsPk57wS5nmA2KpvO3MUWGb517MjNY_AB-QnP3bOG6KxN3DjfAJ0l8Uin-abyg_OBz6aqutq9S1rIQhdWyow5m0xv7N23Y7LtcJmYBL3qyVC8HAOz6rLj27S2WdGgqjBgk-CMgYNvs',
      status: 'HOAX',
      color: '#ba1a1a',
      content: 'Sebuah unggahan viral dengan rekaman suara mengklaim para senator diam-diam setuju memangkas bantuan sosial. Pemeriksa fakta resmi membuktikan audio ini dibuat menggunakan kloning suara AI (Deepfake).',
    },
    {
      id: 'r4',
      category: 'Business',
      title: 'Economic Impact Study Shows Verifiable News Ecosystem Increases Market Stability',
      source: 'Al Jazeera • Analysis',
      time: '12 jam yang lalu',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh0TmFuXhASC7VJ17P4dRWNan__CSGUtwFIzz6yxWlr-7GXFC_5a_bGzzVhp039hG6h-IcLVDEPh9w2-S_0-dOzhMHl3dNZTfOdohtVixOPz_8IMwu2Io8yPZDK5NItkiDBt1moqLT9nw5LsXujFhF_CQqmzWSJ8mxfUucZqFwWR82wXFtxvXoE9e5qcet9H_XCFOgvKvCvQfV-jEKaGDNtvaqU3nZt37H-odUDBFhgHRmfQrS1THx02t40wb40plE5ujXH5qK_FU',
      status: 'VALID',
      color: '#00ca92',
      content: 'A comprehensive multi-national report suggests that countries with higher trust in media reporting experience 15% less market volatility during geopolitical shifts...',
      description: 'A comprehensive multi-national report suggests that countries with higher trust in media reporting experience 15% less market volatility during geopolitical shifts...',
      isFeatured: true,
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [searchQuery, selectedCategory, selectedSource, articles]);

  useEffect(() => {
    const fetchApiNews = async () => {
      setIsLoading(true);
      try {
        // Fetch large batch so all articles available for client-side filter+pagination
        const result = await apiClient.fetchNews(1, 100);
        if (result && result.data && result.data.length > 0) {
          const mapped: NewsItem[] = result.data.map((item: any, idx: number) => {
            const category = classifyCategory(item.title || '', item.contentSnippet || '');
            const source = item.sourceName || 'CNN';

            let status: 'VALID' | 'HOAX' | 'RAGU-RAGU' = 'VALID';
            const lowerTitle = (item.title || '').toLowerCase();
            if (lowerTitle.includes('hoaks') || lowerTitle.includes('hoax') || lowerTitle.includes('palsu') || lowerTitle.includes('penipuan') || lowerTitle.includes('bocor') || lowerTitle.includes('rahasia')) {
              status = 'HOAX';
            } else if (lowerTitle.includes('ramalan') || lowerTitle.includes('prediksi') || lowerTitle.includes('rumor')) {
              status = 'RAGU-RAGU';
            }

            return {
              id: item.link || String(idx),
              category,
              title: item.title || '',
              source,
              time: item.isoDate ? new Date(item.isoDate).toLocaleDateString('id-ID') : 'Baru saja',
              image: item.image?.large || item.image?.small || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
              status,
              color: '#00ca92',
              content: item.contentSnippet || '',
            };
          });
          setArticles(mapped);
        } else {
          setArticles(newsDatabase);
        }
      } catch (error) {
        console.warn('Gagal memuat riset berita dari API. Memakai data statis.', error);
        setArticles(newsDatabase);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiNews();
  }, []);

  const filteredNews = articles.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    // 'All' category shows every article regardless of category
    const matchesCategory = selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSource = selectedSource === 'All' ||
      item.source.toUpperCase().includes(selectedSource.toUpperCase());
    return matchesSearch && matchesCategory && matchesSource;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  // Reset to page 1 whenever filters change
  const safePage = Math.min(page, totalPages);
  const pagedNews = filteredNews.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Reset page to 1 whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedSource]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Dynamic Stitch-Style Header */}
        <View style={styles.header}>
          {showSearch ? (
            <View style={styles.searchHeaderWrapper}>
              <Ionicons name="search" size={18} color="#00ca92" style={{ marginRight: 6 }} />
              <TextInput
                style={[styles.searchHeaderInput, { color: theme.text }]}
                placeholder="Cari riset berita..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <Pressable onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.headerLeft}>
                <Pressable onPress={() => setShowSearch(true)} style={styles.iconButton}>
                  <Ionicons name="search" size={20} color="#00ca92" />
                </Pressable>
                <Text style={[styles.brandText, { color: '#00ca92' }]}>Veros</Text>
              </View>
              <Pressable style={styles.iconButton}>
                <Ionicons name="options-outline" size={20} color="#00ca92" />
              </Pressable>
            </>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
            
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Research</Text>
            </View>

            {/* Filter Section */}
            <View style={styles.filtersSection}>
              {/* Row 1: Categories */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScrollContent}
                style={styles.chipRow}>
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => { setSelectedCategory(cat); setPage(1); }}
                      style={[
                        styles.categoryChip,
                        isActive
                          ? { backgroundColor: '#00ca92' }
                          : { backgroundColor: theme.background === '#ffffff' ? '#f5eff7' : '#232025', borderColor: theme.backgroundElement }
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

              {/* Row 2: Sources */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sourceScrollContent}
                style={styles.chipRow}>
                {sources.map((src) => {
                  const isActive = selectedSource === src;
                  return (
                    <Pressable
                      key={src}
                      onPress={() => { setSelectedSource(src); setPage(1); }}
                      style={[
                        styles.sourceChip,
                        isActive
                          ? { backgroundColor: '#e1d4fd', borderColor: '#00ca92' }
                          : { backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21', borderColor: theme.backgroundElement }
                      ]}>
                      <Text style={[
                        styles.sourceChipText,
                        isActive ? { color: '#22005d', fontWeight: '600' } : { color: theme.textSecondary }
                      ]}>
                        {src}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Articles List */}
            {isLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#00ca92" />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Memuat berita...
                </Text>
              </View>
            ) : filteredNews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Tidak ditemukan hasil riset yang cocok.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.listContainer}>
                  {pagedNews.map((art) => {
                    const mappedStatus = art.status === 'VALID' ? 'VALID' : art.status === 'HOAX' ? 'HOAX' : 'RAGU-RAGU';
                    return (
                      <Pressable
                        key={art.id}
                        onPress={() => router.push({
                          pathname: '/news-detail',
                          params: { id: art.id, title: art.title, content: art.content, image: art.image, source: art.source, status: mappedStatus }
                        })}
                        style={[
                          styles.standardCard,
                          {
                            borderColor: theme.backgroundElement,
                            backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                          }
                        ]}>
                        <View style={{ position: 'relative' }}>
                          <Image
                            style={styles.standardCardImage}
                            source={{ uri: art.image }}
                            contentFit="cover"
                          />
                          <RetroStamp status={mappedStatus} size="small" />
                        </View>
                        <View style={styles.standardCardDetails}>
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.cardTagSmall, { color: '#00ca92', backgroundColor: '#f3edf7' }]}>
                              {art.category}
                            </Text>
                            <Text style={[styles.cardTime, { color: theme.textSecondary }]}>{art.time}</Text>
                          </View>
                          <Text style={[styles.standardCardTitle, { color: theme.text }]} numberOfLines={2}>
                            {art.title}
                          </Text>
                          <View style={styles.standardCardFooter}>
                            <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
                              {art.source}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <View style={styles.paginationRow}>
                    <Pressable
                      disabled={safePage === 1}
                      onPress={() => setPage(p => Math.max(1, p - 1))}
                      style={[styles.pageBtn, safePage === 1 && styles.pageBtnDisabled, { borderColor: theme.backgroundElement }]}>
                      <Ionicons name="chevron-back" size={16} color={safePage === 1 ? '#ccc' : '#00ca92'} />
                      <Text style={[styles.pageBtnText, { color: safePage === 1 ? '#ccc' : '#00ca92' }]}>Prev</Text>
                    </Pressable>

                    <Text style={[styles.pageIndicatorText, { color: theme.textSecondary }]}>
                      {safePage} / {totalPages}
                    </Text>

                    <Pressable
                      disabled={safePage === totalPages}
                      onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                      style={[styles.pageBtn, safePage === totalPages && styles.pageBtnDisabled, { borderColor: theme.backgroundElement }]}>
                      <Text style={[styles.pageBtnText, { color: safePage === totalPages ? '#ccc' : '#00ca92' }]}>Next</Text>
                      <Ionicons name="chevron-forward" size={16} color={safePage === totalPages ? '#ccc' : '#00ca92'} />
                    </Pressable>
                  </View>
                )}
              </>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  iconButton: {
    padding: 6,
  },
  searchHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchHeaderInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Be Vietnam Pro',
    height: 40,
    paddingVertical: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  animatedContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  titleSection: {
    marginBottom: Spacing.three,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  filtersSection: {
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  chipRow: {
    maxHeight: 44,
  },
  chipScrollContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  sourceScrollContent: {
    gap: 8,
  },
  sourceChip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceChipText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
  },
  listContainer: {
    gap: Spacing.four,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  featuredCardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  featuredCardDetails: {
    padding: Spacing.four,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTag: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 22,
  },
  featuredCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Be Vietnam Pro',
  },
  featuredCardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.three,
    marginTop: Spacing.two,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: '#00ca92',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  standardCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    gap: 12,
  },
  standardCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  standardCardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTagSmall: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  standardCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
    marginVertical: 4,
  },
  standardCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMeta: {
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
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  pageIndicatorText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Be Vietnam Pro',
  },
});
