import { Tabs, usePathname } from 'expo-router';
import { useColorScheme, BackHandler } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

// Screens that are "root" tab screens — pressing back here should exit the app
const ROOT_TAB_PATHS = ['/home', '/research', '/verify', '/explore', '/profile'];

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const pathname = usePathname();

  // Handle Android hardware back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ROOT_TAB_PATHS.includes(pathname)) {
        // On a root tab: exit the app instead of crashing or going back
        BackHandler.exitApp();
        return true; // consumed
      }
      return false; // not consumed, let expo-router handle
    });
    return () => subscription.remove();
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        tabBarActiveTintColor: '#00ca92',
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      
      {/* 1. Home (Dashboard / News Feed) Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 2. Research Tab */}
      <Tabs.Screen
        name="research"
        options={{
          title: 'Riset',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 3. Verify (Fact Checker) Tab */}
      <Tabs.Screen
        name="verify"
        options={{
          title: 'Verifikasi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 4. Explore (AI Assistant) Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Jelajahi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="compass"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
