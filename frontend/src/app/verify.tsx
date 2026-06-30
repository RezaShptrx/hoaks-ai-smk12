import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';

// Retro Stamp Component for Verify Results
const RetroStamp = ({ status }: { status: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU' }) => {
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
    <View style={[styles.stampContainer, { borderColor: color }]}>
      <Text style={[styles.stampText, { color: color }]}>{text}</Text>
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerifyScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [claimQuery, setClaimQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  // --- Animations ---
  // Infinite spin for idle atom
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  // Explosion controls
  const atomScale = useRef(new Animated.Value(1)).current;
  const atomOpacity = useRef(new Animated.Value(1)).current;
  const shockwaveScale = useRef(new Animated.Value(0)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;
  
  // Results fade in
  const resultsFade = useRef(new Animated.Value(0)).current;
  const resultsScale = useRef(new Animated.Value(0.9)).current;

  // Spin animation loop
  useEffect(() => {
    startSpinning(3000); // normal slow speed
  }, []);

  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinRotationReverse = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const startSpinning = (duration: number) => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const handleVerify = () => {
    if (!claimQuery.trim()) return;
    
    setIsVerifying(true);
    setHasResult(false);
    
    // Step 1: Charge up (Spin atom extremely fast!)
    startSpinning(400); // ultra-fast rotation
    
    setTimeout(() => {
      // Step 2: Trigger Explosion!
      Animated.parallel([
        // Atom expands rapidly and disappears
        Animated.timing(atomScale, {
          toValue: 4,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(atomOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        // Shockwave expands massively
        Animated.sequence([
          Animated.parallel([
            Animated.timing(shockwaveScale, {
              toValue: 7,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(shockwaveOpacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(shockwaveOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Step 3: Populate mock data based on input
        const query = claimQuery.toLowerCase();
        let verdict = 'VALID';
        let title = 'Kesepakatan Pajak Karbon Hijau KTT Jenewa';
        let confidence = '94%';
        let color = '#15803d'; // Green
        let image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w';
        let snippet = 'KTT PBB di Jenewa secara resmi menyetujui peluncuran kesepakatan pajak karbon hijau global yang mewajibkan 120 negara peserta memotong emisi karbon hingga dua kali lipat per tahun 2030.';
        let date = '30 Juni 2026';
        let source = 'KTT Jenewa Official Press';
        let reason = 'Pernyataan ini terbukti akurat dan absah. Rilis ini dipublikasikan secara langsung oleh sekretariat pers KTT Jenewa dan dilaporkan oleh seluruh portal berita media arus utama internasional terpercaya.';
        let action = 'Informasi ini terbukti akurat dan aman untuk disebarkan kembali sebagai wawasan lingkungan hijau global.';
        let links = ['Sekretariat KTT Pers PBB', 'Portal Kominfo'];

        if (query.includes('gratis') || query.includes('hadiah') || query.includes('menang') || query.includes('http') || query.includes('www') || query.includes('token') || query.includes('listrik')) {
          verdict = 'HOAKS';
          title = 'Hadiah Subsidi Token Listrik BUMN Rp1 Juta';
          confidence = '98%';
          color = '#ba1a1a'; // Red
          image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzy_KoWzpkENrYHKFw5rGi8uU_Z4lvRoKMx4zpvh0jLVlZU13iqbWgHqT4DBOza1oj8tXM2sAvtl25i7en3OMJOKsm16DSgYRXJDsxUrUBoVOj0M4zuRH3VLihM0ooCT-ZHrhx7iBGd64KEG4K1e0hjx2XBkm-iHoKGNU8DKjYaqWGMv99M7ms_eyTqQWKCU8XIao8AKKBYUdbVr1zK6V2OZ4PyOPMQSlDbKVSJqblAfkOA-RV_0cpxrfs3J3xIj4fbvxIY-7wGJI';
          snippet = 'PENGUMUMAN RESMI: BUMN membagikan subsidi token listrik sebesar Rp1.000.000 kepada nasabah melalui tautan Telegram khusus di bawah ini. Harap segera masukkan data diri Anda sebelum kuota penuh!';
          date = '30 Juni 2026';
          source = 'Akun Telegram Palsu BUMN';
          reason = 'Tautan Telegram dan domain web yang dilampirkan terbukti sebagai situs penipuan phishing data nasabah. Pihak PT PLN (Persero) menegaskan bahwa tidak ada program pembagian token listrik Rp 1 juta di media sosial luar situs resmi.';
          action = 'Segera hapus pesan, laporkan nomor pengirim ke Veritas, dan jangan sekali-kali memasukkan data pribadi atau kode OTP Anda ke web tersebut!';
          links = ['PLN Official Statement', 'Database Phishing Veritas'];
        } else if (query.includes('vaksin') || query.includes('obat') || query.includes('sembuh') || query.includes('kayu putih')) {
          verdict = 'RAGU-RAGU';
          title = 'Khasiat Minyak Kayu Putih Sembuhkan Sel Virus';
          confidence = '71%';
          color = '#d97706'; // Amber
          image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxBqA6qdqcagQePgf0-SzNPLAvTLYmW_s8p7RwX__xYMtJDlYPIHwFVolPEZfkF0eJ8CKOHStvHO1OHd1LRX4kusirD4i5fqaqspyVBtC4amUYy3YodC4t6R_LplppNYx4Wud215c4O4FAIeY9G4GQcRl-d-YCwSOQEEOwE4908E06-SNOZnypCf6IRT3c49PIkA_WdowMah9BtL-LO2Qe-swi2oW9WBiGbOWCLCkL1BT2pDgF_WvZSwjvMkkr6MZxvSKE45EY8wE';
          snippet = 'Kabar gembira! Cukup teteskan 3 tetes minyak kayu putih asli ke dalam uap air panas, hirup uapnya selama 5 menit. Virus pernapasan akan langsung mati seketika di dalam paru-paru tanpa obat dokter.';
          date = '28 Juni 2026';
          source = 'Grup Sosial Media Keluarga';
          reason = 'Minyak kayu putih memang memiliki khasiat melegakan pernapasan karena kandungan eukaliptol, namun klaim bahwa uapnya dapat menyembuhkan infeksi virus paru-paru secara klinis belum didukung bukti uji ilmiah medis resmi.';
          action = 'Gunakan minyak kayu putih untuk meringankan gejala pernapasan ringan, namun pastikan untuk tetap berkonsultasi ke fasilitas kesehatan terdekat jika gejala memburuk.';
          links = ['Jurnal Kesehatan IDI', 'WHO Health Guidelines'];
        }

        setResultData({ verdict, title, confidence, color, image, snippet, date, source, reason, action, links });
        setHasResult(true);
        setIsVerifying(false);

        // Step 4: Show Results card with smooth bounce
        Animated.parallel([
          Animated.timing(resultsFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(resultsScale, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 1800); // 1.8s charging duration
  };

  const handleReset = () => {
    // Fade out results card
    Animated.parallel([
      Animated.timing(resultsFade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(resultsScale, {
        toValue: 0.9,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setHasResult(false);
      setResultData(null);
      setClaimQuery('');
      
      // Reset and restart Atom animation
      atomScale.setValue(1);
      atomOpacity.setValue(1);
      shockwaveScale.setValue(0);
      shockwaveOpacity.setValue(0);
      startSpinning(3000); // restart slow idle orbit
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brandText, { color: '#4f378a' }]}>Verify</Text>
          <Pressable
            onPress={() => router.push('/report-hoax')}
            style={({ pressed }) => [styles.headerReportBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="megaphone-outline" size={16} color="#4f378a" style={{ marginRight: 4 }} />
            <Text style={styles.headerReportText}>Laporkan Hoaks</Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            
            {/* Visualizer Atom Area */}
            <View style={styles.visualizerContainer}>
              {/* Shockwave circle (shown during explosion) */}
              <Animated.View style={[
                styles.shockwave,
                {
                  transform: [{ scale: shockwaveScale }],
                  opacity: shockwaveOpacity,
                }
              ]} />

              {/* Atom Orbiting System */}
              {!hasResult && (
                <Animated.View style={[
                  styles.atomContainer,
                  {
                    transform: [{ scale: atomScale }],
                    opacity: atomOpacity,
                  }
                ]}>
                  {/* Nucleus */}
                  <View style={styles.nucleus}>
                    <LinearGradient
                      colors={isVerifying ? ['#d946ef', '#6366f1'] : ['#4f378a', '#9b51e0']}
                      style={styles.nucleusGradient}
                    />
                  </View>

                  {/* Ring 1 (Vertical) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotation }, { scaleY: 0.25 }]
                    }
                  ]} />

                  {/* Ring 2 (Rotated Left) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotationReverse }, { rotateZ: '60deg' }, { scaleY: 0.25 }]
                    }
                  ]} />

                  {/* Ring 3 (Rotated Right) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotation }, { rotateZ: '-60deg' }, { scaleY: 0.25 }]
                    }
                  ]} />
                </Animated.View>
              )}
            </View>

            {/* Input Module (Only show if not verifying/showing result) */}
            {!isVerifying && !hasResult && (
              <View style={styles.inputContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Masukkan Informasi</Text>
                <View style={[
                  styles.inputModule,
                  {
                    borderColor: isFocused ? '#4f378a' : theme.backgroundElement,
                    borderWidth: isFocused ? 2 : 1,
                    backgroundColor: theme.background === '#ffffff' ? '#fdf7ff' : '#1e1e21',
                  }
                ]}>
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Tempel link berita, ketik pernyataan klaim, atau deskripsikan gambar berita di sini..."
                    placeholderTextColor={theme.textSecondary}
                    value={claimQuery}
                    onChangeText={setClaimQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline
                    numberOfLines={4}
                  />
                  
                  <View style={styles.actionButtonsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.helperBtn, pressed && styles.btnPressed]}
                      onPress={() => setClaimQuery('https://www.hadiahgratis-kominfo.com/menang-subsidi-bansos-2026')}
                    >
                      <Ionicons name="link-outline" size={14} color="#4f378a" />
                      <Text style={styles.helperBtnText}>Tempel Link Hoaks</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.helperBtn, pressed && styles.btnPressed]}
                      onPress={() => setClaimQuery('Klaim minyak kayu putih bisa menyembuhkan infeksi virus pernapasan.')}
                    >
                      <Ionicons name="image-outline" size={14} color="#4f378a" />
                      <Text style={styles.helperBtnText}>Klaim Medis</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerify}
                  disabled={!claimQuery.trim()}
                  style={styles.verifyBtnWrapper}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={claimQuery.trim() ? ['#4f378a', '#9b51e0'] : ['#cccccc', '#dddddd']}
                      style={[
                        styles.verifyBtn,
                        pressed && styles.btnPressed,
                        !claimQuery.trim() && styles.btnDisabled
                      ]}
                    >
                      <Text style={styles.verifyBtnText}>Mulai Verifikasi Klaim</Text>
                      <Ionicons name="nuclear-outline" size={18} color="#ffffff" />
                    </LinearGradient>
                  )}
                </Pressable>
              </View>
            )}

            {/* Verification Processing State */}
            {isVerifying && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f378a" />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Menganalisis tautan & basis data fakta...
                </Text>
              </View>
            )}

            {/* Results Reveal Card */}
            {hasResult && resultData && (
              <Animated.View style={[
                styles.resultsCard,
                {
                  borderColor: theme.backgroundElement,
                  backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                  opacity: resultsFade,
                  transform: [{ scale: resultsScale }],
                }
              ]}>
                {/* Result Card Image Header with Retro Stamp Overlay */}
                <View style={styles.resultImageWrapper}>
                  <Image
                    style={styles.resultImage}
                    source={{ uri: resultData.image }}
                    contentFit="cover"
                  />
                  <RetroStamp status={resultData.verdict} />
                </View>

                {/* Result Top Ribbon */}
                <View style={[styles.resultRibbon, { backgroundColor: resultData.color }]} />

                <View style={styles.resultsContent}>
                  {/* Verdict Header */}
                  <View style={styles.verdictHeader}>
                    <View style={[styles.badge, { backgroundColor: resultData.color + '15' }]}>
                      <Text style={[styles.badgeText, { color: resultData.color }]}>
                        {resultData.verdict}
                      </Text>
                    </View>
                    <View style={styles.confidenceRow}>
                      <Text style={[styles.confidenceLabel, { color: theme.textSecondary }]}>Kepercayaan AI:</Text>
                      <Text style={[styles.confidenceValue, { color: resultData.color }]}>{resultData.confidence}</Text>
                    </View>
                  </View>

                  {/* Title & Metadata */}
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{resultData.title}</Text>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{resultData.date}</Text>
                    <Text style={[styles.metaDivider, { color: theme.textSecondary }]}>•</Text>
                    <Ionicons name="globe-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{resultData.source}</Text>
                  </View>

                  {/* Kutipan Teks Berita */}
                  <View style={[styles.quoteBox, { backgroundColor: theme.background === '#ffffff' ? '#fdf7ff' : '#1b191c', borderLeftColor: resultData.color }]}>
                    <Text style={[styles.quoteText, { color: theme.text }]}>
                      "{resultData.snippet}"
                    </Text>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Analisis / Alasan Cek Fakta:</Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{resultData.reason}</Text>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Rekomendasi Tindakan:</Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{resultData.action}</Text>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Sumber Otoritatif Rujukan:</Text>
                    {resultData.links.map((link: string, idx: number) => (
                      <View key={idx} style={styles.linkRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                        <Text style={[styles.linkLabel, { color: theme.textSecondary }]}>{link}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Reset Button */}
                  <Pressable onPress={handleReset} style={styles.resetBtnWrapper}>
                    {({ pressed }) => (
                      <LinearGradient
                        colors={['#4f378a', '#6750a4']}
                        style={[styles.resetBtn, pressed && styles.btnPressed]}
                      >
                        <Text style={styles.resetBtnText}>Periksa Klaim Lainnya</Text>
                        <Ionicons name="refresh" size={16} color="#ffffff" />
                      </LinearGradient>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            )}

          </View>
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
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    width: '100%',
  },
  visualizerContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  shockwave: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#9b51e0',
    backgroundColor: 'rgba(155, 81, 224, 0.15)',
  },
  atomContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nucleus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#9b51e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  nucleusGradient: {
    width: '100%',
    height: '100%',
  },
  orbitRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 55, 138, 0.45)',
  },
  inputContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.two,
  },
  inputModule: {
    borderRadius: 16,
    padding: Spacing.three,
    width: '100%',
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  searchInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Be Vietnam Pro',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  helperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f2ecf4',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
  },
  helperBtnText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: '#4f378a',
  },
  verifyBtnWrapper: {
    width: '100%',
  },
  verifyBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  resultsCard: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
  },
  resultRibbon: {
    height: 6,
    width: '100%',
  },
  resultsContent: {
    padding: Spacing.four,
  },
  verdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceLabel: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.four,
  },
  cardSection: {
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkLabel: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  resetBtnWrapper: {
    marginTop: Spacing.two,
  },
  resetBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  resultImageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  stampContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  stampText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: Spacing.four,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  metaDivider: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    marginHorizontal: 2,
  },
  quoteBox: {
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: Spacing.four,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -8,
    left: 8,
    opacity: 0.15,
  },
  quoteText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  headerReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 55, 138, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerReportText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#4f378a',
  },
});
