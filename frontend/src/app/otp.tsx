import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '@/services/api-client';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function OtpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isLoading, setIsLoading] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChangeText = (text: string, index: number) => {
    // Standardize digits
    const cleanedText = text.replace(/[^0-8]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto-focus next input if filled
    if (cleanedText && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResend = () => {
    setTimeLeft(59);
    Alert.alert('Sukses', 'Kode OTP baru telah dikirim ke email Anda!');
  };

  const handleVerify = async () => {
    const fullCode = otp.join('');
    if (fullCode.length < 4) {
      Alert.alert('Error', 'Harap masukkan 4 digit kode verifikasi.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.verifyOtp(email, fullCode);
      setIsLoading(false);
      Alert.alert('Sukses', 'Verifikasi berhasil!', [
        { text: 'OK', onPress: () => router.replace('/profile?onboarding=true') }
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Verifikasi Gagal', error.message || 'Kode OTP salah atau telah kadaluarsa.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Minimal header */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/register');
            }
          }} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.text}
            />
          </Pressable>
          <Text style={[styles.brandText, { color: theme.text }]}>Veros</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={[styles.illustrationBackdrop, { backgroundColor: 'rgba(0, 202, 146, 0.05)' }]} />
              <Image
                alt="Verification Illustration"
                style={styles.illustration}
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI18cvozKiXetmGVTtiQs4UQYQJA8Hrv1LewhABuwiUBHl9GRRkVqGqmLBOBBSgOT5LvaaSFcfMOOvs0l2v1MXeeORiqJ7A80F6QVo98UZtkxjR_YqPcUFCOc55iwpCotG9yBlwJCpGpaPf_AbbkYnM-EsNnqO8Z3_Uet2hPsq2smznED_0pww0g-KHsu1lubNWGsAxbTKD1KVuwNbVPMuuZRoTbl-46NETw-wxRXiKiNiLCPVjuvDCKhMwjLh56gJH00VTUTepds',
                }}
                contentFit="contain"
              />
            </View>

            {/* Typography */}
            <View style={styles.typography}>
              <Text style={[styles.title, { color: theme.text }]}>Verifikasi Kode</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Kami telah mengirimkan kode 4-digit ke email Anda.
              </Text>
            </View>

            {/* OTP Input Grid */}
            <View style={styles.otpGrid}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={inputRefs[idx]}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: theme.backgroundElement,
                      color: theme.text,
                      backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214',
                    },
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, idx)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
                  autoComplete="one-time-code"
                />
              ))}
            </View>

            {/* Timer & Resend */}
            <View style={styles.actionContainer}>
              <View style={styles.timerRow}>
                {timeLeft > 0 ? (
                  <Text style={[styles.timerText, { color: theme.textSecondary }]}>
                    Kirim ulang kode dalam{' '}
                    <Text style={[styles.boldTimer, { color: theme.text }]}>
                      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </Text>
                  </Text>
                ) : (
                  <Pressable onPress={handleResend}>
                    <Text style={[styles.resendButtonText, { color: theme.text }]}>
                      Kirim Ulang Kode
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleVerify} disabled={isLoading} style={styles.submitButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#00ca92', '#00a87a', '#009e73']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.submitButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Verifikasi & Lanjutkan</Text>
                    )}
                  </LinearGradient>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>

      </SafeAreaView>
    </KeyboardAvoidingView>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    alignItems: 'center',
    width: '100%',
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 240,
    aspectRatio: 1.3,
    marginBottom: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationBackdrop: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  typography: {
    alignItems: 'center',
    marginBottom: Spacing.four,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    paddingHorizontal: Spacing.five,
    lineHeight: 20,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    width: '100%',
    maxWidth: 400,
    marginVertical: Spacing.three,
  },
  otpInput: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  actionContainer: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  timerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  timerText: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  boldTimer: {
    fontWeight: '700',
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'Be Vietnam Pro',
  },
  submitButtonContainer: {
    width: '100%',
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ca92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  brandFooterText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingTop: Spacing.three,
  },
  copyrightText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    opacity: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  footerLink: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    opacity: 0.7,
  },
});
