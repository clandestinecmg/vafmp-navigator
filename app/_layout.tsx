// app/_layout.tsx
import '../lib/global-shim';
import '../lib/ts-extends-polyfill';

import * as React from 'react';
import { View, Platform } from 'react-native';
import { Slot } from 'expo-router';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../components/ToastProvider';
import { colors } from '../styles/shared';

function LayoutInner(): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        backgroundColor: colors.bg,
      }}
    >
      {/* Android translucent; iOS non-translucent */}
      <StatusBar style="light" translucent={Platform.OS === 'android'} />
      <Slot />
    </View>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <LayoutInner />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
