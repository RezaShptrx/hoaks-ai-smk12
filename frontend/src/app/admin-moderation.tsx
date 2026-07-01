import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { apiClient } from '@/services/api-client';

const { width: screenWidth } = Dimensions.get('window');

export default function AdminModerationScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [hoaxReports, setHoaxReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const loadReports = async (status: string, showIndicator = true) => {
    if (showIndicator) setIsLoading(true);
    try {
      const data = await apiClient.fetchHoaxReports(status);
      setHoaxReports(data || []);
    } catch (error) {
      console.warn('Gagal memuat aduan hoaks:', error);
      Alert.alert('Eror', 'Gagal memuat aduan hoaks dari server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports(filterStatus);
  }, [filterStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadReports(filterStatus, false);
  };

  const handleReview = async (reportId: number, status: 'APPROVED' | 'REJECTED') => {
    const actionText = status === 'APPROVED' ? 'menyetujui laporan ini sebagai hoaks' : 'menolak aduan laporan ini';
    Alert.alert(
      'Konfirmasi Moderasi',
      `Apakah Anda yakin ingin ${actionText}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Yakin',
          style: status === 'APPROVED' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await apiClient.reviewHoaxReport(reportId, status);
              Alert.alert('Sukses', `Laporan berhasil di-${status === 'APPROVED' ? 'setujui' : 'tolak'}.`);
              loadReports(filterStatus);
            } catch (error: any) {
              console.warn(error);
              Alert.alert('Gagal', error.message || 'Gagal mengirim tinjauan moderasi.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Custom Header */}
        <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Moderasi Aduan Hoaks</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Panel Khusus Admin Veros</Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            style={({ pressed }) => [styles.refreshButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.text} />
          </Pressable>
        </View>

        {/* Status Tab Filters */}
        <View style={styles.tabContainer}>
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => {
            const isActive = filterStatus === status;
            let label = 'Tertunda';
            let color = '#d97706';
            let icon: any = 'time-outline';

            if (status === 'APPROVED') {
              label = 'Disetujui';
              color = '#15803d';
              icon = 'shield-checkmark-outline';
            } else if (status === 'REJECTED') {
              label = 'Ditolak';
              color = '#ba1a1a';
              icon = 'close-circle-outline';
            }

            return (
              <Pressable
                key={status}
                onPress={() => setFilterStatus(status)}
                style={[
                  styles.tabChip,
                  isActive
                    ? { backgroundColor: color + '15', borderColor: color }
                    : { backgroundColor: theme.backgroundElement, borderColor: 'transparent' }
                ]}
              >
                <Ionicons name={icon} size={15} color={isActive ? color : theme.textSecondary} />
                <Text style={[styles.tabText, { color: isActive ? color : theme.textSecondary }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Reports Content list */}
        {isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00ca92" />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Memuat laporan aduan...</Text>
          </View>
        ) : hoaxReports.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.centerContainer}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#00ca92" />
            }
          >
            <View style={styles.emptyCard}>
              <Ionicons name="shield-checkmark-outline" size={60} color="#00ca92" style={{ opacity: 0.25, marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Antrean Bersih!</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tidak ada laporan hoaks dengan status ini yang memerlukan tinjauan saat ini.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#00ca92" />
            }
          >
            {hoaxReports.map((report) => (
              <View
                key={report.id}
                style={[
                  styles.reportCard,
                  {
                    borderColor: theme.backgroundElement,
                    backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                  }
                ]}
              >
                {/* Card Top Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="folder-open-outline" size={12} color="#00ca92" style={{ marginRight: 4 }} />
                    <Text style={styles.categoryText}>{report.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: report.status === 'APPROVED' ? '#15803d' : report.status === 'REJECTED' ? '#ba1a1a' : '#d97706' }]}>
                    <Text style={[styles.statusBadgeText, { color: report.status === 'APPROVED' ? '#15803d' : report.status === 'REJECTED' ? '#ba1a1a' : '#d97706' }]}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                {/* Reporter details */}
                <View style={styles.infoSection}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>PELAPOR</Text>
                  <View style={styles.reporterRow}>
                    <Ionicons name="person-circle-outline" size={18} color={theme.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={[styles.infoValue, { color: theme.text }]}>
                      {report.reporter?.name || 'Anonim'} <Text style={{ color: theme.textSecondary, fontWeight: 'normal' }}>({report.reporter?.email || 'N/A'})</Text>
                    </Text>
                  </View>
                </View>

                {/* Source URL details */}
                <View style={styles.infoSection}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>URL SUMBER INFORMASI</Text>
                  <View style={[styles.urlBox, { backgroundColor: theme.backgroundElement }]}>
                    <Ionicons name="link-outline" size={14} color="#4285F4" style={{ marginRight: 6 }} />
                    <Text style={[styles.urlText, { color: '#4285F4' }]} numberOfLines={1}>
                      {report.url}
                    </Text>
                  </View>
                </View>

                {/* Notes details */}
                {report.notes ? (
                  <View style={styles.infoSection}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>CATATAN TAMBAHAN</Text>
                    <View style={[styles.notesBox, { backgroundColor: theme.background === '#ffffff' ? '#f5f3f7' : '#171518' }]}>
                      <Text style={[styles.notesText, { color: theme.text }]}>"{report.notes}"</Text>
                    </View>
                  </View>
                ) : null}

                {/* Screenshot details */}
                {report.imagePath ? (
                  <View style={styles.infoSection}>
                    <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 8 }]}>BUKTI TANGKAPAN LAYAR</Text>
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: apiClient.getMediaUrl(report.imagePath) }}
                        style={styles.screenshot}
                        contentFit="contain"
                      />
                    </View>
                  </View>
                ) : null}

                {/* Action buttons (only when status PENDING) */}
                {report.status === 'PENDING' && (
                  <View style={styles.actionsRow}>
                    {/* Approve button */}
                    <Pressable
                      onPress={() => handleReview(report.id, 'APPROVED')}
                      style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.85 }]}
                    >
                      <LinearGradient
                        colors={['#ba1a1a', '#e03d3d']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.approveBtnText}>Setujui Hoaks</Text>
                    </Pressable>

                    {/* Reject button */}
                    <Pressable
                      onPress={() => handleReview(report.id, 'REJECTED')}
                      style={({ pressed }) => [
                        styles.actionButton,
                        styles.rejectBtn,
                        pressed && { opacity: 0.85 },
                        { backgroundColor: theme.backgroundElement }
                      ]}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={theme.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[styles.rejectBtnText, { color: theme.textSecondary }]}>Tolak Aduan</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    marginTop: 1,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    gap: 10,
  },
  tabChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  emptyCard: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: 16,
  },
  reportCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 55, 138, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#00ca92',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  infoSection: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    flex: 1,
  },
  notesBox: {
    padding: 12,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 18,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  screenshot: {
    width: '100%',
    height: 180,
    backgroundColor: '#000000',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
});
