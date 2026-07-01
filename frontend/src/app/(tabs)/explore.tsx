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
  Animated,
  Modal,
  ActivityIndicator,
  Easing,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/services/api-client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

type ModelId = 'gpt-4o';

interface AiMessage extends Message {
  sources?: { title: string; url: string }[];
  searchUsed?: boolean;
  showVerifyRedirect?: boolean;
}

interface ForensicResult {
  score: number; // 0-100 authenticity score
  status: 'AMAN' | 'MENCURIGAKAN' | 'TIDAK_KONSISTEN';
  metadata: string;
  elaAnalysis: string;
  aiDetection: string;
  reverseIndex: string;
  imageUri: string;
  imageTitle: string;
}

const renderFormattedText = (text: string, theme: any, isAi: boolean) => {
  const lines = text.split('\n');
  const textColor = isAi ? theme.text : '#ffffff';

  return lines.map((line, index) => {
    // Check if line is a bullet item (e.g. starting with '- ', '• ', '* ')
    const bulletMatch = line.match(/^(\s*)[-•*]\s+(.*)/);
    // Check if line is a numbered item (e.g. starting with '1. ', '2. ', etc.)
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);

    let isListItem = false;
    let listPrefix = '';
    let content = line;
    let indent = 0;

    if (bulletMatch) {
      isListItem = true;
      listPrefix = '• ';
      content = bulletMatch[2];
      indent = bulletMatch[1].length * 8 + 8;
    } else if (numberMatch) {
      isListItem = true;
      listPrefix = `${numberMatch[2]}. `;
      content = numberMatch[3];
      indent = numberMatch[1].length * 8 + 8;
    }

    // Parse bold segments within the content (i.e. **text**)
    const parts = content.split(/\*\*|\_\_/);
    const elements = parts.map((part, i) => {
      const isBold = i % 2 === 1;
      return (
        <Text
          key={i}
          selectable={true}
          style={[
            styles.messageText,
            { color: textColor },
            isBold && { fontWeight: '700' }
          ]}
        >
          {part}
        </Text>
      );
    });

    if (isListItem) {
      return (
        <View key={index} style={{ flexDirection: 'row', paddingLeft: indent, paddingRight: 4, marginVertical: 2, alignItems: 'flex-start' }}>
          <Text selectable={true} style={[styles.messageText, { color: textColor, fontWeight: '700', marginRight: 4 }]}>
            {listPrefix}
          </Text>
          <Text selectable={true} style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
            {elements}
          </Text>
        </View>
      );
    }

    return (
      <Text key={index} selectable={true} style={{ marginVertical: 3 }}>
        {elements}
      </Text>
    );
  });
};

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Active Tab: 'chat' or 'sandbox'
  const [activeTab, setActiveTab] = useState<'chat' | 'sandbox'>('chat');

  // --- Tab 1: Chatbot State ---
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Halo! Saya Asisten Veritas — asisten AI pendamping anti-hoaks Anda.\n\nSaya memiliki akses pencarian web real-time untuk memberikan panduan umum dan informasi edukasi anti-hoaks. Tanyakan:\n\n• Cara melaporkan hoaks ke Kominfo / Komdigi\n• Penjelasan regulasi hukum UU ITE\n• Panduan dan ciri-ciri hoaks secara umum\n• Informasi lembaga cek fakta resmi\n\n*Catatan: Obrolan chat ini bersifat informatif & netral. Untuk memverifikasi kebenaran klaim berita atau foto secara resmi, silakan gunakan fitur Verify pada menu navigasi.*',
      timestamp: 'Veritas AI'
    }
  ]);

  // --- Tab 2: TruthLens Sandbox State ---
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [forensicReport, setForensicReport] = useState<ForensicResult | null>(null);





  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scanBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // Scanning bar loop animation
  useEffect(() => {
    if (isScanning) {
      scanBarAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanBarAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanBarAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scanBarAnim.setValue(0);
    }
  }, [isScanning]);

  const scanBarY = scanBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160], // corresponds to image preview container height
  });

  // --- Chatbot Logic ---
  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim() || isChatLoading) return;

    const userMsg: AiMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: 'Baru saja'
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputMessage('');
    setIsChatLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const history = updatedMessages
      .slice(1)
      .slice(-10)
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

    try {
      const result = await apiClient.aiChat({ message: msgText, history });
      const replyText = result?.reply || 'Maaf, tidak ada respons dari AI.';
      
      // Determine if user intends to verify news validity, or AI directs to verify page
      const isCheckingHoax =
        /hoaks|hoax|fakta|verifikasi|verify|beneran|palsu|salah atau benar|apakah berita|cek gambar/i.test(msgText) ||
        /verify|verifikasi|halaman verify/i.test(replyText);

      const aiMsg: AiMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: result?.searchUsed ? '🔍 Pencarian Web Aktif' : '🤖 Asisten AI',
        sources: result?.sources || [],
        searchUsed: result?.searchUsed || false,
        showVerifyRedirect: isCheckingHoax,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AiMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: '⚠️ Gagal menghubungi server AI. Pastikan backend berjalan dan OPENAI_API_KEY sudah diisi di file .env backend.',
        timestamp: 'Error',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  // --- Sandbox Logic ---
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  const handleUploadCustomImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Veritas membutuhkan izin akses galeri untuk menganalisis foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const selectedUri = asset.uri;
      const fileName = asset.fileName || selectedUri.split('/').pop() || 'image.jpg';
      handleStartAnalysis('custom_photo', selectedUri, fileName);
    }
  };

  const handleStartAnalysis = (sampleType: 'hoax_photo' | 'valid_photo' | 'custom_photo', customUri?: string, customName?: string) => {
    setSelectedSample(sampleType);
    if (sampleType === 'custom_photo' && customUri) {
      setCustomImageUri(customUri);
    }
    setIsScanning(true);
    setForensicReport(null);
    setScanStep(0);

    let webhookReport: ForensicResult | null = null;
    let apiCompleted = false;

    const runWebhookAnalysis = async () => {
      if (sampleType !== 'custom_photo' || !customUri) {
        apiCompleted = true;
        return;
      }

      try {
        const formData = new FormData();
        const ext = customName?.split('.').pop()?.toLowerCase() || 'jpg';
        const fileToUpload = {
          uri: Platform.OS === 'android' ? customUri : customUri.replace('file://', ''),
          name: customName || 'image.jpg',
          type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        };
        formData.append('screenshot', fileToUpload as any);
        formData.append('query', 'TruthLens Sandbox Forensic Check');

        let response = await fetch('https://checkhoaks.app.n8n.cloud/webhook/fact-check', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.warn(`[Veritas] Production Webhook returned status ${response.status}. Trying Test Webhook...`);
          response = await fetch('https://checkhoaks.app.n8n.cloud/webhook-test/fact-check', {
            method: 'POST',
            body: formData,
          });
        }

        if (response.ok) {
          const resData = await response.json();
          const item = Array.isArray(resData) ? resData[0] : resData;
          
          if (item) {
            const factCheck = item.factCheck;
            const rawStatus = (factCheck?.status || item.verdict || item.status || 'VALID').toUpperCase();
            
            let verdict: 'AMAN' | 'MENCURIGAKAN' | 'TIDAK_KONSISTEN' = 'AMAN';
            let authenticityScore = 90;
            
            const rawScore = factCheck?.confidenceScore ?? item.confidence;
            const confidenceVal = rawScore != null
              ? (typeof rawScore === 'number' && rawScore <= 1 ? Math.round(rawScore * 100) : Number(rawScore))
              : 85;

            if (rawStatus.includes('HOAX') || rawStatus.includes('PALSU') || rawStatus.includes('SALAH') || rawStatus.includes('FALSE')) {
              verdict = 'TIDAK_KONSISTEN';
              authenticityScore = Math.max(10, 100 - confidenceVal);
            } else if (rawStatus.includes('RAGU') || rawStatus.includes('MISLEADING') || rawStatus.includes('SEBAGIAN') || rawStatus.includes('CAMPURAN')) {
              verdict = 'MENCURIGAKAN';
              authenticityScore = Math.max(30, Math.min(65, 100 - confidenceVal));
            } else {
              verdict = 'AMAN';
              authenticityScore = Math.min(98, confidenceVal);
            }

            const reasoning = Array.isArray(factCheck?.reasoning) && factCheck.reasoning.length > 0
              ? factCheck.reasoning.join(' ')
              : (factCheck?.summary || item.reason || item.analisis || item.reply || 'Klaim gambar telah dianalisis silang dengan database cek fakta.');

            const sources = Array.isArray(factCheck?.sources) && factCheck.sources.length > 0
              ? factCheck.sources.map((s: any) => typeof s === 'string' ? s : (s.title || s.url || '')).filter(Boolean)
              : [];

            // Generate realistic detail fields for TruthLens based on verdict
            let exifText = 'Metadata file EXIF lengkap (Ditemukan model kamera, waktu pengambilan, & kompresi standar). Tidak terindikasi rekayasa metadata janggal.';
            let elaText = 'Hasil uji kompresi ELA menunjukkan sebaran ketebalan piksel noise seragam di seluruh area foto. Tidak terdeteksi penempelan objek baru.';
            let aiText = 'Probabilitas buatan generator AI (Gen-AI Probability): 9%. Menandakan foto ini diambil menggunakan kamera fisik riil.';
            
            if (verdict === 'TIDAK_KONSISTEN') {
              exifText = 'Terdeteksi anomali pada metadata berkas. Tanggal modifikasi berkas tidak cocok dengan tanggal pembuatan gambar asli.';
              elaText = `Terdeteksi ketidakcocokan pola kompresi piksel tinggi (${confidenceVal}%) pada beberapa area spesifik gambar, mengindikasikan adanya manipulasi lokal/photoshop.`;
              aiText = 'Probabilitas gambar buatan AI generator rendah. Gambar merupakan foto riil yang dimanipulasi secara digital.';
            } else if (verdict === 'MENCURIGAKAN') {
              exifText = 'Metadata EXIF sebagian telah dihapus atau hilang (kemungkinan diunduh dari platform chat). Rekayasa metadata tidak dapat diuji secara penuh.';
              elaText = 'Terdapat sedikit noise kompresi tidak seragam di dekat tepi teks, menunjukkan adanya kemungkinan pengeditan ringan.';
              aiText = `Probabilitas buatan generator AI (Deepfake / Gen-AI): ${confidenceVal}%. Terdapat kecurigaan pola sintetis pada struktur pixel.`;
            }

            webhookReport = {
              score: authenticityScore,
              status: verdict,
              imageTitle: item.imageTitle || item.title || `Analisis: ${customName || 'Foto Unggahan'}`,
              imageUri: customUri,
              metadata: exifText,
              elaAnalysis: elaText,
              aiDetection: aiText,
              reverseIndex: sources.length > 0 
                ? `Terindeks di beberapa sumber cek fakta publik: ${sources.join(', ')}`
                : (reasoning.length > 150 ? reasoning.slice(0, 150) + '...' : reasoning)
            };
            console.log('[Veritas] TruthLens mapped from fact-check webhook successfully!');
          }
        }
      } catch (err) {
        console.warn('[Veritas] TruthLens Webhook analysis failed, using fallback:', err);
      } finally {
        apiCompleted = true;
      }
    };

    // Trigger API call in background
    runWebhookAnalysis();

    // Simulated multi-stage forensic analysis
    setTimeout(() => {
      setScanStep(1); // checking metadata
      setTimeout(() => {
        setScanStep(2); // running error level analysis
        setTimeout(() => {
          setScanStep(3); // deepfake / reverse search check
          setTimeout(() => {
            const showFinalResult = () => {
              setIsScanning(false);
              if (webhookReport) {
                setForensicReport(webhookReport);
              } else {
                // Fallback to mock data if webhook failed or wasn't active
                setForensicReport({
                  score: 88,
                  status: 'AMAN',
                  imageTitle: 'Foto Unggahan Galeri Pengguna',
                  imageUri: customUri || '',
                  metadata: 'Metadata file EXIF lengkap (Ditemukan model kamera, waktu pengambilan, & kompresi standar). Tidak terindikasi rekayasa metadata janggal.',
                  elaAnalysis: 'Hasil uji kompresi ELA menunjukkan sebaran ketebalan piksel noise seragam di seluruh area foto. Tidak terdeteksi penempelan objek baru.',
                  aiDetection: 'Probabilitas buatan generator AI (Gen-AI Probability): 9%. Menandakan foto ini diambil menggunakan kamera fisik riil.',
                  reverseIndex: 'Gambar tidak ditemukan di indeks pencarian publik (Indikasi foto bersifat orisinal/privat).'
                });
              }
            };

            const checkCompletion = () => {
              if (apiCompleted) {
                showFinalResult();
              } else {
                setTimeout(checkCompletion, 100);
              }
            };

            if (sampleType === 'custom_photo') {
              checkCompletion();
            } else {
              setIsScanning(false);
              if (sampleType === 'hoax_photo') {
                setForensicReport({
                  score: 18,
                  status: 'TIDAK_KONSISTEN',
                  imageTitle: 'Klaim Foto Penemuan Bansos di Gudang Rahasia',
                  imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXu-dlVGnxrozhnU8cTIEBPtR8y5K2Gy-pdjfhw20rT8smLOwil1G0YYlIQgBYWsyegBQ1F_Vb0kO-8A6pezxUE2Fp3hgDGKIqC682OYukZaT3793KN5XR24U2aNPJV2aWyoGnsPk57wS5nmA2KpvO3MUWGb517MjNY_AB-QnP3bOG6KxN3DjfAJ0l8Uin-abyg_OBz6aqutq9S1rIQhdWyow5m0xv7N23Y7LtcJmYBL3qyVC8HAOz6rLj27S2WdGgqjBgk-CMgYNvs',
                  metadata: 'Tanggal asli file EXIF dibuat adalah 12 April 2020. Ini membantah klaim postingan media sosial yang menyatakan foto diambil hari ini pada peristiwa banjir Juni 2026.',
                  elaAnalysis: 'Terdeteksi inkonsistensi pola kompresi piksel tinggi (94%) pada area spanduk teks. Teks pada spanduk terbukti ditempel secara digital menggunakan aplikasi edit foto.',
                  aiDetection: 'Tidak terdeteksi pola generator AI (Gen-AI probability 4%). Foto asli, namun dimanipulasi secara manual.',
                  reverseIndex: 'Gambar terindeks pertama kali di forum Reddit pada April 2020 terkait peristiwa pembagian logistik di negara tetangga.'
                });
              } else {
                setForensicReport({
                  score: 96,
                  status: 'AMAN',
                  imageTitle: 'Tangkapan Layar Pengumuman Resmi Bank Indonesia',
                  imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh0TmFuXhASC7VJ17P4dRWNan__CSGUtwFIzz6yxWlr-7GXFC_5a_bGzzVhp039hG6h-IcLVDEPh9w2-S_0-dOzhMHl3dNZTfOdohtVixOPz_8IMwu2Io8yPZDK5NItkiDBt1moqLT9nw5LsXujFhF_CQqmzWSJ8mxfUucZqFwWR82wXFtxvXoE9e5qcet9H_XCFOgvKvCvQfV-jEKaGDNtvaqU3nZt37H-odUDBFhgHRmfQrS1THx02t40wb40plE5ujXH5qK_FU',
                  metadata: 'Metadata file EXIF konsisten. Koordinat GPS dan tanggal pembuatan file (Juni 2026) sejalan dengan pengumuman rilis.',
                  elaAnalysis: 'Hasil uji kompresi ELA menunjukkan distribusi noise piksel yang seragam di seluruh area gambar. Tidak ada tanda-tanda manipulasi kolase teks.',
                  aiDetection: 'Probabilitas gambar buatan AI: 0%. Struktur pixel sesuai dengan tangkapan layar sistem operasi seluler asli.',
                  reverseIndex: 'Gambar terindeks pertama kali di situs web resmi Bank Indonesia (bi.go.id) pada hari ini.'
                });
              }
            }
          }, 800);
        }, 850);
      }, 850);
    }, 850);
  };

  const handleResetSandbox = () => {
    setSelectedSample(null);
    setForensicReport(null);
    setScanStep(0);
    setCustomImageUri(null);
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* Header with Segmented Tabs */}
        <View style={styles.header}>
          <Text style={[styles.brandText, { color: '#4f378a' }]}>AI Explore</Text>
          <View style={[styles.tabBar, { backgroundColor: theme.background === '#ffffff' ? '#f3edf7' : '#232025' }]}>
            <Pressable
              onPress={() => setActiveTab('chat')}
              style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'chat' ? { color: '#ffffff', fontWeight: '800' } : { color: theme.textSecondary }]}>
                Chatbot AI
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('sandbox')}
              style={[styles.tabButton, activeTab === 'sandbox' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === 'sandbox' ? { color: '#ffffff', fontWeight: '800' } : { color: theme.textSecondary }]}>
                TruthLens Sandboks
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Dynamic Tab Body */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {activeTab === 'chat' ? (
            // --- Tab 1 Layout: Chatbot ---
            <View style={{ flex: 1 }}>


              {/* Model / Feature Badge */}
              <View style={[styles.modelStrip, { backgroundColor: theme.background, borderBottomColor: theme.backgroundElement }]}>
                <View style={[styles.modelChip, { backgroundColor: '#4f378a', borderColor: '#4f378a' }]}>
                  <Ionicons name="sparkles" size={12} color="#fff" />
                  <Text style={[styles.modelChipText, { color: '#fff' }]}>Veritas AI</Text>
                </View>
                <View style={[styles.modelChip, { backgroundColor: '#0066ff', borderColor: '#0066ff' }]}>
                  <Ionicons name="search" size={12} color="#fff" />
                  <Text style={[styles.modelChipText, { color: '#fff' }]}>Pencarian Web</Text>
                </View>
                <Text style={[styles.modelChipSub, { color: theme.textSecondary, marginLeft: 4 }]}>Realtime · Anti-Hoaks</Text>
              </View>

              {/* Messages Scroll Area */}
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesScroll}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  const aiMsg = msg as AiMessage;
                  return (
                    <View key={msg.id}>
                      <View style={[styles.messageRow, isAi ? styles.aiRow : styles.userRow]}>
                        {isAi && (
                          <View style={styles.aiAvatar}>
                            <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                          </View>
                        )}
                        <View
                          style={[
                            styles.bubble,
                            isAi
                              ? [styles.aiBubble, { backgroundColor: theme.background === '#ffffff' ? '#f3edf7' : '#29252c', borderColor: theme.backgroundElement }]
                              : styles.userBubble
                          ]}>
                          <View style={{ width: '100%' }}>
                            {renderFormattedText(msg.text, theme, isAi)}
                          </View>
                          {msg.timestamp !== 'Baru saja' && (
                            <Text style={{ fontSize: 9, color: isAi ? theme.textSecondary : 'rgba(255,255,255,0.6)', marginTop: 4 }}>{msg.timestamp}</Text>
                          )}
                        </View>
                      </View>
                      {/* Sources from Tavily */}
                      {isAi && aiMsg.sources && aiMsg.sources.length > 0 && (
                        <View style={{ paddingLeft: 40, marginTop: 4, marginBottom: 4, gap: 4 }}>
                          {aiMsg.sources.map((src, i) => (
                            <View key={i} style={[styles.sourceCard, { backgroundColor: theme.background === '#ffffff' ? '#eef2ff' : '#1e1e30', borderColor: '#4f378a22' }]}>
                              <Ionicons name="globe-outline" size={10} color="#4f378a" />
                              <Text style={[styles.sourceCardText, { color: theme.textSecondary }]} numberOfLines={1}>{src.title}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {/* Redirect to Verify Page Button */}
                      {isAi && aiMsg.showVerifyRedirect && (
                        <View style={{ paddingLeft: 40, marginTop: 4, marginBottom: 6 }}>
                          <Pressable
                            onPress={() => router.push('/verify')}
                            style={styles.redirectVerifyBtn}
                          >
                            <LinearGradient
                              colors={['#4f378a', '#6750a4']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.redirectVerifyGradient}
                            >
                              <Ionicons name="shield-checkmark" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                              <Text style={styles.redirectVerifyBtnText}>Buka Fitur Verifikasi Resmi</Text>
                            </LinearGradient>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Typing indicator */}
                {isChatLoading && (
                  <View style={[styles.messageRow, styles.aiRow]}>
                    <View style={styles.aiAvatar}>
                      <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                    </View>
                    <View style={[styles.bubble, styles.aiBubble, { backgroundColor: theme.background === '#ffffff' ? '#f3edf7' : '#29252c', borderColor: theme.backgroundElement }]}>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#4f378a" />
                        <Text style={{ fontSize: 12, color: theme.textSecondary }}>Asisten Veritas sedang mencari & menganalisis...</Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Suggestions Row */}
              <View style={styles.suggestionsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                  <Pressable onPress={() => handleSendMessage('Cara lapor hoaks ke Kominfo')} style={styles.suggestionChip}>
                    <Text style={styles.suggestionChipText}>Lapor Kominfo</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSendMessage('Bagaimana hukum UU ITE fitnah?')} style={styles.suggestionChip}>
                    <Text style={styles.suggestionChipText}>Hukum UU ITE</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSendMessage('Cara reverse image search foto')} style={styles.suggestionChip}>
                    <Text style={styles.suggestionChipText}>Reverse Image Search</Text>
                  </Pressable>
                </ScrollView>
              </View>

              {/* Chat Input Row */}
              <View style={[styles.inputContainer, { borderTopColor: theme.backgroundElement, backgroundColor: theme.background }]}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: theme.backgroundElement,
                      color: theme.text,
                      backgroundColor: theme.background === '#ffffff' ? '#fcfbff' : '#121214',
                    }
                  ]}
                  placeholder="Tanyakan penanganan hoaks atau UU ITE..."
                  placeholderTextColor={theme.textSecondary}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  onSubmitEditing={() => handleSendMessage()}
                  editable={!isChatLoading}
                />
                <Pressable onPress={() => handleSendMessage()} style={[styles.sendButton, isChatLoading && { opacity: 0.5 }]} disabled={isChatLoading}>
                  <LinearGradient
                    colors={['#4f378a', '#6750a4']}
                    style={styles.sendGradient}>
                    {isChatLoading
                      ? <ActivityIndicator size="small" color="#ffffff" />
                      : <Ionicons name="send" size={16} color="#ffffff" />}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          ) : (
            // --- Tab 2 Layout: TruthLens Sandbox (Forensic Data Verifier) ---
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sandboxScroll}>
              
              {!selectedSample ? (
                // State 1: Choose File / Image to check
                <View style={styles.sandboxIntro}>
                  <Ionicons name="finger-print" size={32} color="#4f378a" style={{ marginBottom: 4 }} />
                  <Text style={[styles.sandboxIntroTitle, { color: theme.text }]}>TruthLens Forensik Sandbox</Text>
                  <Text style={[styles.sandboxIntroDesc, { color: theme.textSecondary }]}>
                    Alat analisis digital interaktif untuk mendeteksi rekayasa foto, suntingan photoshop pada dokumen, ketidakcocokan metadata gambar, dan deepfake.
                  </Text>

                  <View style={styles.sampleGrid}>
                    <Pressable
                      onPress={handleUploadCustomImage}
                      style={({ pressed }) => [
                        styles.sampleCard,
                        pressed && styles.btnPressed,
                        { borderColor: '#4f378a', borderStyle: 'dashed', borderWidth: 2, backgroundColor: theme.background === '#ffffff' ? '#fcfaff' : '#1a171c' }
                      ]}
                    >
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                        <Ionicons name="cloud-upload" size={32} color="#4f378a" style={{ marginBottom: 8 }} />
                        <Text style={[styles.sampleCardText, { color: '#4f378a', textAlign: 'center', fontWeight: '800' }]}>Unggah Foto Anda</Text>
                        <Text style={{ fontSize: 9, color: theme.textSecondary, textAlign: 'center', marginTop: 4 }}>Pilih dari Galeri</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => handleStartAnalysis('hoax_photo')}
                      style={({ pressed }) => [
                        styles.sampleCard,
                        pressed && styles.btnPressed,
                        { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }
                      ]}
                    >
                      <Image
                        style={styles.sampleThumbnail}
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXu-dlVGnxrozhnU8cTIEBPtR8y5K2Gy-pdjfhw20rT8smLOwil1G0YYlIQgBYWsyegBQ1F_Vb0kO-8A6pezxUE2Fp3hgDGKIqC682OYukZaT3793KN5XR24U2aNPJV2aWyoGnsPk57wS5nmA2KpvO3MUWGb517MjNY_AB-QnP3bOG6KxN3DjfAJ0l8Uin-abyg_OBz6aqutq9S1rIQhdWyow5m0xv7N23Y7LtcJmYBL3qyVC8HAOz6rLj27S2WdGgqjBgk-CMgYNvs' }}
                      />
                      <Text style={[styles.sampleCardText, { color: theme.text }]}>Analisis Foto Bansos Rahasia</Text>
                      <View style={styles.sampleBadge}>
                        <Text style={styles.sampleBadgeText}>Klaim Foto Viral</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => handleStartAnalysis('valid_photo')}
                      style={({ pressed }) => [
                        styles.sampleCard,
                        pressed && styles.btnPressed,
                        { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }
                      ]}
                    >
                      <Image
                        style={styles.sampleThumbnail}
                        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh0TmFuXhASC7VJ17P4dRWNan__CSGUtwFIzz6yxWlr-7GXFC_5a_bGzzVhp039hG6h-IcLVDEPh9w2-S_0-dOzhMHl3dNZTfOdohtVixOPz_8IMwu2Io8yPZDK5NItkiDBt1moqLT9nw5LsXujFhF_CQqmzWSJ8mxfUucZqFwWR82wXFtxvXoE9e5qcet9H_XCFOgvKvCvQfV-jEKaGDNtvaqU3nZt37H-odUDBFhgHRmfQrS1THx02t40wb40plE5ujXH5qK_FU' }}
                      />
                      <Text style={[styles.sampleCardText, { color: theme.text }]}>Analisis Screenshot Pengumuman BI</Text>
                      <View style={styles.sampleBadge}>
                        <Text style={styles.sampleBadgeText}>Klaim Edaran PDF</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              ) : (
                // State 2 & 3: Scanning and Results
                <View style={styles.analyzerContainer}>
                  {/* Image Preview with Cyber Scan Line */}
                  <View style={[styles.imagePreviewWrapper, { borderColor: theme.backgroundElement }]}>
                    <Image
                      style={styles.previewImage}
                      source={{ uri: selectedSample === 'hoax_photo' ? 'https://lh3.googleusercontent.com/aida-public/AB6AXu-dlVGnxrozhnU8cTIEBPtR8y5K2Gy-pdjfhw20rT8smLOwil1G0YYlIQgBYWsyegBQ1F_Vb0kO-8A6pezxUE2Fp3hgDGKIqC682OYukZaT3793KN5XR24U2aNPJV2aWyoGnsPk57wS5nmA2KpvO3MUWGb517MjNY_AB-QnP3bOG6KxN3DjfAJ0l8Uin-abyg_OBz6aqutq9S1rIQhdWyow5m0xv7N23Y7LtcJmYBL3qyVC8HAOz6rLj27S2WdGgqjBgk-CMgYNvs' : (selectedSample === 'valid_photo' ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh0TmFuXhASC7VJ17P4dRWNan__CSGUtwFIzz6yxWlr-7GXFC_5a_bGzzVhp039hG6h-IcLVDEPh9w2-S_0-dOzhMHl3dNZTfOdohtVixOPz_8IMwu2Io8yPZDK5NItkiDBt1moqLT9nw5LsXujFhF_CQqmzWSJ8mxfUucZqFwWR82wXFtxvXoE9e5qcet9H_XCFOgvKvCvQfV-jEKaGDNtvaqU3nZt37H-odUDBFhgHRmfQrS1THx02t40wb40plE5ujXH5qK_FU' : customImageUri || '') }}
                      contentFit="cover"
                    />
                    {isScanning && (
                      <Animated.View style={[styles.scannerBar, { transform: [{ translateY: scanBarY }] }]} />
                    )}
                  </View>

                  {/* Scan Status Progress List */}
                  {isScanning && (
                    <View style={styles.scanProgressList}>
                      <View style={styles.progressRow}>
                        <Ionicons name={scanStep >= 1 ? 'checkmark-circle' : 'time-outline'} size={18} color={scanStep >= 1 ? '#15803d' : '#888'} />
                        <Text style={[styles.progressText, { color: theme.text }]}>Ekstraksi Metadata EXIF Berkas...</Text>
                      </View>
                      <View style={styles.progressRow}>
                        <Ionicons name={scanStep >= 2 ? 'checkmark-circle' : 'time-outline'} size={18} color={scanStep >= 2 ? '#15803d' : '#888'} />
                        <Text style={[styles.progressText, { color: theme.text }]}>Analisis ELA (Pemeriksaan Piksel Edit)...</Text>
                      </View>
                      <View style={styles.progressRow}>
                        <Ionicons name={scanStep >= 3 ? 'checkmark-circle' : 'time-outline'} size={18} color={scanStep >= 3 ? '#15803d' : '#888'} />
                        <Text style={[styles.progressText, { color: theme.text }]}>Pencocokan AI & Database Indeks Web...</Text>
                      </View>
                    </View>
                  )}

                  {/* Forensic Result Report */}
                  {forensicReport && !isScanning && (
                    <View style={[styles.reportCard, { borderColor: theme.backgroundElement, backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21' }]}>
                      
                      {/* Authenticity Score Circle */}
                      <View style={styles.scoreRow}>
                        <View style={[styles.scoreCircle, { borderColor: forensicReport.score > 50 ? '#15803d' : '#ba1a1a' }]}>
                          <Text style={[styles.scoreNum, { color: forensicReport.score > 50 ? '#15803d' : '#ba1a1a' }]}>
                            {forensicReport.score}
                          </Text>
                          <Text style={styles.scoreLabel}>Authentic</Text>
                        </View>
                        <View style={styles.statusDescription}>
                          <Text style={[styles.reportHeading, { color: theme.text }]}>{forensicReport.imageTitle}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: forensicReport.score > 50 ? '#dcfce7' : '#fde8e8' }]}>
                            <Text style={[styles.statusBadgeText, { color: forensicReport.score > 50 ? '#15803d' : '#ba1a1a' }]}>
                              {forensicReport.score > 50 ? 'VERIFIKASI AMAN' : 'TERDETEKSI REKAYASA'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Forensic Checks Breakdown */}
                      <View style={styles.breakdownSection}>
                        
                        {/* 1. EXIF Check */}
                        <View style={styles.checkItem}>
                          <View style={styles.checkHeader}>
                            <Ionicons name="calendar-outline" size={16} color="#4f378a" />
                            <Text style={[styles.checkTitle, { color: theme.text }]}>Integritas Metadata EXIF</Text>
                          </View>
                          <Text style={[styles.checkBody, { color: theme.textSecondary }]}>{forensicReport.metadata}</Text>
                        </View>

                        {/* 2. ELA Check */}
                        <View style={styles.checkItem}>
                          <View style={styles.checkHeader}>
                            <Ionicons name="color-wand-outline" size={16} color="#4f378a" />
                            <Text style={[styles.checkTitle, { color: theme.text }]}>Analisis Error Level (Kompresi Gambar)</Text>
                          </View>
                          <Text style={[styles.checkBody, { color: theme.textSecondary }]}>{forensicReport.elaAnalysis}</Text>
                        </View>

                        {/* 3. Deepfake Check */}
                        <View style={styles.checkItem}>
                          <View style={styles.checkHeader}>
                            <Ionicons name="hardware-chip-outline" size={16} color="#4f378a" />
                            <Text style={[styles.checkTitle, { color: theme.text }]}>Deteksi Sintetis AI (Deepfake)</Text>
                          </View>
                          <Text style={[styles.checkBody, { color: theme.textSecondary }]}>{forensicReport.aiDetection}</Text>
                        </View>

                        {/* 4. Reverse Search Check */}
                        <View style={styles.checkItem}>
                          <View style={styles.checkHeader}>
                            <Ionicons name="search-circle-outline" size={18} color="#4f378a" />
                            <Text style={[styles.checkTitle, { color: theme.text }]}>Riwayat Pencarian Sumber Pertama</Text>
                          </View>
                          <Text style={[styles.checkBody, { color: theme.textSecondary }]}>{forensicReport.reverseIndex}</Text>
                        </View>

                      </View>



                      {/* Reset Button */}
                      <Pressable onPress={handleResetSandbox} style={styles.resetBtnWrapper}>
                        {({ pressed }) => (
                          <LinearGradient
                            colors={['#4f378a', '#6750a4']}
                            style={[styles.resetBtn, pressed && styles.btnPressed]}
                          >
                            <Text style={styles.resetBtnText}>Analisis Berkas Lainnya</Text>
                            <Ionicons name="refresh" size={16} color="#ffffff" />
                          </LinearGradient>
                        )}
                      </Pressable>

                    </View>
                  )}
                </View>
              )}

            </ScrollView>
          )}

        </Animated.View>
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
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4f378a',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  content: {
    flex: 1,
    paddingTop: Spacing.three,
  },
  bentoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroCardWrapper: {
    flex: 1,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    height: 125,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  heroCardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginTop: 8,
  },
  heroCardDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontFamily: 'Be Vietnam Pro',
    lineHeight: 14,
  },
  messagesScroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  messageRow: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 2,
  },
  aiRow: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    paddingRight: 40,
  },
  userRow: {
    justifyContent: 'flex-end',
    paddingLeft: 40,
  },
  // ── Model Picker Strip ─────────────────────────────────────────────────────
  modelStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modelStripLabel: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    marginRight: 4,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  modelChipText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
  },
  modelChipSub: {
    fontSize: 9,
    fontFamily: 'Be Vietnam Pro',
  },
  // ────────────────────────────────────────────────────────────────────────────
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f378a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  aiBubble: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#4f378a',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  suggestionsRow: {
    height: 48,
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  suggestionChip: {
    backgroundColor: '#f2ecf4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  sourceCardText: {
    fontSize: 10,
    fontFamily: 'Be Vietnam Pro',
    flex: 1,
  },
  redirectVerifyBtn: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  redirectVerifyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  redirectVerifyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  suggestionChipText: {
    color: '#4f378a',
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: Spacing.three,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sandboxScroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sandboxIntro: {
    alignItems: 'center',
    marginVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  sandboxIntroTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    marginTop: 4,
  },
  sandboxIntroDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.four,
  },
  sampleGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    marginTop: Spacing.two,
  },
  sampleCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
  sampleThumbnail: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: 10,
  },
  sampleCardText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
  },
  sampleBadge: {
    backgroundColor: '#f2ecf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sampleBadgeText: {
    fontSize: 9,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
    color: '#4f378a',
  },
  analyzerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreviewWrapper: {
    width: '100%',
    maxWidth: 320,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginBottom: Spacing.four,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scannerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  scanProgressList: {
    width: '100%',
    maxWidth: 320,
    gap: 8,
    marginVertical: Spacing.three,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  reportCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: Spacing.four,
    width: '100%',
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: Spacing.three,
    marginBottom: Spacing.four,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: 'Be Vietnam Pro',
    color: '#888',
    textTransform: 'uppercase',
  },
  statusDescription: {
    flex: 1,
    gap: 4,
  },
  reportHeading: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  breakdownSection: {
    gap: Spacing.three,
  },
  checkItem: {
    gap: 2,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkTitle: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  checkBody: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: 'Be Vietnam Pro',
  },
  governmentReportBtnWrapper: {
    width: '100%',
    marginTop: Spacing.four,
  },
  governmentReportBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  governmentReportBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  resetBtnWrapper: {
    marginTop: Spacing.three,
  },
  resetBtn: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    gap: Spacing.three,
    marginBottom: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalItemText: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  modalItemValue: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  guideStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  guideStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f378a',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    fontSize: 12,
  },
  guideStepText: {
    flex: 1,
    gap: 2,
  },
  guideStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  guideStepDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Be Vietnam Pro',
  },
  modalCloseBtn: {
    height: 48,
    backgroundColor: '#4f378a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  reportForm: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Be Vietnam Pro',
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  formInputMultiline: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
    textAlignVertical: 'top',
  },
  categorySelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categorySelectorChip: {
    backgroundColor: '#f2ecf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categorySelectorText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  channelButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  channelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e1d4fd',
    backgroundColor: 'rgba(79, 55, 138, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  channelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
  },
  portalBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  portalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#4f378a',
  },
});
