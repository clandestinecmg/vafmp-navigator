import * as React from 'react';
import { Tabs, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../styles/shared';
import { auth, onAuthStateChanged, type User } from '../lib/authApi';

const queryClient = new QueryClient();

function FontWarmup() {
  return <MaterialIcons name="check" size={0.001} color="transparent" />;
}

function TabLayout() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const guard = (next: 'providers' | 'favorites') => ({
    tabPress: (e: { preventDefault: () => void }) => {
      if (!user) {
        e.preventDefault();
        router.push({ pathname: '/(auth)/login', params: { next } });
      }
    },
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
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
        listeners={guard('providers')}
        options={{
          title: 'Providers',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-hospital" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(app)/favorites"
        listeners={guard('favorites')}
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
        name="(app)/profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="badge" size={size} color={color} />
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
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="error" options={{ href: null }} />
      <Tabs.Screen name="(auth)/login" options={{ href: null }} />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <FontWarmup />
        <TabLayout />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
