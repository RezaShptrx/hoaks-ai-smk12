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
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simple animations
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eror', 'Harap isi email dan kata sandi.');
      return;
    }
    
    setIsLoading(true);
    try {
      await apiClient.login(email, password);
      setIsLoading(false);
      Alert.alert('Sukses', 'Berhasil masuk ke akun Veros Anda.', [
        { text: 'OK', onPress: () => router.replace('/home') }
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Gagal Masuk', error.message || 'Email atau kata sandi salah.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right', 'bottom']}>
        {/* Minimal header */}
        <View style={styles.header}>
          <Pressable onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
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
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                alt="Illustration"
                style={styles.illustration}
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpQoekK6azwTx4RCoskIM5LadwolLOBrAcs1smoqufSyv6wdp8T2Mb9CJHESij1IknUV2dlC5vWuaiwo2IjHH-G7a6QyJ1YWwtd9FlDSJT5IZWqASImJyn3hAduDYs-EtqDXX3MPdxgZqPDli9nFoCdYnQDwwM50OBlFWtQ0YpIughO5UJQxveWCZir-flEf8Hn1JAd1WE5w0wmDdqL3JAK1e_qYD1GyS4XD2_s7bWoGDn9gNWfGR41mHcKNZJGQQUVp7hMp38mms',
                }}
                resizeMode="contain"
              />
            </View>

            {/* Typography */}
            <View style={styles.typography}>
              <Text style={[styles.title, { color: theme.text }]}>Selamat datang kembali</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Masuk untuk mulai memvalidasi informasi hari ini.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                  placeholder="nama@email.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  importantForAutofill="no"
                  textContentType="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>Kata Sandi</Text>
                  <Link href="/forgot-password" asChild>
                    <Pressable>
                      <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Lupa sandi?</Text>
                    </Pressable>
                  </Link>
                </View>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        borderColor: theme.backgroundElement,
                        color: theme.text,
                        backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214',
                        fontFamily: 'Be Vietnam Pro',
                      }
                    ]}
                    placeholder="••••••••"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    importantForAutofill="no"
                    textContentType="oneTimeCode"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityButton}>
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleLogin} disabled={isLoading} style={styles.submitButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#00ca92', '#00a87a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.submitButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Masuk</Text>
                    )}
                  </LinearGradient>
                )}
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.backgroundElement }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>atau lanjutkan dengan</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.backgroundElement }]} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialContainer}>
              <Pressable style={[styles.socialButton, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }]}>
                <Image
                  style={styles.socialIcon}
                  source={{ uri: 'https://img.icons8.com/color/70/google-logo.png' }}
                />
                <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
              </Pressable>

              <Pressable style={[styles.socialButton, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }]}>
                <Image
                  style={styles.socialIcon}
                  source={{ uri: 'https://img.icons8.com/color/70/facebook-new.png' }}
                />
                <Text style={[styles.socialButtonText, { color: theme.text }]}>Facebook</Text>
              </Pressable>
            </View>

            {/* Register redirection */}
            <View style={styles.footerLinkContainer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Belum punya akun? </Text>
              <Link href="/register" asChild>
                <Pressable>
                  <Text style={[styles.signUpText, { color: theme.text }]}>Daftar</Text>
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
    maxWidth: 280,
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
    paddingHorizontal: Spacing.three,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.three,
  },
  inputGroup: {
    gap: 6,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  visibilityButton: {
    position: 'absolute',
    right: 14,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.four,
    width: '100%',
    maxWidth: 400,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    paddingHorizontal: Spacing.two,
    fontFamily: 'Be Vietnam Pro',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    maxWidth: 400,
    marginBottom: Spacing.four,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
});
