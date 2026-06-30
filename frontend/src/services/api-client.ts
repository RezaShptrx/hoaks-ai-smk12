import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Resolve host address dynamically using Expo's dev server configuration
// This automatically finds your computer's local IP (e.g. 192.168.x.x) for physical devices
// and falls back to 10.0.2.2 for emulator or localhost for web.
const getBaseUrl = () => {
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

export const apiClient = {
  setToken(token: string | null) {
    jwtToken = token;
  },

  getToken() {
    return jwtToken;
  },

  setUser(user: { id: number; email: string; fullName?: string; name?: string } | null) {
    if (user) {
      currentUserId = user.id;
      currentUserEmail = user.email;
      currentUserFullName = user.fullName || user.name || null;
    } else {
      currentUserId = null;
      currentUserEmail = null;
      currentUserFullName = null;
    }
  },

  getUser() {
    return {
      id: currentUserId,
      email: currentUserEmail,
      fullName: currentUserFullName,
    };
  },

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
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
      this.setToken(token);
      this.setUser(result.user);
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
      this.setToken(token);
      this.setUser(result.user);
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
};
