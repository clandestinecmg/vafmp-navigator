// app/_layout.tsx
import * as React from 'react';
import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '../styles/shared';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser ?? null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const uid = user?.uid ?? null;

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.amber,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
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
            // Show Favorites only when logged in
            href: uid ? undefined : null,
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
            // Hide Auth when logged in
            href: uid ? null : undefined,
          }}
        />
      </Tabs>
      {/* No <Slot /> here in a Tabs layout */}
    </QueryClientProvider>
  );
}