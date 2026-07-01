import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme, LogBox } from 'react-native';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

LogBox.ignoreAllLogs();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#121214',
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome index page */}
        <Stack.Screen name="index" />
        {/* Auth pages */}
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="forgot-password" />
        {/* Detail/Modal pages */}
        <Stack.Screen name="news-detail" />
        <Stack.Screen name="favorite" />
        <Stack.Screen name="report-hoax" />
        <Stack.Screen name="guide-detail" />
        {/* Tab route group */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
