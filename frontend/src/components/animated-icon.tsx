import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

// ─── Animated Splash Overlay ──────────────────────────────────────────────────
// White-background splash that shows the Veros logo with a spring-bounce
// entrance, staggered brand name + tagline, then fades out after ~2.6 s.
export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  // Shared animated values
  const overlayOpacity  = useSharedValue(1);
  const ringScale       = useSharedValue(0.5);
  const ringOpacity     = useSharedValue(0);
  const logoScale       = useSharedValue(0.35);
  const logoOpacity     = useSharedValue(0);
  const brandOpacity    = useSharedValue(0);
  const brandTranslateY = useSharedValue(22);
  const taglineOpacity  = useSharedValue(0);
  const taglineTranslate= useSharedValue(14);

  const dismiss = () => setVisible(false);

  useEffect(() => {
    // ── 1. Soft green ring blooms behind the logo ──
    ringOpacity.value = withTiming(0.12, { duration: 900 });
    ringScale.value   = withSpring(1, { damping: 7, stiffness: 55 });

    // ── 2. Logo: spring scale + fade ──
    logoScale.value   = withSpring(1, { damping: 11, stiffness: 95, mass: 0.85 });
    logoOpacity.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });

    // ── 3. Brand name slides up + fades in (delay 430 ms) ──
    brandOpacity.value    = withDelay(430, withTiming(1, { duration: 480 }));
    brandTranslateY.value = withDelay(430, withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }));

    // ── 4. Tagline slides up + fades in (delay 700 ms) ──
    taglineOpacity.value   = withDelay(700, withTiming(1, { duration: 450 }));
    taglineTranslate.value = withDelay(700, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    // ── 5. Fade the entire overlay out after 2 100 ms hold ──
    overlayOpacity.value = withDelay(
      2100,
      withTiming(0, { duration: 550, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished) runOnJS(dismiss)();
      }),
    );
  }, []);

  // Animated styles
  const overlayStyle  = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const ringStyle     = useAnimatedStyle(() => ({ opacity: ringOpacity.value, transform: [{ scale: ringScale.value }] }));
  const logoStyle     = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const brandStyle    = useAnimatedStyle(() => ({ opacity: brandOpacity.value, transform: [{ translateY: brandTranslateY.value }] }));
  const taglineStyle  = useAnimatedStyle(() => ({ opacity: taglineOpacity.value, transform: [{ translateY: taglineTranslate.value }] }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashContainer, overlayStyle]}>
      {/* Soft green ambient ring behind logo */}
      <Animated.View style={[styles.splashRing, ringStyle]} />

      {/* Logo */}
      <Animated.View style={[styles.splashLogoWrap, logoStyle]}>
        <Image
          style={styles.splashLogo}
          source={require('@/assets/images/veros_logo.png')}
          contentFit="contain"
        />
      </Animated.View>

      {/* Brand name */}
      <Animated.View style={brandStyle}>
        <Text style={styles.splashBrandName}>Veros</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={taglineStyle}>
        <Text style={styles.splashTagline}>Cerdas. Terverifikasi. Terpercaya.</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Animated Icon (kept for Expo splash config) ─────────────────────────────
const keyframe = new Keyframe({
  0:   { transform: [{ scale: INITIAL_SCALE_FACTOR }] },
  100: { transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
});

const logoKeyframe = new Keyframe({
  0:   { transform: [{ scale: 1.3 }], opacity: 0 },
  40:  { transform: [{ scale: 1.3 }], opacity: 0, easing: Easing.elastic(0.7) },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
});

const glowKeyframe = new Keyframe({
  0:   { transform: [{ rotateZ: '0deg' }] },
  100: { transform: [{ rotateZ: '7200deg' }] },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/veros_logo.png')} />
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Splash overlay
  splashContainer: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  splashRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#00ca92',
  },
  splashLogoWrap: {
    width: 112,
    height: 112,
  },
  splashLogo: {
    width: '100%',
    height: '100%',
  },
  splashBrandName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0d1117',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -1.2,
    marginTop: 4,
  },
  splashTagline: {
    fontSize: 12,
    color: '#60646C',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.4,
  },

  // AnimatedIcon (Expo splash)
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #00ca92, #009e73)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
