import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CAROUSEL_HEIGHT = screenHeight * 0.36;
const CARD_MIN_HEIGHT = screenHeight * 0.38;

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Staggered entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    };

    checkSession();
  }, []);

  const onboardingSlides = [
    {
      id: '1',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa0JVZEhiy4IhGGZegsxff0rBQM7g8-8Ww3kRDr2z2_UUkIpu77m22zcV1BQcp5Ct58cBpim58wVyYNZCRtrmP-hfHjvfs9d-XkIRigJvPRVZNapPMN8YZ1cnBwfyYEmUExFApCarIBPW_HwCpTElf77UY5vyTmWHVPruTylVqeA5aDNQicW35rmgjRhXKjtNS4ycx7BfYoAIIudN9lqEqFyIRT77kFu7ELwJS4mVtMK8UWM1KWtwKL88mMGFID-yB4lXwc3aH37U',
    },
    {
      id: '2',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQoekK6azwTx4RCoskIM5LadwolLOBrAcs1smoqufSyv6wdp8T2Mb9CJHESij1IknUV2dlC5vWuaiwo2IjHH-G7a6QyJ1YWwtd9FlDSJT5IZWqASImJyn3hAduDYs-EtqDXX3MPdxgZqPDli9nFoCdYnQDwwM50OBlFWtQ0YpIughO5UJQxveWCZir-flEf8Hn1JAd1WE5w0wmDdqL3JAK1e_qYD1GyS4XD2_s7bWoGDn9gNWfGR41mHcKNZJGQQUVp7hMp38mms',
    },
    {
      id: '3',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxLopRq1-Hb-UIHJEwydWSKXLXEv96jlQkBMl6iXmCMAxL0_LT1NyvkP_rjI7GH9fHpzTSzmED7AhQnNE9xyfmxVpYgYty81Hi_Ejru7R1PB8ha2Zsj5MFwb-CUWJKbK7lQCguROCyBLsMVT5jpJqvufNoBquqLjasxZqyF_a6X7bgPKFVVmJ1gkkeKiM30dJtNqzfWR8vbYS3dWWSm7kiea1_RecD9R4tKffr_iHCbaIbG-kpBJXVSJVypWZplogFLKmC-XbCqtY',
    },
  ];

  // Auto-scroll logic (swipes right every 3.5s and loops back)
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % onboardingSlides.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (index !== activeIndex && index >= 0 && index < onboardingSlides.length) {
      setActiveIndex(index);
    }
  };

  if (isInitializing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f378a" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Pattern */}
      <Image
        style={styles.bgPattern}
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt6aFADRXL8XqDENNFeYYZq8lYFlXuaJyUhqUn-dHg_3S8BGJcidhXw4mzlQr2RPSDE0NMw30R-dzBgTcUqjvD6eB3L0WA2CuAkDXH7iuGbECASyoq0wT1oHbWQDLVKlwvLSR9Q3jYUGWF2oUnbmTIFIxIUWTzXX9GB9njtxfjXtjXfuGOedp660wvVvLyrfxkxTfjfnnSOa81bXK9lL9hpPi9GM3_DRP935rqK8gptJ97SmCXpTv_eimcR_V-Jt8nbpBGdveOu1s',
        }}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brandLogoText, { color: theme.text }]}>Valid.</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.skipButton}>
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Lewati</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        {/* Carousel: 36% Screen Height */}
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
            {onboardingSlides.map((slide) => (
              <View key={slide.id} style={styles.slideFrame}>
                <Image
                  alt="Onboarding Illustration"
                  style={styles.illustration}
                  source={{ uri: slide.image }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Carousel Pagination Dots (Floating above the bottom card) */}
        <View style={styles.dotsRowAbove}>
          {onboardingSlides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                activeIndex === idx ? [styles.dotActive, { backgroundColor: '#4f378a' }] : { backgroundColor: theme.backgroundElement },
              ]}
            />
          ))}
        </View>

        {/* Frosted Bottom Card: Text + Buttons */}
        <Animated.View style={[
          styles.bottomCard,
          {
            backgroundColor: theme.background === '#ffffff' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(30, 30, 33, 0.78)',
            borderColor: theme.background === '#ffffff' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
            paddingBottom: Math.max(insets.bottom + Spacing.four, Spacing.five),
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Static Text Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Verifikasi Informasi dengan Cerdas
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Lindungi diri dan komunitas dari hoax dengan data yang valid.
            </Text>
          </View>

          {/* Action buttons (Mulai Sekarang & Masuk) */}
          <View style={styles.actionsBlock}>
            <Link href="/register" asChild>
              <Pressable style={styles.primaryButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#4285F4', '#9B51E0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.primaryButton, pressed && styles.buttonPressed]}>
                    <Text style={styles.primaryButtonText}>Mulai Sekarang</Text>
                    <View style={styles.arrowIconBg}>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#ffffff"
                      />
                    </View>
                  </LinearGradient>
                )}
              </Pressable>
            </Link>

            <Link href="/login" asChild>
              <Pressable style={styles.secondaryButtonContainer}>
                {({ pressed }) => (
                  <View style={[styles.secondaryButton, pressed && styles.buttonPressed]}>
                    <Text style={styles.secondaryButtonText}>Masuk</Text>
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  brandLogoText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
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
    width: '85%',
    height: '90%',
  },
  dotsRowAbove: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.three,
  },
  bottomCard: {
    borderWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: CARD_MIN_HEIGHT,
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    lineHeight: 25,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 14,
  },
  actionsBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.two,
  },
  primaryButtonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 8,
    shadowColor: '#9B51E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
});
