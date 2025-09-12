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
  scheme: 'vafmp', // ✅ deep link scheme
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
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0b1220',
    },
    package: 'com.yourdomain.vafmpnavigator',
  },
  web: {
    favicon: './assets/favicon.png',
  },

  // ✅ Use EXPO_PUBLIC_* so they’re readable at runtime
  extra: {
    FB_API_KEY: process.env.EXPO_PUBLIC_FB_API_KEY,
    FB_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
    FB_PROJECT_ID: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
    FB_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
    FB_SENDER_ID: process.env.EXPO_PUBLIC_FB_SENDER_ID,
    FB_APP_ID: process.env.EXPO_PUBLIC_FB_APP_ID,

    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,

    EAS_PROJECT_ID: process.env.EAS_PROJECT_ID,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },

  // ✅ Only plugins that actually need config
// app.config.ts (inside plugins array)
plugins: [
  'expo-font',
  'expo-asset',
  'expo-mail-composer',
],
});