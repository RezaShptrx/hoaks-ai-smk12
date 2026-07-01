import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Resolve host address dynamically using Expo's dev server configuration
// This automatically finds your computer's local IP (e.g. 192.168.x.x) for physical devices
// and falls back to 10.0.2.2 for emulator or localhost for web.
// NOTE: Jika mengetes dengan HP dari jarak jauh (menggunakan tunnel),
// masukkan URL tunnel backend Anda di sini (contoh: 'https://xxxxx.ngrok-free.app')
const TUNNEL_URL: string = 'https://thin-mugs-obey.loca.lt'; 

const getBaseUrl = () => {
  if (TUNNEL_URL !== '') {
    const cleanUrl = TUNNEL_URL.endsWith('/') ? TUNNEL_URL.slice(0, -1) : TUNNEL_URL;
    return `${cleanUrl}/api`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const hostIp = hostUri ? hostUri.split(':')[0] : null;

  if (hostIp) {
    return `http://${hostIp}:3000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();
console.log('[Veritas API] BASE_URL configured to:', BASE_URL);

// In-memory token storage for the session
let jwtToken: string | null = null;
let currentUserId: number | null = null;
let currentUserEmail: string | null = null;
let currentUserFullName: string | null = null;
let currentUserRole: string | null = null;

export const apiClient = {
  getMediaUrl(path: string) {
    if (!path) return '';
    const base = BASE_URL.replace('/api', '');
    return `${base}${path}`;
  },

  async setToken(token: string | null) {
    jwtToken = token;
    try {
      if (token) {
        await AsyncStorage.setItem('veritas_jwt_token', token);
      } else {
        await AsyncStorage.removeItem('veritas_jwt_token');
      }
    } catch (e) {
      console.warn('Failed to persist token:', e);
    }
  },

  getToken() {
    return jwtToken;
  },

  async setUser(user: { id: number; email: string; fullName?: string; name?: string; role?: string } | null) {
    if (user) {
      currentUserId = user.id;
      currentUserEmail = user.email;
      currentUserFullName = user.fullName || user.name || null;
      currentUserRole = user.role || 'USER';
      try {
        await AsyncStorage.setItem('veritas_user_data', JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to persist user data:', e);
      }
    } else {
      currentUserId = null;
      currentUserEmail = null;
      currentUserFullName = null;
      currentUserRole = null;
      try {
        await AsyncStorage.removeItem('veritas_user_data');
      } catch (e) {
        console.warn('Failed to clear persisted user data:', e);
      }
    }
  },

  getUser() {
    return {
      id: currentUserId,
      email: currentUserEmail,
      fullName: currentUserFullName,
      role: currentUserRole,
    };
  },

  async initSession() {
    try {
      const token = await AsyncStorage.getItem('veritas_jwt_token');
      const userStr = await AsyncStorage.getItem('veritas_user_data');
      if (token) {
        jwtToken = token;
      }
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUserId = user.id;
        currentUserEmail = user.email;
        currentUserFullName = user.fullName || user.name || null;
        currentUserRole = user.role || 'USER';
      }
      // Refresh user details from server if token exists
      if (jwtToken) {
        try {
          const user = await this.fetchCurrentUser();
          if (user) {
            currentUserId = user.id;
            currentUserEmail = user.email;
            currentUserFullName = user.fullName || user.name || null;
            currentUserRole = user.role || 'USER';
            // Save updated user data (with correct role) to AsyncStorage
            await this.setUser(user);
          }
        } catch (err) {
          console.warn('[initSession] Failed to refresh user profile from server:', err);
        }
      }
      return token ? { token, user: this.getUser() } : null;
    } catch (e) {
      console.warn('[apiClient] Failed to load persisted session:', e);
      return null;
    }
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (jwtToken) {
      headers.set('Authorization', `Bearer ${jwtToken}`);
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan sistem.');
      }
      
      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = result?.accessToken || result?.access_token;
    if (result && token) {
      await this.setToken(token);
      await this.setUser(result.user);
    }
    return result;
  },

  async signup(fullName: string, email: string, password: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, email, password }),
    });
  },

  async verifyOtp(email: string, otp: string) {
    const result = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    const token = result?.accessToken || result?.access_token;
    if (result && token) {
      await this.setToken(token);
      await this.setUser(result.user);
    }
    return result;
  },

  // --- News Endpoints ---
  async fetchNews(page = 1, limit = 10, source?: string) {
    const query = `/news?page=${page}&limit=${limit}` + (source && source !== 'All' ? `&source=${source}` : '');
    return this.request(query, {
      method: 'GET',
    });
  },

  // --- Bookmark Endpoints ---
  async fetchBookmarks() {
    return this.request('/news/bookmarks', {
      method: 'GET',
    });
  },

  async addBookmark(article: {
    title: string;
    link: string;
    contentSnippet?: string;
    isoDate?: string;
    imageLarge?: string;
    imageSmall?: string;
  }) {
    return this.request('/news/bookmark', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },

  async removeBookmark(bookmarkId: number) {
    return this.request(`/news/bookmark/${bookmarkId}`, {
      method: 'DELETE',
    });
  },

  async reportHoax(formData: FormData) {
    return this.request('/news/report-hoax', {
      method: 'POST',
      body: formData,
    });
  },

  async aiChat(payload: {
    message: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }) {
    return this.request('/ai-chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getProfile() {
    return this.request('/user/profile', {
      method: 'GET',
    });
  },

  async updateProfile(profileData: {
    username?: string;
    bio?: string;
    phoneNumber?: string;
    address?: string;
    dob?: string;
    occupation?: string;
    interests?: string;
  }) {
    return this.request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async fetchHoaxReports(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/news/hoax-reports${query}`, {
      method: 'GET',
    });
  },

  async reviewHoaxReport(reportId: number, status: 'APPROVED' | 'REJECTED') {
    return this.request(`/news/hoax-reports/${reportId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async fetchCurrentUser() {
    return this.request('/user/me', {
      method: 'GET',
    });
  },
};
