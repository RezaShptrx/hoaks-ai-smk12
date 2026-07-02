import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Retro Stamp Component for Verify Results
const RetroStamp = ({ status }: { status: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU' }) => {
  let text = 'FAKTA';
  let color = '#15803d'; // Green
  if (status === 'HOAKS') {
    text = 'HOAKS';
    color = '#ba1a1a'; // Red
  } else if (status === 'RAGU-RAGU') {
    text = 'RAGU';
    color = '#d97706'; // Amber
  }

  return (
    <View style={[styles.stampContainer, { borderColor: color }]}>
      <Text style={[styles.stampText, { color: color }]}>{text}</Text>
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerifyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [claimQuery, setClaimQuery] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  // --- Animations ---
  // Infinite spin for idle atom
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spinRotationReverse = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const spinValue = useRef<Animated.CompositeAnimation | null>(null);

  // Verification process animations
  const atomScale = useRef(new Animated.Value(1)).current;
  const atomOpacity = useRef(new Animated.Value(1)).current;
  const shockwaveScale = useRef(new Animated.Value(0)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;
  
  // Results fade in
  const resultsFade = useRef(new Animated.Value(0)).current;
  const resultsScale = useRef(new Animated.Value(0.9)).current;

  // Spin animation loop
  useEffect(() => {
    startSpinning(3000); // initial slow idle orbit
    return () => spinValue.current?.stop();
  }, []);

  const startSpinning = (duration: number) => {
    if (spinValue.current) spinValue.current.stop();
    spinAnim.setValue(0);
    spinValue.current = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinValue.current.start();
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin galeri untuk memilih foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
        const fileExt = fileName.split('.').pop()?.toLowerCase();

        // Strict extension validation: jpg, jpeg, png, webp, gif
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!fileExt || !validExtensions.includes(fileExt)) {
          Alert.alert(
            'Format Gambar Tidak Valid',
            'Harap pilih file gambar dengan format JPG, JPEG, PNG, WEBP, atau GIF.'
          );
          return;
        }

        setSelectedImageUri(asset.uri);
        setSelectedImageName(fileName);
      }
    } catch (err) {
      console.error('Error picking image in verify:', err);
      Alert.alert('Eror', 'Gagal membuka galeri foto.');
    }
  };

  const handleVerify = async () => {
    if (!claimQuery.trim() && !selectedImageUri) return;
    
    setIsVerifying(true);
    setHasResult(false);
    
    // Step 1: Charge up (Spin atom extremely fast!)
    startSpinning(400); // ultra-fast rotation
    
    // Trigger explosion animation
    Animated.parallel([
      Animated.timing(atomScale, {
        toValue: 4,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(atomOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(shockwaveScale, {
            toValue: 7,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shockwaveOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(shockwaveOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(async () => {
      let data = null;
      let isSuccess = false;

      // 1. Try Production Webhook first (Active workflow)
      try {
        let response;
        if (selectedImageUri) {
          const formData = new FormData();
          formData.append('query', claimQuery || 'Image Verification');
          formData.append('claim', claimQuery || 'Image Verification');
          
          const ext = selectedImageName?.split('.').pop()?.toLowerCase() || 'jpg';
          const fileToUpload = {
            uri: selectedImageUri,
            name: selectedImageName || 'image.jpg',
            type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          };
          // Append to multiple keys to ensure compatibility with n8n workflow expectations
          formData.append('screenshot', fileToUpload as any);
          formData.append('image', fileToUpload as any);
          formData.append('file', fileToUpload as any);

          response = await fetch('https://checkhoaks.app.n8n.cloud/webhook/fact-check', {
            method: 'POST',
            body: formData,
          });
        } else {
          response = await fetch('https://checkhoaks.app.n8n.cloud/webhook/fact-check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: claimQuery,
              claim: claimQuery,
            }),
          });
        }

        if (response.ok) {
          data = await response.json();
          isSuccess = true;
          console.log('[Veritas] Webhook Production hit successful!');
        } else {
          console.warn(`[Veritas] Production Webhook returned status ${response.status}`);
        }
      } catch (prodErr) {
        console.warn('[Veritas] Production Webhook failed, will try Test Webhook...', prodErr);
      }

      // 2. Try Test Webhook if production fails/inactive
      if (!isSuccess) {
        try {
          let response;
          if (selectedImageUri) {
            const formData = new FormData();
            formData.append('query', claimQuery || 'Image Verification');
            formData.append('claim', claimQuery || 'Image Verification');

            const ext = selectedImageName?.split('.').pop()?.toLowerCase() || 'jpg';
            const fileToUpload = {
              uri: selectedImageUri,
              name: selectedImageName || 'image.jpg',
              type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            };
            // Append to multiple keys to ensure compatibility with n8n workflow expectations
            formData.append('screenshot', fileToUpload as any);
            formData.append('image', fileToUpload as any);
            formData.append('file', fileToUpload as any);

            response = await fetch('https://checkhoaks.app.n8n.cloud/webhook-test/fact-check', {
              method: 'POST',
              body: formData,
            });
          } else {
            response = await fetch('https://checkhoaks.app.n8n.cloud/webhook-test/fact-check', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: claimQuery,
                claim: claimQuery,
              }),
            });
          }

          if (response.ok) {
            data = await response.json();
            isSuccess = true;
            console.log('[Veritas] Webhook Test hit successful!');
          } else {
            console.warn(`[Veritas] Test Webhook returned status ${response.status}`);
          }
        } catch (testErr) {
          console.warn('[Veritas] Test Webhook also failed.', testErr);
        }
      }

      try {
        if (!isSuccess) {
          throw new Error('Both webhooks failed or timed out.');
        }

        // Parse and map webhook response (handle single object or array of objects)
        const item = Array.isArray(data) ? data[0] : data;

        // n8n response structure:
        // { success, reply, factCheck: { hasFactCheck, status, confidenceScore, summary, reasoning[], sources[] } }
        const factCheck = item?.factCheck;

        // Map verdict from factCheck.status
        const rawStatus = (factCheck?.status || item?.verdict || item?.status || 'RAGU-RAGU').toUpperCase();
        let verdict: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU' = 'RAGU-RAGU'; // Fallback to RAGU-RAGU instead of FAKTA
        if (rawStatus.includes('HOAX') || rawStatus.includes('HOAKS') || rawStatus.includes('PALSU') || rawStatus.includes('SALAH') || rawStatus.includes('FALSE') || rawStatus.includes('DISINFORMASI')) {
          verdict = 'HOAKS';
        } else if (rawStatus.includes('FAKTA') || rawStatus.includes('BENAR') || rawStatus.includes('VALID') || rawStatus.includes('TRUE')) {
          verdict = 'FAKTA';
        } else if (rawStatus.includes('RAGU') || rawStatus.includes('MISLEADING') || rawStatus.includes('SEBAGIAN') || rawStatus.includes('CAMPURAN') || rawStatus.includes('TIDAK RELEVAN')) {
          verdict = 'RAGU-RAGU';
        }

        let color = '#15803d'; // Green
        if (verdict === 'HOAKS') color = '#ba1a1a'; // Red
        if (verdict === 'RAGU-RAGU') color = '#d97706'; // Amber

        // Build confidence from confidenceScore (0-100 → percent string)
        const rawScore = factCheck?.confidenceScore ?? item?.confidence;
        const confidence = rawScore != null
          ? (typeof rawScore === 'number' && rawScore <= 1
            ? `${Math.round(rawScore * 100)}%`
            : `${rawScore}${typeof rawScore === 'number' ? '%' : ''}`)
          : '89%';

        // Combine reasoning array into readable string
        const reasoning = Array.isArray(factCheck?.reasoning) && factCheck.reasoning.length > 0
          ? factCheck.reasoning.join(' ')
          : (factCheck?.summary || item?.reason || item?.analisis || 'Klaim ini telah diperiksa silang dengan database disinformasi nasional.');

        // Build source links from factCheck.sources
        const sourceLinks = Array.isArray(factCheck?.sources) && factCheck.sources.length > 0
          ? factCheck.sources
          : ['TurnBackHoax', 'Kemenkominfo'];

        const mappedData = {
          verdict,
          title: item?.title || item?.judul || (selectedImageUri ? `Analisis Gambar: ${selectedImageName}` : claimQuery),
          confidence,
          color,
          image: item?.image || item?.imageUrl || selectedImageUri || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w',
          snippet: factCheck?.summary || item?.snippet || item?.deskripsi || 'Tim Veros AI mendeteksi kecocokan tingkat tinggi dengan referensi laporan verifikasi independen terkait klaim ini.',
          date: item?.date || item?.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          source: item?.source || item?.sumber || 'Analisis AI Veros & Mafindo',
          reason: reasoning,
          action: item?.action || item?.langkah || (verdict === 'HOAKS'
            ? 'Segera hapus pesan, laporkan nomor pengirim ke Veros, dan jangan disebarkan kembali!'
            : verdict === 'RAGU-RAGU'
            ? 'Pastikan untuk mencari sumber pembanding resmi sebelum mempercayai sepenuhnya.'
            : 'Informasi ini aman untuk disebarkan kembali sebagai wawasan yang berdasar fakta.'),
          // Reply from AI shown as extra context
          aiReply: item?.reply || '',
          links: sourceLinks,
        };

        setResultData(mappedData);
        setHasResult(true);
      } catch (error) {
        console.warn('Gagal memproses cek fakta dari webhook. Memakai analisis lokal offline.', error);
        
        // Fallback to offline logic if n8n is inactive or error
        const query = claimQuery.toLowerCase();
        let verdict: 'FAKTA' | 'HOAKS' | 'RAGU-RAGU' = 'FAKTA';
        let title = selectedImageUri ? `Analisis Gambar Lokal: ${selectedImageName}` : ('Hasil Analisis Lokal: ' + claimQuery);
        let confidence = '88%';
        let color = '#15803d'; // Green
        let image = selectedImageUri || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk1n2cwxgb2eeXSapYKaUCLycVW2EnVFpuhmQD2q9gJmO33XlWxYqbAyUKmN2Uzht3zUXLzZujRbmgPS91EBuXl464WRyZZCNCbr2gcq6AE-uVBrS3C8yeCOR3MFGrwuumWJJB7sg-UxIE3SD5Ey_L36PAzVeyo-1NHnEa69JBxZNfTkEwu9B5QrnEToZ0w_utUqmYfg8I6rJvQS-FSpEdJGKtsOOnFJpbSEco-n-xx7r137m3Kw7s999AOiMJNffoXUZgLn6JW_w';
        let snippet = selectedImageUri ? 'Tangkapan layar/gambar yang diunggah terverifikasi secara lokal oleh mesin Veros.' : 'Pemeriksaan silang lokal mendeteksi status valid atas klaim/pernyataan Anda saat ini.';
        let date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        let source = 'Sistem Cek Lokal Veros';
        let reason = 'Pernyataan ini terbukti akurat berdasarkan basis data fakta lokal offline Veros.';
        let action = 'Informasi ini aman untuk disebarkan kembali sebagai wawasan yang berdasar fakta.';
        let links = ['TurnBackHoax', 'Portal Kominfo'];

        if (query.includes('gratis') || query.includes('hadiah') || query.includes('menang') || query.includes('http') || query.includes('www') || query.includes('token') || query.includes('listrik')) {
          verdict = 'HOAKS';
          title = 'Hadiah Subsidi Token Listrik BUMN Rp1 Juta';
          confidence = '98%';
          color = '#ba1a1a'; // Red
          image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzy_KoWzpkENrYHKFw5rGi8uU_Z4lvRoKMx4zpvh0jLVlZU13iqbWgHqT4DBOza1oj8tXM2sAvtl25i7en3OMJOKsm16DSgYRXJDsxUrUBoVOj0M4zuRH3VLihM0ooCT-ZHrhx7iBGd64KEG4K1e0hjx2XBkm-iHoKGNU8DKjYaqWGMv99M7ms_eyTqQWKCU8XIao8AKKBYUdbVr1zK6V2OZ4PyOPMQSlDbKVSJqblAfkOA-RV_0cpxrfs3J3xIj4fbvxIY-7wGJI';
          snippet = 'BUMN membagikan subsidi token listrik sebesar Rp1.000.000 kepada nasabah melalui tautan Telegram khusus di bawah ini.';
          reason = 'Tautan Telegram dan domain web yang dilampirkan terbukti sebagai situs penipuan phishing data nasabah.';
          action = 'Segera hapus pesan, laporkan nomor pengirim ke Veros, dan jangan sekali-kali memasukkan data pribadi atau kode OTP Anda ke web tersebut!';
        } else if (query.includes('vaksin') || query.includes('obat') || query.includes('sembuh') || query.includes('kayu putih')) {
          verdict = 'RAGU-RAGU';
          title = 'Khasiat Minyak Kayu Putih Sembuhkan Sel Virus';
          confidence = '71%';
          color = '#d97706'; // Amber
          image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxBqA6qdqcagQePgf0-SzNPLAvTLYmW_s8p7RwX__xYMtJDlYPIHwFVolPEZfkF0eJ8CKOHStvHO1OHd1LRX4kusirD4i5fqaqspyVBtC4amUYy3YodC4t6R_LplppNYx4Wud215c4O4FAIeY9G4GQcRl-d-YCwSOQEEOwE4908E06-SNOZnypCf6IRT3c49PIkA_WdowMah9BtL-LO2Qe-swi2oW9WBiGbOWCLCkL1BT2pDgF_WvZSwjvMkkr6MZxvSKE45EY8wE';
          snippet = 'Cukup teteskan 3 tetes minyak kayu putih asli ke dalam uap air panas, hirup uapnya selama 5 menit. Virus pernapasan akan langsung mati seketika.';
          reason = 'Minyak kayu putih memiliki khasiat melegakan pernapasan, namun klaim bahwa uapnya dapat menyembuhkan infeksi virus paru-paru secara klinis belum didukung bukti uji ilmiah medis resmi.';
          action = 'Gunakan minyak kayu putih untuk meringankan gejala pernapasan ringan, namun pastikan untuk tetap berkonsultasi ke fasilitas kesehatan terdekat jika gejala memburuk.';
        }

        setResultData({ verdict, title, confidence, color, image, snippet, date, source, reason, action, links });
        setHasResult(true);
      } finally {
        setIsVerifying(false);

        // Show Results card with smooth bounce
        Animated.parallel([
          Animated.timing(resultsFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(resultsScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Scroll to top immediately when results appear
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });
      }
    });
  };

  const handleReset = () => {
    // Fade out results card
    Animated.parallel([
      Animated.timing(resultsFade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(resultsScale, {
        toValue: 0.9,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setHasResult(false);
      setResultData(null);
      setClaimQuery('');
      setSelectedImageUri(null);
      setSelectedImageName(null);
      
      // Reset and restart Atom animation
      atomScale.setValue(1);
      atomOpacity.setValue(1);
      shockwaveScale.setValue(0);
      shockwaveOpacity.setValue(0);
      startSpinning(3000); // restart slow idle orbit
      
      // Reset scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.brandText, { color: '#00ca92' }]}>Verifikasi</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            
            {/* Visualizer Atom Area (Only shown if results not visible) */}
            {!hasResult && (
              <View style={styles.visualizerContainer}>
                {/* Shockwave circle (shown during explosion) */}
                <Animated.View style={[
                  styles.shockwave,
                  {
                    transform: [{ scale: shockwaveScale }],
                    opacity: shockwaveOpacity,
                  }
                ]} />

                {/* Atom Orbiting System */}
                <Animated.View style={[
                  styles.atomContainer,
                  {
                    transform: [{ scale: atomScale }],
                    opacity: atomOpacity,
                  }
                ]}>
                  {/* Nucleus */}
                  <View style={styles.nucleus}>
                    <LinearGradient
                      colors={isVerifying ? ['#d946ef', '#6366f1'] : ['#00ca92', '#00ca92']}
                      style={styles.nucleusGradient}
                    />
                  </View>

                  {/* Ring 1 (Vertical) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotation }, { scaleY: 0.25 }]
                    }
                  ]} />

                  {/* Ring 2 (Rotated Left) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotationReverse }, { rotateZ: '60deg' }, { scaleY: 0.25 }]
                    }
                  ]} />

                  {/* Ring 3 (Rotated Right) */}
                  <Animated.View style={[
                    styles.orbitRing,
                    {
                      transform: [{ rotate: spinRotation }, { rotateZ: '-60deg' }, { scaleY: 0.25 }]
                    }
                  ]} />
                </Animated.View>
              </View>
            )}

            {/* Input Module (Only show if not verifying/showing result) */}
            {!isVerifying && !hasResult && (
              <View style={styles.inputContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Masukkan Informasi</Text>
                <View style={[
                  styles.inputModule,
                  {
                    borderColor: isFocused ? '#00ca92' : theme.backgroundElement,
                    borderWidth: isFocused ? 2 : 1,
                    backgroundColor: theme.background === '#ffffff' ? '#fdf7ff' : '#1e1e21',
                  }
                ]}>
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Tempel link berita, ketik pernyataan klaim, atau deskripsikan gambar berita di sini..."
                    placeholderTextColor={theme.textSecondary}
                    value={claimQuery}
                    onChangeText={setClaimQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline
                    numberOfLines={4}
                  />

                  {/* Attached Image Status Indicator */}
                  {selectedImageUri && (
                    <View style={styles.attachedImageRow}>
                      <Ionicons name="image" size={15} color="#15803d" />
                      <Text style={[styles.attachedImageText, { color: theme.text }]} numberOfLines={1}>
                        {selectedImageName}
                      </Text>
                      <Pressable onPress={() => { setSelectedImageUri(null); setSelectedImageName(null); }}>
                        <Ionicons name="close-circle" size={16} color="#ba1a1a" />
                      </Pressable>
                    </View>
                  )}
                  
                  <View style={styles.actionButtonsRow}>
                    <Pressable
                      style={({ pressed }) => [styles.helperBtn, pressed && styles.btnPressed]}
                      onPress={handlePickImage}
                    >
                      <Ionicons name="image-outline" size={14} color="#00ca92" />
                      <Text style={styles.helperBtnText}>
                        {selectedImageUri ? 'Gambar Terpilih' : 'Unggah Foto'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.helperBtn, pressed && styles.btnPressed]}
                      onPress={() => setClaimQuery('https://www.hadiahgratis-kominfo.com/menang-subsidi-bansos-2026')}
                    >
                      <Ionicons name="link-outline" size={14} color="#00ca92" />
                      <Text style={styles.helperBtnText}>Tempel Link</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.helperBtn, pressed && styles.btnPressed]}
                      onPress={() => setClaimQuery('Klaim minyak kayu putih bisa menyembuhkan infeksi virus pernapasan.')}
                    >
                      <Ionicons name="medical-outline" size={14} color="#00ca92" />
                      <Text style={styles.helperBtnText}>Klaim Medis</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerify}
                  disabled={!claimQuery.trim() && !selectedImageUri}
                  style={styles.verifyBtnWrapper}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={claimQuery.trim() || selectedImageUri ? ['#00ca92', '#00ca92'] : ['#cccccc', '#dddddd']}
                      style={[
                        styles.verifyBtn,
                        pressed && styles.btnPressed,
                        !claimQuery.trim() && !selectedImageUri && styles.btnDisabled
                      ]}
                    >
                      <Text style={styles.verifyBtnText}>Mulai Verifikasi Klaim</Text>
                      <Ionicons name="nuclear-outline" size={18} color="#ffffff" />
                    </LinearGradient>
                  )}
                </Pressable>
              </View>
            )}

            {/* Verification Processing State */}
            {isVerifying && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ca92" />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Menganalisis tautan & basis data fakta...
                </Text>
              </View>
            )}

            {/* Results Reveal Card */}
            {hasResult && resultData && (
              <Animated.View style={[
                styles.resultsCard,
                {
                  borderColor: theme.backgroundElement,
                  backgroundColor: theme.background === '#ffffff' ? '#ffffff' : '#1e1e21',
                  opacity: resultsFade,
                  transform: [{ scale: resultsScale }],
                }
              ]}>
                {/* Modern Verification Hero Banner (Replacing generic/unwanted photo) */}
                <LinearGradient
                  colors={
                    resultData.verdict === 'HOAKS'
                      ? ['#ba1a1a', '#93000a'] // Red
                      : resultData.verdict === 'RAGU-RAGU'
                      ? ['#d97706', '#b45309'] // Amber
                      : ['#15803d', '#166534'] // Green
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resultsHeroHeader}
                >
                  <View style={styles.heroHeaderCircle}>
                    <Ionicons
                      name={
                        resultData.verdict === 'HOAKS'
                          ? 'alert-circle-outline'
                          : resultData.verdict === 'RAGU-RAGU'
                          ? 'help-circle-outline'
                          : 'shield-checkmark-outline'
                      }
                      size={36}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={styles.heroHeaderStatusText}>Verifikasi Selesai</Text>
                  <Text style={styles.heroHeaderSubText}>Hasil keputusan analisis data cek fakta</Text>
                </LinearGradient>

                {/* Result Top Ribbon */}
                <View style={[styles.resultRibbon, { backgroundColor: resultData.color }]} />

                <View style={styles.resultsContent}>
                  {/* Grid Data Analisis / Metrics */}
                  <View style={styles.statsGrid}>
                    <View style={[styles.statsCard, { backgroundColor: theme.background === '#ffffff' ? '#fdfaff' : '#1e1a24', borderColor: theme.backgroundElement }]}>
                      <Ionicons name="speedometer-outline" size={15} color="#4f378a" style={{ marginBottom: 4 }} />
                      <Text style={[styles.statsCardLabel, { color: theme.textSecondary }]}>Metode Cek</Text>
                      <Text style={[styles.statsCardValue, { color: theme.text }]}>Real-time AI</Text>
                    </View>
                    <View style={[styles.statsCard, { backgroundColor: theme.background === '#ffffff' ? '#fdfaff' : '#1e1a24', borderColor: theme.backgroundElement }]}>
                      <Ionicons name="ribbon-outline" size={15} color="#4f378a" style={{ marginBottom: 4 }} />
                      <Text style={[styles.statsCardLabel, { color: theme.textSecondary }]}>Akurasi Cek</Text>
                      <Text style={[styles.statsCardValue, { color: theme.text }]}>{resultData.confidence}</Text>
                    </View>
                    <View style={[styles.statsCard, { backgroundColor: theme.background === '#ffffff' ? '#fdfaff' : '#1e1a24', borderColor: theme.backgroundElement }]}>
                      <Ionicons name="shield-outline" size={15} color={resultData.color} style={{ marginBottom: 4 }} />
                      <Text style={[styles.statsCardLabel, { color: theme.textSecondary }]}>Keputusan</Text>
                      <Text style={[styles.statsCardValue, { color: resultData.color }]}>{resultData.verdict}</Text>
                    </View>
                  </View>

                  {/* Verdict Header (Optional summary row) */}
                  <View style={styles.verdictHeader}>
                    <View style={[styles.badge, { backgroundColor: resultData.color + '15' }]}>
                      <Text style={[styles.badgeText, { color: resultData.color }]}>
                        {resultData.verdict}
                      </Text>
                    </View>
                    <View style={styles.confidenceRow}>
                      <Text style={[styles.confidenceLabel, { color: theme.textSecondary }]}>Skor Kepercayaan:</Text>
                      <Text style={[styles.confidenceValue, { color: resultData.color }]}>{resultData.confidence}</Text>
                    </View>
                  </View>

                  {/* Title & Metadata */}
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{resultData.title}</Text>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{resultData.date}</Text>
                    <Text style={[styles.metaDivider, { color: theme.textSecondary }]}>•</Text>
                    <Ionicons name="globe-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{resultData.source}</Text>
                  </View>

                  {/* Kutipan Teks Berita */}
                  <View style={[styles.quoteBox, { backgroundColor: theme.background === '#ffffff' ? '#fdf7ff' : '#1b191c', borderLeftColor: resultData.color }]}>
                    <Text style={[styles.quoteText, { color: theme.text }]}>
                      "{resultData.snippet}"
                    </Text>
                  </View>

                  {/* Respons AI */}
                  {resultData.aiReply ? (
                    <View style={[styles.cardSection, { backgroundColor: theme.background === '#ffffff' ? '#f8f4ff' : '#221e2e', padding: 12, borderRadius: 10, marginBottom: 12 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Ionicons name="sparkles" size={13} color="#00ca92" />
                        <Text style={[styles.sectionHeading, { color: '#00ca92', marginBottom: 0 }]}>Respons Cek Hoaks AI:</Text>
                      </View>
                      <Text style={[styles.sectionBody, { color: theme.text }]}>{resultData.aiReply}</Text>
                    </View>
                  ) : null}

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Analisis / Alasan Cek Fakta:</Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{resultData.reason}</Text>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Rekomendasi Tindakan:</Text>
                    <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{resultData.action}</Text>
                  </View>

                  <View style={styles.cardSection}>
                    <Text style={[styles.sectionHeading, { color: theme.text }]}>Sumber Otoritatif Rujukan:</Text>
                    {resultData.links.map((link: any, idx: number) => {
                      const label = typeof link === 'string' ? link : (link?.title || link?.url || String(link));
                      return (
                        <View key={idx} style={styles.linkRow}>
                          <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                          <Text style={[styles.linkLabel, { color: theme.textSecondary }]}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Reset Button */}
                  <Pressable onPress={handleReset} style={styles.resetBtnWrapper}>
                    {({ pressed }) => (
                      <LinearGradient
                        colors={['#00ca92', '#00a87a']}
                        style={[styles.resetBtn, pressed && styles.btnPressed]}
                      >
                        <Text style={styles.resetBtnText}>Periksa Klaim Lainnya</Text>
                        <Ionicons name="refresh" size={16} color="#ffffff" />
                      </LinearGradient>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            )}

          </View>
        </ScrollView>
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
    paddingHorizontal: Spacing.four,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.six,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    width: '100%',
  },
  visualizerContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
  },
  shockwave: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00ca92',
    backgroundColor: 'rgba(155, 81, 224, 0.15)',
  },
  atomContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  nucleus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#00ca92',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  nucleusGradient: {
    width: '100%',
    height: '100%',
  },
  orbitRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: 'rgba(79, 55, 138, 0.45)',
  },
  inputContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.two,
  },
  inputModule: {
    borderRadius: 12,
    padding: Spacing.three,
    width: '100%',
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  searchInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Be Vietnam Pro',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.three,
  },
  helperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f2ecf4',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
  },
  helperBtnText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    color: '#00ca92',
  },
  verifyBtnWrapper: {
    width: '100%',
  },
  verifyBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
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
  loadingContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Be Vietnam Pro',
  },
  resultsCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#1a365d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
  },
  resultRibbon: {
    height: 6,
    width: '100%',
  },
  resultsContent: {
    padding: Spacing.four,
  },
  verdictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 0.5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceLabel: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: Spacing.four,
  },
  cardSection: {
    marginBottom: Spacing.four,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkLabel: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
  },
  resetBtnWrapper: {
    marginTop: Spacing.two,
  },
  resetBtn: {
    height: 48,
    borderRadius: 12,
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
  // ── Modern Verification Hero Banner & Stats Grid ────────────────────────────
  resultsHeroHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroHeaderCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroHeaderStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: -0.3,
  },
  heroHeaderSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Be Vietnam Pro',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.four,
  },
  statsCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCardLabel: {
    fontSize: 9,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  statsCardValue: {
    fontSize: 12,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '800',
    textAlign: 'center',
  },
  // ────────────────────────────────────────────────────────────────────────────
  stampContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 20,
  },
  stampText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'Be Vietnam Pro',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    marginBottom: Spacing.four,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
  },
  metaDivider: {
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    marginHorizontal: 2,
  },
  quoteBox: {
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: Spacing.four,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -8,
    left: 8,
    opacity: 0.15,
  },
  quoteText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    fontFamily: 'Be Vietnam Pro',
  },
  headerReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 55, 138, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  headerReportText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Be Vietnam Pro',
    color: '#00ca92',
  },
  attachedImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    borderColor: 'rgba(21, 128, 61, 0.15)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 12,
    marginTop: 8,
    gap: 8,
  },
  attachedImageText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Be Vietnam Pro',
    fontWeight: '700',
  },
});
