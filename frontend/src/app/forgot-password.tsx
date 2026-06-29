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
import { SymbolView } from 'expo-symbols';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
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

  const handleResetRequest = () => {
    if (!email) {
      Alert.alert('Error', 'Harap masukkan alamat email.');
      return;
    }
    
    setIsLoading(true);
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Terkirim!', 'Kode verifikasi OTP telah dikirim ke email Anda.', [
        { text: 'OK', onPress: () => router.replace('/otp') }
      ]);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Minimal header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'arrow.left', android: 'arrow-left', web: 'arrow_back' }}
              size={24}
            />
          </Pressable>
          <Text style={[styles.brandText, { color: theme.text }]}>Valid.</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                alt="Forgot Password Illustration"
                style={styles.illustration}
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5yylW2DmwPAzGy3u3XOAtGnnZdEVkAkPbHj9QXvqidc4QAWvMkjV-pozNbMEig5d4H-415Vn0rsVRtrfNTZwl-38wNQWPjMJr_zwANemkrE1pP0PjQsaRE_8SUM2gxW9rDtvoUkt5o4RSl4sKasX2N7In1ocivuAyyM-Z90yYb-GDtg_L2uZ8veEk1MGBbUC7KtWKyMKI5L3dqEkhO1Hw5lQB8-A9nU86CvPN8BANnMOHE01NHWDqm3B47dg2PXrvC9QwqxmBBx0',
                }}
                contentFit="contain"
              />
            </View>

            {/* Typography */}
            <View style={styles.typography}>
              <Text style={[styles.title, { color: theme.text }]}>Atur Ulang Sandi</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Masukkan email Anda. Kami akan mengirimkan kode verifikasi OTP yang aman.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Alamat Email</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                  placeholder="contoh@email.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleResetRequest} disabled={isLoading} style={styles.submitButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#4285F4', '#4f378a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.submitButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.submitButtonText}>Kirim Kode Verifikasi</Text>
                        <SymbolView
                          tintColor="#ffffff"
                          name={{ ios: 'paperplane', android: 'send', web: 'send' }}
                          size={16}
                        />
                      </View>
                    )}
                  </LinearGradient>
                )}
              </Pressable>
            </View>

            {/* Secondary Action */}
            <View style={styles.footerLinkContainer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Ingat kata sandi Anda? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={[styles.loginText, { color: theme.text }]}>Masuk Sekarang</Text>
                </Pressable>
              </Link>
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
    maxWidth: 260,
    aspectRatio: 1.3,
    marginBottom: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  typography: {
    alignItems: 'center',
    marginBottom: Spacing.five,
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
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    paddingHorizontal: Spacing.four,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  inputGroup: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
  },
  submitButtonContainer: {
    marginTop: Spacing.two,
    width: '100%',
  },
  submitButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f378a',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: Spacing.three,
  },
  copyrightText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    opacity: 0.6,
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
