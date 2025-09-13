#!/usr/bin/env bash
set -euo pipefail

echo "== 1) Ensure folders exist =="
mkdir -p app app/"(app)"

echo "== 2) Write app/index.tsx =="
cat > app/index.tsx <<'TS'
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/(app)/home" />;
}
TS

echo "== 3) Write app/_layout.tsx (Tabs + icon font loader) =="
cat > app/_layout.tsx <<'TS'
import * as React from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { colors } from '../styles/shared';

const queryClient = new QueryClient();

export default function RootLayout() {
  // Load Material Icons TTF so icons render in dev client
  const [fontsLoaded] = useFonts({
    MaterialIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.amber,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="(app)/home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/providers"
          options={{
            title: 'Providers',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="local-hospital" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="star" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/resources"
          options={{
            title: 'Resources',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="menu-book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(app)/crisis"
          options={{
            title: 'Crisis',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="health-and-safety" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(auth)/login"
          options={{
            title: 'Auth',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="login" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {/* DO NOT render <Slot/> here — that would create two navigators and causes
          “Another navigator is already registered for this container.” */}
    </QueryClientProvider>
  );
}
TS

echo "== 4) Write app/(app)/home.tsx (simple BG-wrapped screen) =="
cat > "app/(app)/home.tsx" <<'TS'
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Background from '../../components/Background';
import { shared, colors } from '../../styles/shared';

export default function Home() {
  return (
    <Background>
      <View style={shared.safePad} />
      <View style={styles.container}>
        <Text style={shared.title}>Home</Text>
        <Text style={shared.text}>
          If you can see this, tabs and fonts are loaded. 🎉
        </Text>
        <Text style={shared.text}>
          Next: we’ll wrap other screens and recheck icons in Providers & Favorites.
        </Text>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, flex: 1 },
});
TS

echo "== 5) TypeScript check =="
npx tsc --noEmit

echo "== 6) Clean Metro cache =="
# watchman may not be installed; ignore errors
watchman watch-del-all 2>/dev/null || true
rm -rf "$TMPDIR/metro-"* "$TMPDIR/haste-map-"* 2>/dev/null || true

echo "== 7) Start Expo (clear cache) =="
npx expo start -c
