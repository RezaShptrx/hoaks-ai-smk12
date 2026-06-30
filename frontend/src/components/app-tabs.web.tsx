import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const hiddenTabOptions = {
    href: null,
    tabBarStyle: {
      display: 'none' as const,
      position: 'absolute' as const,
      bottom: -100,
      height: 0,
      borderTopWidth: 0,
      elevation: 0,
    },
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
        tabBarActiveTintColor: '#4f378a',
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      {/* 1. Welcome Page (index) - MUST be first to act as the default initial screen */}
      <Tabs.Screen
        name="index"
        options={hiddenTabOptions}
      />

      {/* 2. Home (Dashboard / News Feed) Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 3. Research Tab */}
      <Tabs.Screen
        name="research"
        options={{
          title: 'Research',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 4. Verify (Fact Checker) Tab */}
      <Tabs.Screen
        name="verify"
        options={{
          title: 'Verify',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark"
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      {/* 5. Explore (AI Assistant) Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="compass"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 6. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hide Auth & News Detail Screens from Tab bar */}
      <Tabs.Screen
        name="login"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="register"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="otp"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="forgot-password"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="news-detail"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="favorite"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="report-hoax"
        options={hiddenTabOptions}
      />
      <Tabs.Screen
        name="guide-detail"
        options={hiddenTabOptions}
      />
    </Tabs>
  );
}
