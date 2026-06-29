import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [claimQuery, setClaimQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Entrance animations for sections
  const heroFadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(20)).current;
  const searchFadeAnim = useRef(new Animated.Value(0)).current;
  const searchSlideAnim = useRef(new Animated.Value(20)).current;

  // Result card animations
  const resultFadeAnim = useRef(new Animated.Value(0)).current;
  const resultSlideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    // Run entrance animations on load
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(heroFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(heroSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(searchFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(searchSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    // Trigger animation when result is shown
    if (verificationResult) {
      resultFadeAnim.setValue(0);
      resultSlideAnim.setValue(15);
      Animated.parallel([
        Animated.timing(resultFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(resultSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [verificationResult]);

  // Mock verification logic
  const handleVerifyClaim = () => {
    if (!claimQuery.trim()) return;
    
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      const query = claimQuery.toLowerCase();
      if (query.includes('gratis') || query.includes('hadiah') || query.includes('menang')) {
        setVerificationResult({
          status: 'HOAX',
          title: 'Hoax Pembagian Hadiah / Subsidi Gratis',
          description: 'Pesan berantai mengenai pembagian subsidi atau hadiah gratis dari instansi resmi ini adalah palsu (phishing).',
          color: '#ba1a1a',
        });
      } else if (query.includes('vaksin') || query.includes('kesehatan') || query.includes('obat')) {
        setVerificationResult({
          status: 'UNCERTAIN',
          title: 'Klaim Kesehatan Butuh Rujukan Medis',
          description: 'Klaim ini mengandung beberapa informasi benar namun kesimpulannya bisa menyesatkan tanpa rujukan dokter ahli.',
          color: '#e7c365',
        });
      } else {
        setVerificationResult({
          status: 'VERIFIED',
          title: 'Informasi Terverifikasi Valid',
          description: 'Berdasarkan data dari sumber otoritatif, informasi yang Anda masukkan sesuai dengan fakta di lapangan.',
          color: '#4f378a',
        });
      }
    }, 1500);
  };

  const recentClaims = [
    {
      id: '1',
      category: 'Teknologi',
      title: 'Kebocoran data massal di server instansi XYZ',
      status: 'VERIFIED',
      color: '#4f378a',
    },
    {
      id: '2',
      category: 'Kesehatan',
      title: 'Minyak kayu putih menyembuhkan virus pernapasan baru',
      status: 'HOAX',
      color: '#ba1a1a',
    },
    {
      id: '3',
      category: 'Politik',
      title: 'Perubahan undang-undang pemilu disahkan secara rahasia',
      status: 'UNCERTAIN',
      color: '#e7c365',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={[styles.brandText, { color: theme.text }]}>Valid.</Text>
          <View style={styles.headerActions}>
            <Link href="/login" asChild>
              <Pressable style={[styles.loginBtn, { borderColor: theme.backgroundElement }]}>
                <Text style={[styles.loginBtnText, { color: theme.text }]}>Masuk</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            {/* Hero Section */}
            <Animated.View style={[styles.heroSection, { opacity: heroFadeAnim, transform: [{ translateY: heroSlideAnim }] }]}>
              <Text style={[styles.heroTitle, { color: theme.text }]}>
                Periksa Kebenaran{'\n'}Sebelum Berbagi.
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                Validasikan berita, artikel, atau pesan berantai secara real-time dengan asisten AI kami.
              </Text>
            </Animated.View>

            {/* Claim Verification Input */}
            <Animated.View style={[styles.searchBox, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21', opacity: searchFadeAnim, transform: [{ translateY: searchSlideAnim }] }]}>
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Tempel atau ketik klaim informasi di sini..."
                placeholderTextColor={theme.textSecondary}
                value={claimQuery}
                onChangeText={setClaimQuery}
                multiline
                numberOfLines={3}
              />
              <View style={styles.searchActionRow}>
                {claimQuery.length > 0 && (
                  <Pressable onPress={() => setClaimQuery('')} style={styles.clearBtn}>
                    <Text style={{ color: theme.textSecondary }}>Hapus</Text>
                  </Pressable>
                )}
                <Pressable onPress={handleVerifyClaim} disabled={isVerifying} style={styles.verifyBtnContainer}>
                  {({ pressed }) => (
                    <LinearGradient
                      colors={['#4f378a', '#6750a4']}
                      style={[styles.verifyBtn, pressed && styles.btnPressed, isVerifying && styles.btnDisabled]}>
                      {isVerifying ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <View style={styles.verifyBtnContent}>
                          <Text style={styles.verifyBtnText}>Periksa Klaim</Text>
                          <SymbolView
                            tintColor="#ffffff"
                            name={{ ios: 'shield.fill', android: 'shield', web: 'security' }}
                            size={16}
                          />
                        </View>
                      )}
                    </LinearGradient>
                  )}
                </Pressable>
              </View>
            </Animated.View>

            {/* Verification Result Card */}
            {verificationResult && (
              <Animated.View style={[styles.resultCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21', opacity: resultFadeAnim, transform: [{ translateY: resultSlideAnim }] }]}>
                <View style={[styles.resultStatusIndicator, { backgroundColor: verificationResult.color }]} />
                <View style={styles.resultCardContent}>
                  <View style={styles.statusBadgeRow}>
                    <View style={[styles.statusBadge, { backgroundColor: verificationResult.color + '15' }]}>
                      <Text style={[styles.statusBadgeText, { color: verificationResult.color }]}>
                        {verificationResult.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{verificationResult.title}</Text>
                  <Text style={[styles.resultDesc, { color: theme.textSecondary }]}>{verificationResult.description}</Text>
                </View>
              </Animated.View>
            )}

            {/* Quick Demo Navigation for Review */}
            <View style={styles.demoSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Uji Alur Aplikasi (Stitch Designs)</Text>
              <View style={styles.demoGrid}>
                <Link href="/login" asChild>
                  <Pressable style={[styles.demoCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#f8f9ff' : '#1a1a1d' }]}>
                    <SymbolView tintColor="#4f378a" name={{ ios: 'person.crop.circle', android: 'account-circle', web: 'person' }} size={24} />
                    <Text style={[styles.demoCardText, { color: theme.text }]}>Login Screen</Text>
                  </Pressable>
                </Link>
                <Link href="/register" asChild>
                  <Pressable style={[styles.demoCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#f8f9ff' : '#1a1a1d' }]}>
                    <SymbolView tintColor="#4f378a" name={{ ios: 'person.badge.plus', android: 'account-plus', web: 'person_add' }} size={24} />
                    <Text style={[styles.demoCardText, { color: theme.text }]}>Sign Up Screen</Text>
                  </Pressable>
                </Link>
                <Link href="/forgot-password" asChild>
                  <Pressable style={[styles.demoCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#f8f9ff' : '#1a1a1d' }]}>
                    <SymbolView tintColor="#4f378a" name={{ ios: 'key.fill', android: 'key', web: 'vpn_key' }} size={24} />
                    <Text style={[styles.demoCardText, { color: theme.text }]}>Forgot Password</Text>
                  </Pressable>
                </Link>
                <Link href="/otp" asChild>
                  <Pressable style={[styles.demoCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#f8f9ff' : '#1a1a1d' }]}>
                    <SymbolView tintColor="#4f378a" name={{ ios: 'checkmark.shield.fill', android: 'shield-check', web: 'verified_user' }} size={24} />
                    <Text style={[styles.demoCardText, { color: theme.text }]}>OTP Verification</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* Recent Validations List */}
            <View style={styles.recentSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Hasil Cek Fakta Terbaru</Text>
              <View style={styles.claimsList}>
                {recentClaims.map((claim) => (
                  <View
                    key={claim.id}
                    style={[
                      styles.claimItem,
                      {
                        borderColor: theme.backgroundElement,
                        backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                      },
                    ]}>
                    <View style={[styles.claimLeftBorder, { backgroundColor: claim.color }]} />
                    <View style={styles.claimItemContent}>
                      <View style={styles.claimHeader}>
                        <Text style={[styles.claimCategory, { color: theme.textSecondary }]}>{claim.category}</Text>
                        <View style={[styles.miniStatusBadge, { backgroundColor: claim.color + '15' }]}>
                          <Text style={[styles.miniStatusBadgeText, { color: claim.color }]}>{claim.status}</Text>
                        </View>
                      </View>
                      <Text style={[styles.claimTitle, { color: theme.text }]} numberOfLines={2}>
                        {claim.title}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
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
  heroSection: {
    marginBottom: Spacing.four,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Be Vietnam Pro',
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  searchInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: 'top',
    fontFamily: 'Be Vietnam Pro',
  },
  searchActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: Spacing.two,
    gap: Spacing.three,
  },
  clearBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
  },
  verifyBtnContainer: {
    alignSelf: 'flex-end',
  },
  verifyBtn: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  btnPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.7,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  resultStatusIndicator: {
    width: 6,
    height: '100%',
  },
  resultCardContent: {
    flex: 1,
    padding: Spacing.three,
    gap: 4,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  resultDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  demoSection: {
    marginBottom: Spacing.five,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.three,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  demoCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 6,
  },
  demoCardText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  recentSection: {
    width: '100%',
  },
  claimsList: {
    gap: Spacing.three,
  },
  claimItem: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 76,
  },
  claimLeftBorder: {
    width: 4,
    height: '100%',
  },
  claimItemContent: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    gap: 4,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimCategory: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  miniStatusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  claimTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
  },
});
