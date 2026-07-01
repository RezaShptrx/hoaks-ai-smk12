import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';

// Session memory to track the report count across screens
let sessionReportCount = 0;

interface ReportHoaxModalProps {
  visible: boolean;
  onClose: () => void;
  prefilledUrl?: string;
  prefilledNotes?: string;
}

export function ReportHoaxModal({ visible, onClose, prefilledUrl = '', prefilledNotes = '' }: ReportHoaxModalProps) {
  const theme = useTheme();
  
  const [category, setCategory] = useState('Politik / SARA');
  const [url, setUrl] = useState(prefilledUrl);
  const [notes, setNotes] = useState(prefilledNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync prefilled data when modal becomes visible
  useEffect(() => {
    if (visible) {
      setUrl(prefilledUrl);
      setNotes(prefilledNotes);
      setSuccess(false);
    }
  }, [visible, prefilledUrl, prefilledNotes]);

  const handleSendReport = () => {
    if (!url.trim()) {
      Alert.alert('Eror', 'Harap isi tautan (link) berita yang dicurigai hoaks.');
      return;
    }

    // Check 5-reports daily limit
    if (sessionReportCount >= 5) {
      Alert.alert(
        'Batas Pengiriman',
        'Anda telah mencapai batas maksimal 5 laporan per hari untuk mencegah spam di sistem kami.'
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate sending data to our backend server
    setTimeout(() => {
      setIsSubmitting(false);
      sessionReportCount += 1;
      setSuccess(true);
      
      // Clean up inputs
      setUrl('');
      setNotes('');
    }, 1500);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1c20' }]}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Laporkan Berita Hoaks</Text>
            <Pressable onPress={onClose} style={styles.closeIcon}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Daily Limit Tracker Badge */}
          <View style={[styles.limitBadge, { backgroundColor: sessionReportCount >= 5 ? '#fde8e8' : '#e1d4fd' }]}>
            <Ionicons 
              name={sessionReportCount >= 5 ? 'warning' : 'stats-chart'} 
              size={14} 
              color={sessionReportCount >= 5 ? '#ba1a1a' : '#00ca92'} 
            />
            <Text style={[styles.limitText, { color: sessionReportCount >= 5 ? '#ba1a1a' : '#00ca92' }]}>
              {sessionReportCount >= 5 
                ? 'Batas harian tercapai (5/5 laporan dikirim)' 
                : `Sisa kuota harian: ${5 - sessionReportCount} / 5 laporan`
              }
            </Text>
          </View>

          {!success ? (
            <View style={styles.form}>
              
              {/* Category */}
              <View style={styles.group}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Kategori Berita</Text>
                <View style={styles.chipRow}>
                  {['Politik / SARA', 'Penipuan / Hadiah', 'Kesehatan / Medis'].map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.chip,
                          isSelected 
                            ? { backgroundColor: '#00ca92' } 
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
              <View style={styles.group}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Tautan / Link Berita</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fbf9fc' : '#121214' }]}
                  placeholder="Contoh: https://facebook.com/posts/abc"
                  placeholderTextColor={theme.textSecondary}
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                />
              </View>

              {/* Notes */}
              <View style={styles.group}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Catatan Tambahan (Opsional)</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: theme.backgroundElement, color: theme.text, backgroundColor: theme.background === '#ffffff' ? '#fbf9fc' : '#121214' }]}
                  placeholder="Mengapa Anda mencurigai ini hoaks?"
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Action Button */}
              {isSubmitting ? (
                <View style={styles.spinnerWrapper}>
                  <ActivityIndicator size="small" color="#00ca92" />
                  <Text style={[styles.spinnerText, { color: theme.textSecondary }]}>Mengirim laporan ke server Veros...</Text>
                </View>
              ) : (
                <Pressable
                  onPress={handleSendReport}
                  disabled={sessionReportCount >= 5}
                  style={styles.submitBtnWrapper}
                >
                  <LinearGradient
                    colors={sessionReportCount >= 5 ? ['#cccccc', '#dddddd'] : ['#00ca92', '#00a87a']}
                    style={styles.submitBtn}
                  >
                    <Text style={styles.submitBtnText}>Kirim Laporan Ke Veros</Text>
                    <Ionicons name="send" size={14} color="#ffffff" />
                  </LinearGradient>
                </Pressable>
              )}

            </View>
          ) : (
            // Success Screen
            <View style={styles.successWrapper}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#15803d" />
              </View>
              <Text style={[styles.successTitle, { color: theme.text }]}>Laporan Terkirim!</Text>
              <Text style={[styles.successDesc, { color: theme.textSecondary }]}>
                Data laporan hoaks telah masuk ke database Veros. Tim verifikator kami akan segera memeriksa klaim ini. Terima kasih atas partisipasi Anda!
              </Text>
              
              <Pressable onPress={onClose} style={styles.okBtn}>
                <Text style={styles.okBtnText}>Selesai</Text>
              </Pressable>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

// Float action button to summon the modal
interface ReportHoaxFabProps {
  onPress: () => void;
}

export function ReportHoaxFab({ onPress }: ReportHoaxFabProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
      <LinearGradient
        colors={['#ba1a1a', '#e63946']}
        style={styles.fabGradient}
      >
        <Ionicons name="megaphone" size={22} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  closeIcon: {
    padding: 4,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  limitText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  form: {
    gap: 16,
  },
  group: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
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
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  textarea: {
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    textAlignVertical: 'top',
  },
  submitBtnWrapper: {
    marginTop: 8,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  spinnerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 48,
  },
  spinnerText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  successWrapper: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  successDesc: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  okBtn: {
    height: 44,
    backgroundColor: '#00ca92',
    borderRadius: 22,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  okBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 52,
    height: 52,
    borderRadius: 26,
    elevation: 5,
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
