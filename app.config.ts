/* eslint-env node */
// app.config.ts
import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'vafmp-navigator',
  slug: 'vafmp-navigator',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  scheme: 'vafmp',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0b1220',
  },
  updates: { fallbackToCacheTimeout: 0 },
  assetBundlePatterns: ['**/*'],

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourdomain.vafmpnavigator',
  },

  android: {
    package: 'com.yourdomain.vafmpnavigator',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0b1220',
    },
    // leave edge-to-edge to Expo defaults; our tab bar already pads for insets
  },

  // ✅ Correct place for nav bar config (prevents overlap on many Androids)
  androidNavigationBar: {
    backgroundColor: '#0b0b10',
    barStyle: 'light-content', // light icons
    visible: 'sticky-immersive', // keeps bar present but non-janky
  },

  // (Optional) keep status bar readable on dark bg
  androidStatusBar: {
    backgroundColor: '#0b0b10',
    barStyle: 'light-content',
    translucent: true,
  },

  extra: {
    FB_API_KEY: process.env.EXPO_PUBLIC_FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
    FB_PROJECT_ID: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
    FB_SENDER_ID: process.env.EXPO_PUBLIC_FB_SENDER_ID,
    FB_APP_ID: process.env.EXPO_PUBLIC_FB_APP_ID,

    EAS_PROJECT_ID: process.env.EAS_PROJECT_ID,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },

  plugins: [
    'expo-router',
    'expo-font',
    'expo-asset',
    'expo-mail-composer',
    'expo-secure-store',
  ],
});
