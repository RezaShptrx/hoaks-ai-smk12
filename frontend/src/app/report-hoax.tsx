import { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';

// Session memory to track the report count across screens
let dailyReportCount = 0;

export default function ReportHoaxScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [category, setCategory] = useState('Politik / SARA');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotSelected, setScreenshotSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSelectScreenshot = () => {
    // Simulate selecting a file from device gallery
    setScreenshotSelected(true);
  };

  const handleSendReport = () => {
    if (!url.trim()) {
      Alert.alert('Eror', 'Harap masukkan tautan (link) berita yang dicurigai.');
      return;
    }

    if (dailyReportCount >= 5) {
      Alert.alert(
        'Batas Laporan',
        'Anda telah mencapai batas maksimal 5 laporan per hari untuk mencegah spam di sistem kami.'
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate sending report payload to server
    setTimeout(() => {
      setIsSubmitting(false);
      dailyReportCount += 1;
      setSuccess(true);
      
      // Clear inputs
      setUrl('');
      setNotes('');
      setScreenshotSelected(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Laporkan Hoaks</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Daily Limit Tracker */}
          <View style={[styles.limitBadge, { backgroundColor: dailyReportCount >= 5 ? '#fde8e8' : '#e1d4fd' }]}>
            <Ionicons 
              name={dailyReportCount >= 5 ? 'warning' : 'stats-chart'} 
              size={15} 
              color={dailyReportCount >= 5 ? '#ba1a1a' : '#4f378a'} 
            />
            <Text style={[styles.limitText, { color: dailyReportCount >= 5 ? '#ba1a1a' : '#4f378a' }]}>
              {dailyReportCount >= 5 
                ? 'Batas harian tercapai (5/5 laporan terkirim hari ini)' 
                : `Kuota Laporan Hari Ini: ${5 - dailyReportCount} / 5 Laporan Tersisa`
              }
            </Text>
          </View>

          {!success ? (
            <View style={styles.formContainer}>
              <Text style={[styles.introText, { color: theme.textSecondary }]}>
                Bantu komunitas Veritas menyaring berita boaks. Laporan Anda akan diperiksa secara manual oleh dewan verifikator independen kami.
              </Text>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Kategori Konten</Text>
                <View style={styles.chipRow}>
                  {['Politik / SARA', 'Penipuan / Finansial', 'Kesehatan / Medis'].map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.chip,
                          isSelected 
                            ? { backgroundColor: '#4f378a' } 
                            : { backgroundColor: theme.background === '#ffffff' ? '#f2ecf4' : '#29252e' }
                        ]}
                      >
                        <Text style={[styles.chipText, isSelected ? { color: '#ffffff' } : { color: theme.textSecondary }]}>
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* URL */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Tautan / Link Bukti Hoaks</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fbf9fc' : '#121214' }]}
                  placeholder="https://link-berita-palsu.com/..."
                  placeholderTextColor={theme.textSecondary}
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoComplete="off"
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Catatan Kejanggalan (Opsional)</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fbf9fc' : '#121214' }]}
                  placeholder="Berikan alasan mengapa Anda mencurigai konten ini hoaks..."
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Screenshot Upload Simulator */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Unggah Bukti Gambar / Tangkapan Layar</Text>
                <Pressable
                  onPress={handleSelectScreenshot}
                  style={[
                    styles.uploadBox,
                    {
                      borderColor: screenshotSelected ? '#15803d' : theme.backgroundElement,
                      backgroundColor: theme.background === '#ffffff' ? '#fbf9fc' : '#121214'
                    }
                  ]}
                >
                  <Ionicons 
                    name={screenshotSelected ? 'checkmark-circle' : 'cloud-upload-outline'} 
                    size={24} 
                    color={screenshotSelected ? '#15803d' : '#4f378a'} 
                  />
                  <Text style={[styles.uploadText, { color: screenshotSelected ? '#15803d' : theme.textSecondary }]}>
                    {screenshotSelected 
                      ? 'Tangkapan Layar Berhasil Dilampirkan (1 File)' 
                      : 'Pilih File Gambar Bukti'
                    }
                  </Text>
                </Pressable>
              </View>

              {/* Submit Button */}
              {isSubmitting ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#4f378a" />
                  <Text style={[styles.loaderText, { color: theme.textSecondary }]}>Mengirim data laporan ke server...</Text>
                </View>
              ) : (
                <Pressable
                  onPress={handleSendReport}
                  disabled={dailyReportCount >= 5}
                  style={styles.submitBtnWrapper}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={dailyReportCount >= 5 ? ['#cccccc', '#dddddd'] : ['#4f378a', '#6750a4']}
                      style={[styles.submitBtn, pressed && styles.btnPressed]}
                    >
                      <Text style={styles.submitBtnText}>Kirim Laporan</Text>
                      <Ionicons name="paper-plane" size={16} color="#ffffff" />
                    </LinearGradient>
                  )}
                </Pressable>
              )}

            </View>
          ) : (
            // Success State
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={56} color="#15803d" />
              </View>
              <Text style={[styles.successTitle, { color: theme.text }]}>Laporan Berhasil Terkirim</Text>
              <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
                Terima kasih atas laporan Anda. Data telah kami rekam di database server untuk proses verifikasi tim cek fakta. Kami akan memberikan notifikasi hasil verifikasinya segera di beranda Anda.
              </Text>
              <Pressable
                onPress={() => setSuccess(false)}
                style={styles.backHomeBtn}
              >
                <Text style={styles.backHomeBtnText}>Kirim Laporan Baru</Text>
              </Pressable>
            </View>
          )}

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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: Spacing.four,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  formContainer: {
    gap: Spacing.four,
  },
  introText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  textarea: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    textAlignVertical: 'top',
  },
  uploadBox: {
    height: 64,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  loaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 52,
  },
  loaderText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  submitBtnWrapper: {
    marginTop: Spacing.two,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  successDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backHomeBtn: {
    height: 48,
    backgroundColor: '#4f378a',
    borderRadius: 24,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
});
