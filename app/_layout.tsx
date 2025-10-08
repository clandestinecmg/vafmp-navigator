// app/_layout.tsx
import '../lib/global-shim';
import '../lib/ts-extends-polyfill';

import * as React from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { colors } from '../styles/shared';

/** ---------------------------------------------------
 * LayoutInner — handles safe area + auth redirect logic
 * --------------------------------------------------- */
function LayoutInner(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [hydrated, setHydrated] = React.useState(false);

  // Small delay to avoid flicker on first load
  React.useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Redirect logic (auth gating)
  React.useEffect(() => {
    if (!hydrated) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)/home');
    }
  }, [user, hydrated, segments]);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        backgroundColor: colors.bg,
      }}
    >
      {/* Keep Android translucent (for edge-to-edge) and non-translucent on iOS */}
      <StatusBar style="light" translucent={Platform.OS === 'android'} />
      <Slot />
    </View>
  );
}

/** ---------------------------------------------------
 * RootLayout — wraps LayoutInner with global providers
 * --------------------------------------------------- */
export default function RootLayout(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LayoutInner />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
