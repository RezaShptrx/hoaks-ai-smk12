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
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const onboardingParam = params.onboarding === 'true';

  const [isSetupComplete, setIsSetupComplete] = useState(!onboardingParam);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Step 1 Form States
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Politik']);

  // Step 2 Form States
  const [countryCode, setCountryCode] = useState('+62');
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [occupation, setOccupation] = useState('');



  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  // Load profile from backend on mount
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.getProfile();
        if (data) {
          if (data.username) setUsername(data.username);
          if (data.bio) setBio(data.bio);
          if (data.phoneNumber) {
            // Strip country code if match
            if (data.phoneNumber.startsWith('+62')) {
              setCountryCode('+62');
              setPhoneNumber(data.phoneNumber.replace('+62', '').trim());
            } else if (data.phoneNumber.startsWith('+1')) {
              setCountryCode('+1');
              setPhoneNumber(data.phoneNumber.replace('+1', '').trim());
            } else if (data.phoneNumber.startsWith('+65')) {
              setCountryCode('+65');
              setPhoneNumber(data.phoneNumber.replace('+65', '').trim());
            } else {
              setPhoneNumber(data.phoneNumber);
            }
          }
          if (data.address) setAddress(data.address);
          if (data.dob) setDob(data.dob);
          if (data.occupation) setOccupation(data.occupation);
          if (data.interests) {
            setSelectedInterests(data.interests.split(',').filter(Boolean));
          }
        }
      } catch (err) {
        console.warn('[Profile] Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only load if token is available
    if (apiClient.getToken()) {
      loadProfileData();
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const saveProfileData = async () => {
    try {
      const fullPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : '';
      await apiClient.updateProfile({
        username,
        bio,
        phoneNumber: fullPhone,
        address,
        dob,
        occupation,
        interests: selectedInterests.join(','),
      });
    } catch (err) {
      console.warn('[Profile] Failed to save profile:', err);
    }
  };

  const handleNextStep = async () => {
    setIsLoading(true);
    await saveProfileData();
    setIsLoading(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(15);
    setStep(2);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    await saveProfileData();
    setIsLoading(false);
    setShowModal(true);
  };

  const handleGoBack = () => {
    if (step === 2) {
      fadeAnim.setValue(0);
      slideAnim.setValue(15);
      setStep(1);
    } else {
      if (onboardingParam) {
        router.replace('/login');
      } else {
        setIsSetupComplete(true);
      }
    }
  };

  const interestsList = ['Politik', 'Teknologi', 'Kesehatan', 'Hiburan', 'Sains', 'Olahraga'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {isSetupComplete ? (
          /* ================= PROFILE DETAIL TAB ================= */
          <View style={{ flex: 1 }}>
            {/* Header for Tab Profile */}
            <View style={styles.header}>
              <View style={styles.headerPlaceholder} />
              <Text style={[styles.brandText, { color: theme.text }]}>Profil Saya</Text>
              <Pressable onPress={() => setIsSetupComplete(false)} style={styles.editBtnHeader}>
                <Ionicons name="create-outline" size={20} color="#4f378a" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              <View style={styles.contentContainer}>
                
                {/* Profile Card Header */}
                <LinearGradient
                  colors={['#4f378a', '#6750a4']}
                  style={styles.profileDetailCard}>
                  <View style={styles.profileDetailAvatarCircle}>
                    <Ionicons name="person" size={56} color="#ffffff" />
                  </View>
                  <Text style={styles.profileDetailName}>
                    {username ? username : 'Teman Valid'}
                  </Text>
                  <Text style={styles.profileDetailEmail}>
                    {apiClient.getUser()?.email || 'user@valid.com'}
                  </Text>
                  {bio ? (
                    <Text style={styles.profileDetailBio}>{bio}</Text>
                  ) : (
                    <Text style={styles.profileDetailBio}>
                      "Menyaring informasi, membagikan kebenaran."
                    </Text>
                  )}
                </LinearGradient>

                {/* Profile Info Details List */}
                <View style={styles.detailsBlock}>
                  <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Informasi Kontak & Diri</Text>
                  
                  <View style={[styles.detailItem, { borderBottomColor: theme.backgroundElement }]}>
                    <Ionicons name="call-outline" size={18} color={theme.textSecondary} style={{ marginTop: 2 }} />
                    <View style={styles.detailItemText}>
                      <Text style={[styles.detailItemLabel, { color: theme.textSecondary }]}>Nomor Telepon</Text>
                      <Text style={[styles.detailItemValue, { color: theme.text }]}>
                        {phoneNumber ? `${countryCode} ${phoneNumber}` : '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailItem, { borderBottomColor: theme.backgroundElement }]}>
                    <Ionicons name="location-outline" size={18} color={theme.textSecondary} style={{ marginTop: 2 }} />
                    <View style={styles.detailItemText}>
                      <Text style={[styles.detailItemLabel, { color: theme.textSecondary }]}>Alamat Lengkap</Text>
                      <Text style={[styles.detailItemValue, { color: theme.text }]}>
                        {address ? address : '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailItem, { borderBottomColor: theme.backgroundElement }]}>
                    <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} style={{ marginTop: 2 }} />
                    <View style={styles.detailItemText}>
                      <Text style={[styles.detailItemLabel, { color: theme.textSecondary }]}>Tanggal Lahir</Text>
                      <Text style={[styles.detailItemValue, { color: theme.text }]}>
                        {dob ? dob : '-'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.detailItem, { borderBottomColor: theme.backgroundElement }]}>
                    <Ionicons name="briefcase-outline" size={18} color={theme.textSecondary} style={{ marginTop: 2 }} />
                    <View style={styles.detailItemText}>
                      <Text style={[styles.detailItemLabel, { color: theme.textSecondary }]}>Pekerjaan</Text>
                      <Text style={[styles.detailItemValue, { color: theme.text }]}>
                        {occupation ? occupation : '-'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Selected Interests Chips */}
                <View style={styles.detailsBlock}>
                  <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Minat Topik</Text>
                  <View style={styles.chipsRow}>
                    {selectedInterests.map((interest) => (
                      <View key={interest} style={[styles.detailChip, { borderColor: '#4f378a', backgroundColor: '#e1d4fd' }]}>
                        <Text style={{ color: '#22005d', fontSize: 13, fontWeight: '600' }}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Menu Action to Dedicated Favorites Page */}
                <View style={styles.detailsBlock}>
                  <Pressable
                    onPress={() => router.push('/favorite')}
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && styles.buttonPressed,
                      { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1b191c' }
                    ]}
                  >
                    <View style={styles.menuRowLeft}>
                      <Ionicons name="heart" size={20} color="#ba1a1a" />
                      <Text style={[styles.menuRowText, { color: theme.text }]}>Berita Favorit Saya</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </Pressable>

                  {apiClient.getUser().role === 'ADMIN' && (
                    <Pressable
                      onPress={() => router.push('/admin-moderation')}
                      style={({ pressed }) => [
                        styles.menuRow,
                        pressed && styles.buttonPressed,
                        { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1b191c' }
                      ]}
                    >
                      <View style={styles.menuRowLeft}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#4f378a" />
                        <Text style={[styles.menuRowText, { color: theme.text }]}>Moderasi Laporan Hoaks</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </Pressable>
                  )}
                </View>

                {/* Logout / Edit Button */}
                <Pressable
                  onPress={() => setIsSetupComplete(false)}
                  style={[styles.editButton, { borderColor: theme.backgroundElement }]}>
                  <Ionicons name="create-outline" size={16} color={theme.text} />
                  <Text style={[styles.editButtonText, { color: theme.text }]}>Ubah Profil</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    apiClient.setToken(null);
                    apiClient.setUser(null);
                    router.replace('/login');
                  }}
                  style={styles.logoutButton}
                >
                  <Ionicons name="log-out-outline" size={16} color="#ba1a1a" />
                  <Text style={styles.logoutButtonText}>Keluar dari Akun</Text>
                </Pressable>

              </View>
            </ScrollView>
          </View>
        ) : (
          /* ================= WIZARD SETUP SCREEN ================= */
          <View style={{ flex: 1 }}>
            {/* Header Navigation */}
            <View style={styles.header}>
              <Pressable onPress={handleGoBack} style={styles.backButton}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.text}
                />
              </Pressable>
              <Text style={[styles.brandText, { color: theme.text }]}>Lengkapi Profil</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled">
              <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                
                {/* Progress Bar Section */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={[styles.progressStepText, { color: theme.textSecondary }]}>
                      {step === 1 ? 'Langkah 1 dari 2' : 'Langkah 2 dari 2'}
                    </Text>
                    <Text style={[styles.progressPercentText, { color: '#4f378a' }]}>
                      {step === 1 ? '50%' : '100%'}
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.backgroundElement }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: step === 1 ? '50%' : '100%',
                          backgroundColor: '#4f378a',
                        },
                      ]}
                    />
                  </View>
                </View>

                {step === 1 ? (
                  /* ================= STEP 1 SCREEN ================= */
                  <View style={styles.formContainer}>
                    {/* Illustration Step 1 */}
                    <View style={styles.illustrationFrame}>
                      <Image
                        alt="Profile Setup"
                        style={styles.illustration}
                        source={{
                          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAytWGrq8N32vTHTIjdRobhBZMMk_1Nef28TcJT2wPv2gXgaEHdG1Y67VAw3PjNOyPVd3zDQmx6Q4ijXOhxzTUA6-Y7oJFdN7sebkG91uQprPNOzIHZee20tzldh0iZMK-SN1oCl-10WXebJaP8JBCZGNXSss4bnoFO2mn8IyjPI387FwkrPkuAgbXL9KJOrebSoBcFye5s4eHivndGCKZyBtirTtXE1_0UX5hR7Vrx05IH-GJzNw08Tqi5pKKVkiL_hIpshjNtoak',
                        }}
                        contentFit="contain"
                      />
                    </View>

                    {/* Profile Picture Upload Placeholder */}
                    <View style={styles.avatarWrapper}>
                      <View style={[styles.avatarCircle, { backgroundColor: theme.background === '#ffffff' ? '#f2ecf4' : '#2d2a30', borderColor: theme.backgroundElement }]}>
                        <Ionicons
                          name="person"
                          size={48}
                          color={theme.textSecondary}
                        />
                      </View>
                      <Pressable style={styles.avatarEditBtn}>
                        <LinearGradient
                          colors={['#4285F4', '#9B51E0']}
                          style={styles.gradientEditBtn}>
                          <Ionicons
                            name="add"
                            size={16}
                            color="#ffffff"
                          />
                        </LinearGradient>
                      </Pressable>
                      <Text style={[styles.avatarLabel, { color: theme.textSecondary }]}>Unggah Foto</Text>
                    </View>

                    {/* Form Fields Step 1 */}
                    <View style={styles.inputsBlock}>
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Nama Pengguna</Text>
                        <TextInput
                          style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                          placeholder="@username_anda"
                          placeholderTextColor={theme.textSecondary}
                          value={username}
                          onChangeText={setUsername}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <Text style={[styles.label, { color: theme.textSecondary }]}>Bio Singkat</Text>
                          <Text style={[styles.labelCounter, { color: theme.textSecondary }]}>{bio.length}/120</Text>
                        </View>
                        <TextInput
                          style={[styles.textArea, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                          placeholder="Ceritakan sedikit tentang dirimu..."
                          placeholderTextColor={theme.textSecondary}
                          multiline
                          numberOfLines={3}
                          maxLength={120}
                          value={bio}
                          onChangeText={setBio}
                        />
                      </View>

                      {/* Interests Chips */}
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Minat (Pilih minimal 2)</Text>
                        <View style={styles.chipsRow}>
                          {interestsList.map((interest) => {
                            const isActive = selectedInterests.includes(interest);
                            return (
                              <Pressable
                                key={interest}
                                onPress={() => toggleInterest(interest)}
                                style={[
                                  styles.chip,
                                  isActive
                                    ? [styles.chipActive, { borderColor: '#4f378a', backgroundColor: '#e1d4fd' }]
                                    : [styles.chipInactive, { borderColor: theme.backgroundElement }],
                                ]}>
                                <Text style={[styles.chipText, isActive ? { color: '#22005d', fontWeight: '600' } : { color: theme.textSecondary }]}>
                                  {interest}
                                </Text>
                                {isActive && (
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={14}
                                    color="#22005d"
                                  />
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </View>

                    {/* Actions Step 1 */}
                    <View style={styles.actionsWrapper}>
                      <Pressable onPress={handleNextStep} disabled={isLoading} style={styles.primaryButtonContainer}>
                        {({ pressed }) => (
                          <LinearGradient
                            colors={['#4285F4', '#9B51E0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.primaryButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                            {isLoading ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Text style={styles.primaryButtonText}>Simpan & Lanjutkan</Text>
                            )}
                          </LinearGradient>
                        )}
                      </Pressable>

                      <Pressable onPress={handleNextStep} style={styles.secondaryButton}>
                        <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>Lewati untuk sekarang</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  /* ================= STEP 2 SCREEN ================= */
                  <View style={styles.formContainer}>
                    {/* Illustration Step 2 */}
                    <View style={styles.illustrationFrame}>
                      <Image
                        alt="Profile Setup Complete"
                        style={styles.illustration}
                        source={{
                          uri: 'https://lh3.googleusercontent.com/aida/AP1WRLtYXm2DOTB4La51LNvgdrjudy6UW_390DN0g_bvdyEw1TXgsgRC9H3mUp8YnGQAbMbb38avqvNNjSktlGeVfR6YvOwLUwEpHiwqLDXeVZRXiNJABpyKpJLGyVE1YADMlYAJDsoavAyLkxvkk8oEo_CwRSly3U_vfJV5Yc5QAn40vEOtQZF8KKRXwU7sfuE146L9kSJXjEBQwMnm6IcaLeksj-NMxU9rTySOUdlSxBfoQUoWofnP67CFHQM',
                        }}
                        contentFit="contain"
                      />
                    </View>

                    {/* Subtitle Message Step 2 */}
                    <View style={styles.stepHeader}>
                      <Text style={[styles.stepTitle, { color: theme.text }]}>Sedikit lagi...</Text>
                      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
                        Informasi ini akan membantu kami memvalidasi identitas Anda dan menyesuaikan pengalaman di Valid.
                      </Text>
                    </View>

                    {/* Form Fields Step 2 */}
                    <View style={styles.inputsBlock}>
                      {/* Phone Number Selector Row */}
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Nomor Telepon</Text>
                        <View style={styles.phoneInputRow}>
                          <View style={styles.dropdownWrapper}>
                            <Pressable
                              onPress={() => setShowCodeDropdown(!showCodeDropdown)}
                              style={[
                                styles.dropdownBtn,
                                {
                                  borderColor: theme.backgroundElement,
                                  backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214',
                                },
                              ]}>
                              <Text style={{ color: theme.text, fontSize: 14 }}>{countryCode}</Text>
                              <Ionicons
                                name="chevron-down"
                                size={14}
                                color={theme.textSecondary}
                              />
                            </Pressable>

                            {showCodeDropdown && (
                              <View style={[styles.dropdownList, { backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21', borderColor: theme.backgroundElement }]}>
                                {['+62', '+1', '+65'].map((code) => (
                                  <Pressable
                                    key={code}
                                    onPress={() => {
                                      setCountryCode(code);
                                      setShowCodeDropdown(false);
                                    }}
                                    style={styles.dropdownItem}>
                                    <Text style={{ color: theme.text, fontSize: 13 }}>{code}</Text>
                                  </Pressable>
                                ))}
                              </View>
                            )}
                          </View>

                          <TextInput
                            style={[
                              styles.phoneInput,
                              {
                                borderColor: theme.backgroundElement,
                                color: theme.text,
                                backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214',
                              },
                            ]}
                            placeholder="812 3456 7890"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                          />
                        </View>
                      </View>

                      {/* Address Textarea */}
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Alamat Lengkap</Text>
                        <TextInput
                          style={[styles.textArea, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                          placeholder="Jl. Kebenaran No. 42, Jakarta Pusat"
                          placeholderTextColor={theme.textSecondary}
                          multiline
                          numberOfLines={3}
                          value={address}
                          onChangeText={setAddress}
                        />
                      </View>

                      {/* Optional Fields Date & Occupation */}
                      <View style={styles.gridRow}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Tgl Lahir <Text style={{ fontSize: 11, fontWeight: 'normal' }}>(Opsional)</Text>
                          </Text>
                          <TextInput
                            style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textSecondary}
                            value={dob}
                            onChangeText={setDob}
                          />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={[styles.label, { color: theme.textSecondary }]}>
                            Pekerjaan <Text style={{ fontSize: 11, fontWeight: 'normal' }}>(Opsional)</Text>
                          </Text>
                          <TextInput
                            style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214' }]}
                            placeholder="Mis: Jurnalis"
                            placeholderTextColor={theme.textSecondary}
                            value={occupation}
                            onChangeText={setOccupation}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Actions Step 2 */}
                    <View style={styles.actionsWrapper}>
                      <Pressable onPress={handleFinish} disabled={isLoading} style={styles.primaryButtonContainer}>
                        {({ pressed }) => (
                          <LinearGradient
                            colors={['#4f378a', '#6750a4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.primaryButton, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}>
                            {isLoading ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Text style={styles.primaryButtonText}>Selesai</Text>
                            )}
                          </LinearGradient>
                        )}
                      </Pressable>

                      <Pressable onPress={handleFinish} style={styles.secondaryButton}>
                        <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>Lewati untuk sekarang</Text>
                      </Pressable>

                      <Text style={[styles.footerNoticeText, { color: theme.textSecondary }]}>
                        Data Anda dienkripsi dan hanya digunakan untuk keperluan verifikasi akun di platform Valid.
                      </Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>

      {/* Success Modal Dialogue */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }]}>
            <View style={[styles.successIconWrapper, { backgroundColor: '#e1d4fd' }]}>
              <Ionicons
                name="checkmark-circle"
                size={40}
                color="#4f378a"
              />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Profil Diperbarui!</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Terima kasih telah melengkapi data diri Anda. Sekarang Anda siap menjelajahi kebenaran.
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false);
                setIsSetupComplete(true);
                router.replace('/home');
              }}
              style={styles.modalBtnContainer}>
              {({ pressed }) => (
                <LinearGradient
                  colors={['#4f378a', '#6750a4']}
                  style={[styles.modalBtn, pressed && styles.buttonPressed]}>
                  <Text style={styles.modalBtnText}>Ke Beranda</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    width: '100%',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 480,
    marginBottom: Spacing.four,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressStepText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Be Vietnam Pro',
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  formContainer: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  illustrationFrame: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: Spacing.five,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 24,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientEditBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'Be Vietnam Pro',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    width: '100%',
    paddingHorizontal: Spacing.two,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 6,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
  },
  inputsBlock: {
    width: '100%',
    gap: Spacing.three,
    marginBottom: Spacing.six,
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
    marginLeft: 4,
  },
  labelCounter: {
    fontSize: 11,
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
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    // Styled dynamically
  },
  chipInactive: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  dropdownWrapper: {
    position: 'relative',
    minWidth: 90,
  },
  dropdownBtn: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 50,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Be Vietnam Pro',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionsWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonContainer: {
    width: '100%',
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  footerNoticeText: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    opacity: 0.6,
    paddingHorizontal: Spacing.four,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtnContainer: {
    width: '100%',
  },
  modalBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  editBtnHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetailCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  profileDetailAvatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileDetailName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 2,
  },
  profileDetailEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 12,
  },
  profileDetailBio: {
    color: '#ffffff',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  detailsBlock: {
    width: '100%',
    maxWidth: 480,
    marginBottom: Spacing.five,
    gap: Spacing.two,
  },
  detailsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailItemText: {
    flex: 1,
    gap: 2,
  },
  detailItemLabel: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  detailItemValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  detailChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 480,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 480,
    height: 48,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#ba1a1a',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 8,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
});
