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
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Eror', 'Harap isi semua kolom.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Eror', 'Kata sandi minimal harus 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Eror', 'Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }
    
    setIsLoading(true);
    try {
      await apiClient.signup(fullName, email, password);
      setIsLoading(false);
      Alert.alert('Sukses', 'Akun berhasil dibuat! Silakan verifikasi kode OTP Anda.', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/otp', params: { email } }) }
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Pendaftaran Gagal', error.message || 'Email sudah terdaftar.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right', 'bottom']}>
        {/* Minimal header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.text}
            />
          </Pressable>
          <Text style={[styles.brandText, { color: theme.text }]}>Valid.</Text>
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
                alt="Sign Up Illustration"
                style={styles.illustration}
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxLopRq1-Hb-UIHJEwydWSKXLXEv96jlQkBMl6iXmCMAxL0_LT1NyvkP_rjI7GH9fHpzTSzmED7AhQnNE9xyfmxVpYgYty81Hi_Ejru7R1PB8ha2Zsj5MFwb-CUWJKbK7lQCguROCyBLsMVT5jpJqvufNoBquqLjasxZqyF_a6X7bgPKFVVmJ1gkkeKiM30dJtNqzfWR8vbYS3dWWSm7kiea1_RecD9R4tKffr_iHCbaIbG-kpBJXVSJVypWZplogFLKmC-XbCqtY',
                }}
                resizeMode="contain"
              />
            </View>

            {/* Typography */}
            <View style={styles.typography}>
              <Text style={[styles.title, { color: theme.text }]}>Mulai Langkah Baru</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Bergabung bersama komunitas penyaring informasi sahih.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Nama Lengkap</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                  placeholder="Budi Santoso"
                  placeholderTextColor={theme.textSecondary}
                  autoComplete="off"
                  importantForAutofill="no"
                  textContentType="none"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                  placeholder="contoh@valid.com"
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
                <Text style={[styles.label, { color: theme.textSecondary }]}>Kata Sandi Baru</Text>
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
                    placeholder="Min. 8 karakter"
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

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Konfirmasi Kata Sandi</Text>
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
                    placeholder="Masukkan ulang kata sandi"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="off"
                    importantForAutofill="no"
                    textContentType="oneTimeCode"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.visibilityButton}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleRegister} disabled={isLoading} style={styles.submitButtonContainer}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={['#4f378a', '#6750a4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.submitButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.submitButtonText}>Daftar Sekarang</Text>
                    )}
                  </LinearGradient>
                )}
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.backgroundElement }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>atau daftar dengan</Text>
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

            {/* Redirection Link (Non-floating) */}
            <View style={styles.footerLinkContainer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Sudah punya akun? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={[styles.loginText, { color: theme.text }]}>Login</Text>
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
    maxWidth: 240,
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
  label: {
    fontSize: 13,
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
    marginTop: Spacing.two,
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
});
