import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CAROUSEL_HEIGHT = screenHeight * 0.42;
const CARD_MIN_HEIGHT = screenHeight * 0.36;

// ─── Per-slide content (Indonesian) ──────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa0JVZEhiy4IhGGZegsxff0rBQM7g8-8Ww3kRDr2z2_UUkIpu77m22zcV1BQcp5Ct58cBpim58wVyYNZCRtrmP-hfHjvfs9d-XkIRigJvPRVZNapPMN8YZ1cnBwfyYEmUExFApCarIBPW_HwCpTElf77UY5vyTmWHVPruTylVqeA5aDNQicW35rmgjRhXKjtNS4ycx7BfYoAIIudN9lqEqFyIRT77kFu7ELwJS4mVtMK8UWM1KWtwKL88mMGFID-yB4lXwc3aH37U',
    title: 'Selamat Datang di Veros',
    subtitle: 'Platform cerdas untuk mendeteksi, memverifikasi, dan memerangi hoaks di Indonesia.',
    accent: '#00ca92',
  },
  {
    id: '2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQoekK6azwTx4RCoskIM5LadwolLOBrAcs1smoqufSyv6wdp8T2Mb9CJHESij1IknUV2dlC5vWuaiwo2IjHH-G7a6QyJ1YWwtd9FlDSJT5IZWqASImJyn3hAduDYs-EtqDXX3MPdxgZqPDli9nFoCdYnQDwwM50OBlFWtQ0YpIughO5UJQxveWCZir-flEf8Hn1JAd1WE5w0wmDdqL3JAK1e_qYD1GyS4XD2_s7bWoGDn9gNWfGR41mHcKNZJGQQUVp7hMp38mms',
    title: 'Verifikasi Sebelum Berbagi',
    subtitle: 'Gunakan AI Veros untuk mengecek fakta setiap berita sebelum disebarkan ke orang-orang tersayang.',
    accent: '#00ca92',
  },
  {
    id: '3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxLopRq1-Hb-UIHJEwydWSKXLXEv96jlQkBMl6iXmCMAxL0_LT1NyvkP_rjI7GH9fHpzTSzmED7AhQnNE9xyfmxVpYgYty81Hi_Ejru7R1PB8ha2Zsj5MFwb-CUWJKbK7lQCguROCyBLsMVT5jpJqvufNoBquqLjasxZqyF_a6X7bgPKFVVmJ1gkkeKiM30dJtNqzfWR8vbYS3dWWSm7kiea1_RecD9R4tKffr_iHCbaIbG-kpBJXVSJVypWZplogFLKmC-XbCqtY',
    title: 'Bersama Lawan Hoaks',
    subtitle: 'Bergabunglah dengan komunitas Veros dan jadilah garda terdepan melawan penyebaran informasi palsu.',
    accent: '#00ca92',
  },
];

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── Existing state (DO NOT MODIFY) ──
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // ── Text cross-fade state ──
  // We keep a separate "displayed" index that only updates mid-fade
  const [displayedIndex, setDisplayedIndex] = useState(0);

  // ── Animated values ──
  const fadeAnim     = useRef(new Animated.Value(0)).current;   // bottom card entrance
  const slideAnim    = useRef(new Animated.Value(28)).current;  // bottom card slide-up
  const textFadeAnim = useRef(new Animated.Value(1)).current;   // text cross-fade
  const textSlideAnim= useRef(new Animated.Value(0)).current;   // text slide on change

  // ── Existing session check (DO NOT MODIFY) ──
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await apiClient.initSession();
        if (session && session.token) {
          router.replace('/home');
          return;
        }
      } catch (err) {
        console.warn('Failed to load session:', err);
      } finally {
        setIsInitializing(false);
      }

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    };

    checkSession();
  }, []);

  // ── Animate text cross-fade when activeIndex changes ──
  useEffect(() => {
    if (activeIndex === displayedIndex) return;

    // Fade out + slide out upward
    Animated.parallel([
      Animated.timing(textFadeAnim, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(textSlideAnim, { toValue: -12, duration: 170, useNativeDriver: true }),
    ]).start(() => {
      setDisplayedIndex(activeIndex);
      textSlideAnim.setValue(14); // start from below
      // Fade in + slide up to 0
      Animated.parallel([
        Animated.timing(textFadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(textSlideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  }, [activeIndex]);

  // ── Auto-scroll (existing logic, DO NOT MODIFY) ──
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % SLIDES.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
      setActiveIndex(nextIndex);
    }, 3800);
    return () => clearInterval(timer);
  }, [activeIndex]);

  // ── Manual next/scroll (existing handleScroll kept, DO NOT MODIFY) ──
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  // ── Advance slide (pure UI, no routing) ──
  const handleNext = () => {
    const nextIndex = Math.min(activeIndex + 1, SLIDES.length - 1);
    scrollViewRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
    setActiveIndex(nextIndex);
  };

  const isLastSlide = activeIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[displayedIndex];

  // ── Loading state (existing, DO NOT MODIFY) ──
  if (isInitializing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#00ca92" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          {/* Logo mark */}
          <View style={styles.headerBrand}>
            <Image
              source={require('@/assets/images/veros_logo.png')}
              style={styles.headerLogo}
              contentFit="contain"
            />
            <Text style={[styles.brandLogoText, { color: theme.text }]}>Veros</Text>
          </View>

          {/* Skip button */}
          <Pressable onPress={() => router.replace('/home')} style={styles.skipButton}>
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Lewati</Text>
            <Ionicons name="chevron-forward" size={13} color={theme.textSecondary} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Carousel ── */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollViewStyle}
        >
          {SLIDES.map((slide, index) => (
            <View key={slide.id} style={styles.slideFrame}>
              <Image
                alt={`Slide ${index + 1}`}
                style={styles.illustration}
                source={{ uri: slide.image }}
                contentFit="contain"
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Pagination dots ── */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, idx) => (
          <Pressable key={idx} onPress={() => {
            scrollViewRef.current?.scrollTo({ x: idx * screenWidth, animated: true });
            setActiveIndex(idx);
          }}>
            <View style={[
              styles.dot,
              idx === activeIndex
                ? [styles.dotActive, { backgroundColor: '#00ca92' }]
                : { backgroundColor: theme.backgroundElement },
            ]} />
          </Pressable>
        ))}
      </View>

      {/* ── Bottom card ── */}
      <Animated.View style={[
        styles.bottomCard,
        {
          backgroundColor: theme.background === '#ffffff'
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(18,18,20,0.95)',
          borderColor: theme.background === '#ffffff'
            ? 'rgba(0,0,0,0.06)'
            : 'rgba(255,255,255,0.07)',
          paddingBottom: Math.max(insets.bottom + Spacing.three, Spacing.four),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>

        {/* Per-slide text (cross-fades on slide change) */}
        <Animated.View style={[
          styles.textContainer,
          { opacity: textFadeAnim, transform: [{ translateY: textSlideAnim }] },
        ]}>
          {/* Pill accent */}
          <View style={[styles.slidePill, { backgroundColor: 'rgba(0,202,146,0.12)' }]}>
            <View style={styles.slidePillDot} />
            <Text style={styles.slidePillText}>
              {displayedIndex + 1} / {SLIDES.length}
            </Text>
          </View>

          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {currentSlide.title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            {currentSlide.subtitle}
          </Text>
        </Animated.View>

        {/* ── Action buttons ── */}
        <View style={styles.actionsBlock}>

          {/* Slides 1 & 2: "Lanjut" advances carousel. Slide 3: "Mulai Sekarang" routes to /register */}
          {!isLastSlide ? (
            <Pressable onPress={handleNext} style={styles.primaryButtonContainer}>
              {({ pressed }) => (
                <LinearGradient
                  colors={['#00ca92', '#00a87a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.primaryButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.primaryButtonText}>Lanjut</Text>
                  <View style={styles.arrowIconBg}>
                    <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                  </View>
                </LinearGradient>
              )}
            </Pressable>
          ) : (
            <Link href="/register" asChild>
              <Pressable style={styles.primaryButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#00ca92', '#00a87a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.primaryButton, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.primaryButtonText}>Mulai Sekarang</Text>
                    <View style={styles.arrowIconBg}>
                      <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                    </View>
                  </LinearGradient>
                )}
              </Pressable>
            </Link>
          )}

          {/* "Masuk" is always visible */}
          <Link href="/login" asChild>
            <Pressable style={styles.secondaryButtonContainer}>
              {({ pressed }) => (
                <View style={[styles.secondaryButton, { borderColor: theme.backgroundElement }, pressed && styles.buttonPressed]}>
                  <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                    Sudah punya akun?{'  '}
                    <Text style={styles.secondaryButtonAccent}>Masuk</Text>
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>

        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerSafeArea: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  brandLogoText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.6,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },

  // Carousel
  carouselContainer: {
    height: CAROUSEL_HEIGHT,
    width: '100%',
  },
  scrollViewStyle: {
    flex: 1,
  },
  slideFrame: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  illustration: {
    width: '88%',
    height: '92%',
  },

  // Pagination dots
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
  },

  // Bottom card
  bottomCard: {
    borderWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    alignItems: 'center',
    width: '100%',
    minHeight: CARD_MIN_HEIGHT,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    ...Platform.select({
      web: { backdropFilter: 'blur(24px)' },
    }),
  },

  // Per-slide text area
  textContainer: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: Spacing.one,
    minHeight: 100,
  },
  slidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 2,
  },
  slidePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ca92',
  },
  slidePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00ca92',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
    opacity: 0.85,
  },

  // Action buttons
  actionsBlock: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  primaryButtonContainer: {
    width: '100%',
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 8,
    shadowColor: '#00ca92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  arrowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonContainer: {
    width: '100%',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '500',
  },
  secondaryButtonAccent: {
    fontWeight: '800',
    color: '#00ca92',
  },
});
